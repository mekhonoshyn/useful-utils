/**
 * created by mekhonoshyn on 10/31/14.
 */

/**
 * tTgt    - (required) -          - transformation target - translatable element (f.e. panel)
 * gTgt    -            - tTgt     - grab target - draggable element (f.e. header of target panel)
 * dTgt    -            - document - drop target - container within which is possible to perform dragging
 * iX      -            - 0        - initial X transformation (relatively to rendered place)
 * iY      -            - 0        - initial Y transformation (relatively to rendered place)
 * binding -            -          -
 */

/**
 * add class 'no-dragging' (by default) to any child element to forbid child element to be draggable
 */

/*jslint browser:true */
_DnDFactory = (function _DnDFactoryInitializer() {
    var mouseMoveEvent = 'mousemove',
        mouseUpEvent = 'mouseup',
        mouseDownEvent = 'mousedown',
        noDraggingClass = 'no-dragging',
        transformationMatrixTemplate = [ 'translate(', 0, 'px, ', 0, 'px)' ],
        eventListenerToken = 'EventListener',
        eventTargetPrototype = EventTarget.prototype,
        eventPrototype = Event.prototype;

    eventTargetPrototype._on = eventTargetPrototype['add' + eventListenerToken];
    eventTargetPrototype._un = eventTargetPrototype['remove' + eventListenerToken];

    eventPrototype._pd = eventPrototype.preventDefault;
    eventPrototype._sip = eventPrototype.stopImmediatePropagation;

    return function _DnDMagic(config) {
        var x,
            y,
            savedX,
            savedY,
            savedPageX,
            savedPageY,
            transformationMatrix = transformationMatrixTemplate.slice(),
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

            binding && binding.dispatchEvent && binding.event && binding.dispatchEvent({
                type: binding.event
            });
        }

        function _onGrab(event) {
            if (event.button || event.target.classList.contains(noDraggingClass)) {
                return;
            }

            event._pd();
            event._sip();

            savedX = x;
            savedY = y;

            savedPageX = event.pageX;
            savedPageY = event.pageY;

            dTgt._on(mouseMoveEvent, _onDrag);

            dTgt._on(mouseUpEvent, _onDrop);
        }

        function _onDrag(event) {
            event._sip();

            _transform(event.pageX + savedX - savedPageX, event.pageY + savedY - savedPageY, binding);
        }

        function _onDrop(event) {
            event._sip();

            dTgt._un(mouseMoveEvent, _onDrag);

            dTgt._un(mouseUpEvent, _onDrop);
        }

        (config.gTgt || config.tTgt)._on(mouseDownEvent, _onGrab);

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
    };
})();