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
 * Created by mekhonoshyn on 22-Dec-14.
 */

/**
 * Example:
 *
 * var builder = require('useful-utils');
 *
 * builder.client('external-utils', {
 *     demo: [
 *         'WSCli',
 *         'DragNDrop'
 *     ]
 * });
 *
 * builder.server('external-utils', [
 *     'WSSrv'
 * ]);
 */

var _serverModules = [
    'BindingLayer',
    'DateTime',
    'define',
    'defineRO',
    'EventTarget',
    'hash',
    'ModelMgr',
    'print',
    'WSSrv'
];

var _dependencies = {
    BindingLayer: [
        'hash',
        'print',
        'ModelMgr'
    ],
    DateTime: [
        'defineRO',
        'BindingLayer',
        'EventTarget'
    ],
//    define: [],
//    defineRO: [],
//    DragNDrop: [],
    EventTarget: [
        'define'
    ],
//    hash: [],
    ModelMgr: [
        'define',
        'hash',
        'print'
    ],
//    print: [],
    WSCli: [
        'define',
        'print',
        'BindingLayer',
        'EventTarget'
    ],
    WSSrv: [
        'define',
        'hash',
        'print',
        'BindingLayer',
        'EventTarget'
    ]
};

var fs = require('fs'),
    path = require('path'),
    nodeFS = require('node-fs'),
    del = require('del');

var _builders = {
    client: function _buildForClient(destination, configs) {
        Object.keys(configs).forEach(function _forEach(configName) {
            var _content = _normalizeSubs(_sequenceSubs(_collectSubs(configs[configName]))).map(function _map(moduleName) {
                var _path = __dirname + '/lib/' + moduleName + '.js';

                if (fs.existsSync(_path)) {
                    return fs.readFileSync(_path);
                } else {
                    return 'throw \'"' + _path + '" module not found\'';
                }
            }).join('\n\n');

            fs.writeFileSync(destination + '/' + configName + '.js', _content);
        });
    },
    server: function _buildForServer(destination, required) {
        function _serverWrapper(moduleName, content) {
            var dependencies = (_dependencies[moduleName] || []).map(function _map(sub) {
                return '_' + sub + ' = require(\'./' + sub + '\')'
            });

            return [
                dependencies.length ? ('var ' + dependencies.join(',\n    ') + ';') : '',
                content,
                'module.exports = _' + moduleName + ';'
            ].filter(Boolean).join('\n\n');
        }

        _normalizeSubs(_sequenceSubs(_collectSubs(required))).forEach(function _forEach(moduleName) {
            var _path = __dirname + '/lib/' + moduleName + '.js',
                _content;

            if (fs.existsSync(_path)) {
                _content = _serverWrapper(moduleName, fs.readFileSync(_path));
            } else {
                _content = 'throw \'"' + _path + '" module not found\'';
            }

            fs.writeFileSync(destination + '/' + moduleName + '.js', _content);
        });
    }
};

function _collectSubs(subModules) {
    return subModules.map(function _map(module) {
        return {
            module: module,
            subs: _collectSubs(_dependencies[module] || [])
        };
    });
}

function _sequenceSubs(subModules) {
    var _sequence = [];

    subModules.forEach(function _forEach(module) {
        _sequence = _sequence.concat(_sequenceSubs(module.subs).concat(module.module));
    });

    return _sequence;
}

function _normalizeSubs(subModules) {
    var _normal = [];

    subModules.forEach(function _forEach(item) {
        !~_normal.indexOf(item) && _normal.push(item);
    });

    return _normal;
}

function _fixDestination(destination, typedFolder) {
    var _destination = destination.split(path.sep).concat(typedFolder).filter(Boolean).join(path.sep);

    del.sync(_destination);

    nodeFS.mkdirSync(_destination, null, true);

    return _destination;
}

module.exports = {
    client: function _buildClientConfig(destination, configs) {
        var _destination = _fixDestination(destination, 'client');

        _builders.client(_destination, configs);
    },
    server: function _buildServerModules(destination, required) {
        var _destination = _fixDestination(destination, 'server');

        _builders.server(_destination, required || _serverModules);
    }
};