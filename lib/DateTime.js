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
 * created by mekhonoshyn on 20-Nov-14.
 */

function _DTItem(config) {
    function _val(value) {
        if (value !== undefined) {
            _value = value;

            (config.onChange || _interface.onChange) && (config.onChange || _interface.onChange)(_interface);
        }

        return _value;
    }

    function _out() {
        return ('0000' + _value).slice(-(config.length || 2));
    }

    function _inc() {
        if (_value === _maxValue()) {
            config.upperLevel && config.upperLevel.inc();

            _val(_minValue);
        } else {
            _val(_value + 1);
        }
    }

    var _maxValue = typeof config.maxValue === 'function' ? config.maxValue : function () {
            return config.maxValue;
        },
        _minValue = config.minValue,
        _value,
        _interface = {
            inc: _inc,
            val: _val,
            out: _out
        };

    (function () {
        var _initialValue = config.initialValue;

        if (typeof _initialValue !== 'number' || _initialValue < _minValue || _initialValue > _maxValue()) {
            _val(_minValue);
        } else {
            _val(_initialValue);
        }
    }());

    return _interface;
}

function _DateTimeConstructor(current, options) {
    var _DD_by_MM = (function (array) {
        var result = {};
        array.forEach(function (value, index) {
            result[index + 1] = value;
        });
        return result;
    })([ 31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);

    var __YY = _DTItem({
        minValue: 1,
        maxValue: Infinity,
        initialValue: current && current.YY,
        length: 4,
        onChange: function _onChange(__YY) {
            _DD_by_MM[2] = __YY.val() % 4 ? 28 : 29;
        }
    });

    var __MM = _DTItem({
        upperLevel: __YY,
        minValue: 1,
        maxValue: 12,
        initialValue: current && current.MM
    });

    var __DD = _DTItem({
        upperLevel: __MM,
        minValue: 1,
        maxValue: function _maxValue() {
            return _DD_by_MM[__MM.val()];
        },
        initialValue: current && current.DD
    });

    var __hh = _DTItem({
        upperLevel: __DD,
        minValue: 0,
        maxValue: 23,
        initialValue: current && current.hh
    });

    var __mm = _DTItem({
        upperLevel: __hh,
        minValue: 0,
        maxValue: 59,
        initialValue: current && current.mm
    });

    var __ss = _DTItem({
        upperLevel: __mm,
        minValue: 0,
        maxValue: 59,
        initialValue: current && current.ss
    });

    function _out() {
        return [__DD.out(), '.', __MM.out(), '.', __YY.out(), ' ', __hh.out(), ':', __mm.out(), ':', __ss.out()].join('');
    }

    if (options.makeBindable) {
        (function () {
            var __bi = new _EventTarget;

            _defineRO(__bi, 'time', _out);
//            _defineRO(__bi, 'year', __YY.val);
//            _defineRO(__bi, 'month', __MM.val);
//            _defineRO(__bi, 'day', __DD.val);
//            _defineRO(__bi, 'hour', __hh.val);
//            _defineRO(__bi, 'minute', __mm.val);
//            _defineRO(__bi, 'second', __ss.val);

            _BindingLayer(this, __bi);

            __ss.onChange = function _onChange() {
                __bi.dispatchEvent({
                    type: 'time-changed'
                });
            };
        }.call(this));
    }

    this.inc = __ss.inc;
    this.out = _out;
}

function _DateTime(current, options) {
    return new _DateTimeConstructor(current, options);
}