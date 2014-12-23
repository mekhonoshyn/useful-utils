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
 * created by mekhonoshyn on 10/31/14.
 */

/**
 * *param*     *required*   *default* - *description*
 * tTgt      - yes        -           - transformation target - translatable element (f.e. panel)
 * gTgt      -            - tTgt      - grab target - draggable element (f.e. header of target panel)
 * dTgt      -            - document  - drop target - container within which is possible to perform dragging
 * iX        -            - 0         - initial X transformation (relatively to rendered place)
 * iY        -            - 0         - initial Y transformation (relatively to rendered place)
 * binding   -            - undefined - any implementation of EventTarget interface (dispatchEvent, addEventListener,
 *                                    -   removeEventListener); once provided later can be used for two-way binding;
 *                                    -   should contain 'event' (dispatched to it on every transformation) property
 *                                    -   for later usage in two-way binding
 * interface -            - undefined - flag indicating you want to get as a factory result interface for programmatic
 *                                    -   usage
 */

/**
 * - recommended to apply "position:absolute" to transformation target
 * - add class 'no-dragging' (by default) to any child element to forbid that child element to be draggable
 */

/**
 * Example:
 *
 * var exBinding = new _EventTarget;
 *
 * Object.defineProperty(exBinding, 'event', {
 *     value: 'ex-event'
 * });
 *
 * var exInterface = _DnDFactory({
 *     tTgt: document.querySelector('#ex-div'),
 *     binding: exBinding,
 *     interface: true
 * });
 */

function _DnDFactory(config) {
    var x,
        y,
        savedX,
        savedY,
        savedPageX,
        savedPageY,
        transformationMatrix = [ 'translate(', 0, 'px,', 0, 'px)' ],
        transformTargetStyle = config.tTgt.style,
        dTgt = config.dTgt || document,
        binding = config.binding;

    function _getX() {
        return x;
    }

    function _getY() {
        return y;
    }

    binding && Object.defineProperties(binding, {
        x: {
            get: _getX,
            set: function _setX(newX) {
                _transform(newX, y);
            }
        },
        y: {
            get: _getY,
            set: function _setY(newY) {
                _transform(x, newY);
            }
        }
    });

    function _transform(newX, newY, binding) {
        transformationMatrix[1] = x = newX;

        transformationMatrix[3] = y = newY;

        transformTargetStyle.transform = transformationMatrix.join('');

        //noinspection JSCheckFunctionSignatures
        binding && binding.dispatchEvent && binding.event && binding.dispatchEvent({
            type: binding.event
        });
    }

    function _onGrab(event) {
        if (event.button || event.target.classList.contains('no-dragging')) {
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();

        savedX = x;
        savedY = y;

        savedPageX = event.pageX;
        savedPageY = event.pageY;

        dTgt.addEventListener('mousemove', _onDrag);

        dTgt.addEventListener('mouseup', _onDrop);
    }

    function _onDrag(event) {
        event.stopImmediatePropagation();

        _transform(event.pageX + savedX - savedPageX, event.pageY + savedY - savedPageY, binding);
    }

    function _onDrop(event) {
        event.stopImmediatePropagation();

        dTgt.removeEventListener('mousemove', _onDrag);

        dTgt.removeEventListener('mouseup', _onDrop);
    }

    (config.gTgt || config.tTgt).addEventListener('mousedown', _onGrab);

    _transform(config.iX || 0, config.iY || 0);

    return config.interface && Object.defineProperties({}, {
        x: {
            get: _getX,
            set: function _setX(newX) {
                _transform(newX, y, binding);
            }
        },
        y: {
            get: _getY,
            set: function _setY(newY) {
                _transform(x, newY, binding);
            }
        }
    });
}