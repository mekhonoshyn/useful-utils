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
 * created by mekhonoshyn on 17-Nov-14.
 */

var WebSocket = require('ws');

_define(WebSocket.prototype, 'send', (function _sendWrapper() {
    var _send = WebSocket.prototype.send;

    return function _wrappedSendFn(data) {
        if (this.readyState === 1) {
//            _print('client is sending message: ', JSON.stringify(data));

            _send.call(this, JSON.stringify(data));
        }
    };
}()));

function _WSWrapper(client, options) {
    var _id = _hash();

    _print('connection opened: ', _id);

    var _handlers = {
        unknown: function _defaultHandler(data) {
            _print('run default message handler (', data, ')');
        }
    };

    client.on('message', function _onMessage(rawData) {
        var _message = JSON.parse(rawData);

//        _print('client [id:', _id, '] received message: ', JSON.stringify(_message));

        if (_handlers[_message.type]) {
            _handlers[_message.type].call(client, _message.data);
        } else {
            _handlers.unknown.call(client, _message);
        }
    });

    _define(client, 'addHandler', _define.bind(null, _handlers));

    client.on('close', function _onClose() {
        _print('connection closed: ', _id);
    });

    if (options.makeBindable) {
        (function _makeBindable() {
            var _bi = new _EventTarget,
                _setAndNotify = {},
                _send = function _carriedSend(type, data) {
                    client.send({
                        type: type,
                        data: data
                    });
                };

            _BindingLayer(client, _bi);

            client.addHandler('binding', function _bindingHandler(data) {
                _setAndNotify[data.bindKey](data.bindValue);
            });

            client.addHandler('model:request', function _modelStructureHandler(modelData) {
                var _fields = (modelData.def || (modelData.def = require('../../models/' + modelData.name))).fields;

                if (!_fields.length) {
                    _print('empty model; "model:request" rejected');

                    return;
                }

                var _mapping = {};

                _fields.forEach(function _forEach(fieldDef) {
                    var _key = fieldDef.key,
                        _value;

                    _setAndNotify[_key] = function _setAndNotifyFn(value) {
                        _value = value;

                        _bi.dispatchEvent({
                            type: _key
                        });
                    };

                    _define(_bi, _key, function _getter() {
                        return _value;
                    }, function _setter(value) {
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
                            _fieldMapping.modelMayWrite = true;
                            break;
                        case 'CLIENT2SERVER':
                            _fieldMapping.modelMayReadOn = _key;
                            break;
                        default:
                            _fieldMapping.modelMayReadOn = _key;
                            _fieldMapping.modelMayWrite = true;
                    }
                });

                client.bindModel(modelData, _mapping, {
                    doOnUnbind: function _onUnbind(propName/*, modelFieldName*/) {
                        delete _bi[propName];

                        delete _setAndNotify[propName];

                        _print('bindable property "', propName, '" removed');
                    }
                });

                _send('model:response', modelData);
            });

            client.addHandler('model:invalidate', function _modelDataHandler(modelName) {
                client.invalidateModel(modelName);
            });

            client.addHandler('model:unbind', function _modelDataHandler(modelName) {
                client.unbindModel(modelName);
            });

            client.on('close', client.unbindAllModels);
        }());
    }
}

function _WSSrv(port, bindable) {
    var _server = new WebSocket.Server({
        port: port
    });

    _server.on('connection', function _onConnection(client) {
        _WSWrapper(client, {
            makeBindable: bindable
        });
    });
}