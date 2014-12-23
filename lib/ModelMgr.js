/**
 The MIT License (MIT)

 Copyright (c) 2014 mekhonoshyn

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

/**
 * created by mekhonoshyn on 14-Nov-14.
 */

function _ModelMgr() {}

(function _ModelMgrInitializer() {
    var _sharedModels = {},
        _defaultOptions = [
            'modelMayReadOn',
            'modelMayWrite',
            'readConverter',
            'writeConverter',
            'doOnUnbind',
            'writeInitial'
        ];

    var _verbose = true;

    function _DataModel(fieldsDef) {
        var _binds = {};

        fieldsDef
            && fieldsDef.length
            && fieldsDef.forEach(function _forEach(fieldDef) {
                var _name = fieldDef.name,
                    _value = fieldDef.initialValue !== undefined ? fieldDef.initialValue : Function('return (new ' + fieldDef.type + ').valueOf()')(),
                    _listeners = [];

                _binds[_name] = _listeners;

                _define(this, _name, function _getValue() {
                    return _value;
                }, function _setValue(value) {
                    var _key;

                    if (_isArray(value)) {
                        _value = value[0];

                        _key = value[1];
                    } else {
                        _value = value;
                    }

                    _listeners.forEach(function _forEach(listener) {
                        listener.key !== _key && listener.writeData();
                    });
                });
            }, this);

        return {
            unbindFns: {},
            binds: _binds,
            instance: this
        };
    }

    /**
     * bind object {target} to model {modelData} with options {options}
     */
    _define(_ModelMgr, 'bindToModel', function _doBindToModel(target, modelData, mapping, options) {
        _ModelMgr.factory(modelData);

        Object.keys(mapping).forEach(function _forEach(mappingKey) {
            var _mappingItem = mapping[mappingKey];

            _mappingItem.propName || (_mappingItem.propName = mappingKey);

            options
                && _defaultOptions.forEach(function _forEach(optionKey) {
                    if (_mappingItem[optionKey] === undefined) {
                        _mappingItem[optionKey] = options[optionKey];
                    }
                });
        });

        var _unbindModelFieldFns = modelData.def.fields.map(function _map(modelFieldDef) {
            var _mapping = mapping[modelFieldDef.name];

            if (!_mapping) {
                return;
            }

            if (!_mapping.modelMayWrite && !_mapping.modelMayReadOn) {
                return;
            }

            _mapping.inScopeOfModel = true;

            return _ModelMgr.bindToField(_mapping.propName, target, modelFieldDef.name, modelData.name, _mapping);
        });

        var _modelUnbindFns,
            _unbindModelFieldFnsLength = _unbindModelFieldFns.length;

        _unbindModelFieldFnsLength
            && (_modelUnbindFns = _sharedModels[modelData.name].unbindFns)
            && (_modelUnbindFns[options.unbindingKey] = function _unbindFromModelFn() {
                for (var i = 0; i < _unbindModelFieldFnsLength; i++) {
                    _unbindModelFieldFns[i]();
                }

                _unbindModelFieldFns.length = 0;
            })
            && _verbose
            && _print('object [id:', options.unbindingKey, '] bound to model "', modelData.name, '" (current connections number: ', Object.keys(_modelUnbindFns).length, ')');
    });

    /**
     * bind property {targetPropName} of object {target} to field {modelFieldName} of model {modelName} with options {options}
     */
    _define(_ModelMgr, 'bindToField', function _doBindToField(targetPropName, target, modelFieldName, modelName, options) {
        var _modelObject = _sharedModels[modelName],
            _modelInstance = _modelObject.instance,
            _fieldBindingKey = _hash(),
            _listeners = _modelObject.binds[modelFieldName],
            _writeData = options.writeConverter ? function _convertAndWrite() {
                target[targetPropName] = options.writeConverter(_modelInstance[modelFieldName]);
            } : function _simpleWrite() {
                target[targetPropName] = _modelInstance[modelFieldName];
            },
            _removeEventListenerFns = options.modelMayReadOn && [].concat(options.modelMayReadOn).map(function _map(eventName) {
                var _value = [ 0, _fieldBindingKey ],
                    _handler = options.readConverter ? function _convertAndRead() {
                        _value[0] = options.readConverter(target[targetPropName]);

                        _modelInstance[modelFieldName] = _value;
                    } : function _simpleRead() {
                        _value[0] = target[targetPropName];

                        _modelInstance[modelFieldName] = _value;
                    };

                target.addEventListener(eventName, _handler);

                _verbose
                    && _print('add "on-', eventName, '" reader for field "', modelFieldName, ':', _fieldBindingKey, '" on property "', targetPropName, '"');

                return function _removeEventListener() {
                    target.removeEventListener(eventName, _handler);

                    _verbose
                        && _print('remove "on-', eventName, '" reader for field "', modelFieldName, ':', _fieldBindingKey, '" on property "', targetPropName, '"');
                };
            });

        options.modelMayWrite
            && (_listeners[_listeners.length] = {
                key: _fieldBindingKey,
                target: target,
                writeData: _writeData
            })
            && _verbose
            && _print('add writer for field "', modelFieldName, ':', _fieldBindingKey, '" on property "', targetPropName, '"');

        options.modelMayWrite && options.writeInitial && _writeData();

        function _unbindFromFieldFn() {
            if (options.modelMayWrite) {
                var _len = _listeners.length,
                    _li = -1;

                if (_len) {
                    for (var i = 0; i < _len; i++) {
                        if (_listeners[i].key === _fieldBindingKey) {
                            _li = i;

                            break;
                        }
                    }

                    if (~_li) {
                        while (_li < _len) {
                            _listeners[_li] = _listeners[++_li];
                        }

                        _listeners.length--;
                    }
                }

                _verbose
                    && _print('remove writer for field "', modelFieldName, ':', _fieldBindingKey, '" on property "', targetPropName, '"');
            }

            _removeEventListenerFns
                && _removeEventListenerFns.forEach(function _forEach(removeListener) {
                    removeListener();
                });

            options.doOnUnbind
                && options.doOnUnbind(targetPropName, modelFieldName);
        }

        if (options.inScopeOfModel) {
            return _unbindFromFieldFn;
        } else {
            _modelObject.unbindFns[_fieldBindingKey] = _unbindFromFieldFn;

            return function _unbindNotScopedField() {
                _ModelMgr.unbind(modelName, _fieldBindingKey);
            }
        }
    });

    _define(_ModelMgr, 'invalidate', function _doInvalidateModel(modelName, target, fieldNames) {
        var _modelObjectBinds = _sharedModels[modelName].binds;

        ((fieldNames && fieldNames.length) ? fieldNames : Object.keys(_modelObjectBinds)).forEach(function _forEach(fieldName) {
            _modelObjectBinds[fieldName].forEach(function _forEach(listener) {
                (!target || listener.target === target) && listener.writeData();
            });
        });
    });

    _define(_ModelMgr, 'boundTo', function _getModelsNamesBoundTo(binderID) {
        return Object.keys(_sharedModels).filter(function _filter(modelName) {
            return _sharedModels[modelName].unbindFns[binderID];
        });
    });

    _define(_ModelMgr, 'unbind', function _doUnbindModel(modelName, binderID) {
        var _modelUnbindFns = _sharedModels[modelName].unbindFns;

        _modelUnbindFns[binderID] && (_modelUnbindFns[binderID]() || delete _modelUnbindFns[binderID]);

        var _bindersLeft = Object.keys(_modelUnbindFns).length;

        if (!_bindersLeft) {
            _verbose
                && _print('object [id:', binderID, '] unbound from model "', modelName, '"');

            delete _sharedModels[modelName];

            _verbose
                && _print('model "', modelName, '" destroyed as unclaimed');
        } else {
            _verbose
                && _print('object [id:', binderID, '] unbound from model "', modelName, '" (', _bindersLeft, ' more left)');
        }
    });

    _define(_ModelMgr, 'factory', function _runFactory(modelData) {
        if (_sharedModels[modelData.name]) {
            return;
        }

        _sharedModels[modelData.name] = new _DataModel(modelData.def.fields);

        _verbose
            && _print('model "', modelData.name, '" added to list of shared models');
    });

    _define(_ModelMgr, 'verbose', function _setVerbosity(verbose) {
        _verbose = verbose;
    });
}());