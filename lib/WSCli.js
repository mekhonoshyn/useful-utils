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
 * Created by mekhonoshyn on 19-Nov-14.
 */

function _WSWrapper(socket, options) {
    var _handlers = {
            unknown: function _defaultHandler(data) {
                _print('run default message handler (', JSON.stringify(data), ')');
            }
        },
        _queue = [];

    _define(socket, 'send', function _send(data) {
        if (socket.readyState === 1) {
//            _print('socket is sending message: ', JSON.stringify(data));

            WebSocket.prototype.send.call(socket, JSON.stringify(data));
        } else {
            _print('socket queue length: ', (_queue[_queue.length] = data) && _queue.length);
        }
    });

    _define(socket, 'addHandler', _define.bind(null, _handlers));

    _define(socket, 'onOpen'.toLowerCase(), function _onOpen() {
        _print('socket opened: ', JSON.stringify('/* put some important data here */'));

        if (_queue.length) {
            var _lQueue = _queue.slice();

            _queue.length = 0;

            _lQueue.forEach(function _forEach(qItem) {
                socket.send(qItem);
            });
        }
    });

    _define(socket, 'onClose'.toLowerCase(), function _onClose() {
        _print('socket closed: ', JSON.stringify('/* put some important data here */'));
    });

    _define(socket, 'onError'.toLowerCase(), function _onError() {
        _print('error occurred: ', JSON.stringify('/* put some important data here */'));
    });

    _define(socket, 'onMessage'.toLowerCase(), function _onMessage(event) {
        var _message = JSON.parse(event.data);

//        _print('socket received message: ', JSON.stringify(_message));

        if (_handlers[_message.type]) {
            _handlers[_message.type].call(socket, _message.data)
        } else {
            _handlers.unknown.call(socket, _message);
        }
    });

    if (options.makeBindable) {
        (function () {
            var _callbacks = {},
                _bi = new _EventTarget,
                _setAndNotify = {};

            function _send(type, data) {
                socket.send({
                    type: type,
                    data: data
                });
            }

            function _unbindFn(modelName) {
                return function () {
                    if (socket.boundTo(modelName)) {
                        _send('model:unbind', modelName);

                        socket.unbindModel(modelName);
                    } else {
                        _print('socket is not bound to model "', modelName, '" anymore');
                    }
                };
            }

            _define(socket, 'requireModel', function _getModel(modelName, dataFlow, callback) {
                var _isAlreadyBound = socket.boundTo(modelName);

                if (_isAlreadyBound) {
                    _print('socket is already bound to model "', modelName, '"');

                    callback(_unbindFn(modelName));

                    _send('model:invalidate', modelName);

                    return;
                }

                var _existingCallback = _callbacks[modelName];

                if (_existingCallback) {
                    _callbacks[modelName] = function (unbindFn) {
                        _existingCallback(unbindFn);

                        callback(unbindFn);
                    };

                    _print('socket is already in process of retrieving response for model "', modelName, '"');

                    return;
                }

                _callbacks[modelName] = callback;

                _send('model:request', {
                    name: modelName,
                    dataFlow: dataFlow
                });
            });

            _BindingLayer(socket, _bi);

            socket.addHandler('binding', function _bindingHandler(data) {
                if (!_setAndNotify[data.bindKey]) {
                    _print('socket is not ready to accept data "', data.bindValue, '" for "', data.bindKey, '"');
                } else {
                    _setAndNotify[data.bindKey](data.bindValue);
                }
            });

            socket.addHandler('model:response', function _modelStructureHandler(modelData) {
                var _fields = modelData.def.fields;

                if (!_fields.length) {
                    _print('empty model; "model:response" rejected');

                    return;
                }

                var _mapping = {};

                _fields.forEach(function _forEach(fieldDef) {
                    var _key = fieldDef.key,
                        _value;

                    _setAndNotify[_key] = function (value) {
                        _value = value;

                        //noinspection JSCheckFunctionSignatures
                        _bi.dispatchEvent({
                            type: _key
                        });
                    };

                    _define(_bi, _key, function _getter() {
                        return _value;
                    }, function (value) {
                        _value = value;

                        _send('binding', {
                            bindKey: _key,
                            bindValue: value
                        });
                    }, true);

                    _print('bindable property "', _key, '" created');

                    var _fieldMapping = _mapping[fieldDef.name] = {
                        propName: _key
                    };

                    switch (modelData.dataFlow) {
                        case 'CLIENT2CLIENT':
                            _fieldMapping.modelMayReadOn = _key;
                            _fieldMapping.modelMayWrite = true;
                            break;
                        case 'SERVER2CLIENT':
                            _fieldMapping.modelMayReadOn = _key;
                            break;
                        case 'CLIENT2SERVER':
                            _fieldMapping.modelMayWrite = true;
                            break;
                        default:
                            _fieldMapping.modelMayReadOn = _key;
                            _fieldMapping.modelMayWrite = true;
                    }
                });

                socket.bindModel(modelData, _mapping, {
                    doOnUnbind: function _onUnbind(propName) {
                        delete _bi[propName];

                        delete _setAndNotify[propName];

                        _print('bindable property "', propName, '" removed');
                    }
                });

                _callbacks[modelData.name](_unbindFn(modelData.name)) || delete _callbacks[modelData.name];

                _send('model:invalidate', modelData.name);
            });
        }());
    }
}

function _WSCli(address, bindable) {
    var socket = new WebSocket(address);

    _WSWrapper(socket, {
        makeBindable: bindable
    });

    return socket;
}