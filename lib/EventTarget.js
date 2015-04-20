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

function _EventTarget() {
    _define(this, '$types', {});
}

_define(_EventTarget.prototype, 'addEventListener', function _addEventListener(type, listener) {
        var _array = this.$types[type];

        if (!_array) {
            _define(this.$types, type, _array = [], null, true);
        }

        if (!~_array.indexOf(listener)) {
            _array[_array.length] = listener;
        }
    }
);

_define(_EventTarget.prototype, 'removeEventListener', function _removeEventListener(type, listener) {
        var _array = this.$types[type];

        if (!_array) {
            return;
        }

        var _li = _array.indexOf(listener);

        if (~_li) {
            var _len = _array.length;

            while (_li < _len) {
                _array[_li] = _array[++_li];
            }

            if (!--_array.length) {
                delete this.$types[type];
            }
        }
    }
);

_define(_EventTarget.prototype, 'dispatchEvent', function dispatchEvent(event) {
        var _array = this.$types[event.type];

        if (!_array) {
            return;
        }

        var _len = _array.length;

        for (var _i = 0; _i < _len; _i++) {
            _array[_i].call(this, event);
        }
    }
);