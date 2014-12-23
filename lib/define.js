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

/**
 * Add property to passed context object and apply getter and setter to it;
 * if setter is not provided - getter applied as 'value'
 *
 * @param  {Object}   context        - object to perform operation on
 * @param  {String}   property       - new property name
 * @param  {*}        getter         - any function, will be called on reading from added property
 * @param  {Function} [setter]       - any function, will be called on writing to added property
 * @param  {Boolean}  [configurable] - indicates can added property be overridden or removed in future
 * @return {Object}                  - standard Object.defineProperty output -> object passed as context param
 */
function _define(context, property, getter, setter, configurable) {
    var definition = {
        configurable: !!configurable
    };

    if (setter) {
        definition.get = getter;
        definition.set = setter;
    } else {
        definition.value = getter;
    }

    return Object.defineProperty(context, property, definition);
}