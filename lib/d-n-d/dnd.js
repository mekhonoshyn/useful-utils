/**
 * created by mekhonoshyn on 10/31/14.
 */

/**
 * tTgt   - (required) -          - transformation target - translatable element (f.e. panel)
 * gTgt   -            - tTgt     - grab target - draggable element (f.e. header of target panel)
 * dTgt   -            - document - drop target - container within which is possible to perform dragging
 * iX     -            - 0        - initial X transformation (relatively to rendered place)
 * iY     -            - 0        - initial Y transformation (relatively to rendered place)
 * onDrop -            -          - if provided will be executed on each drop event with passing final X and Y
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
            savedX = 0,
            savedY = 0,
            savedPageX = 0,
            savedPageY = 0,
            transformationMatrix = transformationMatrixTemplate.slice(),
            transformTargetStyle = config.tTgt.style,
            dTgt = config.dTgt || document,
            onDropCallback = config.onDrop;

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
            event._sip && event._sip();

            transformationMatrix[1] = x = savedX + event.pageX - savedPageX;

            transformationMatrix[3] = y = savedY + event.pageY - savedPageY;

            transformTargetStyle.transform = transformationMatrix.join('');
        }

        function _onDrop(event) {
            event._sip();

            onDropCallback && onDropCallback(x, y);

            dTgt._un(mouseMoveEvent, _onDrag);

            dTgt._un(mouseUpEvent, _onDrop);
        }

        (config.gTgt || config.tTgt)._on(mouseDownEvent, _onGrab);

        _onDrag({
            pageX: config.iX || 0,
            pageY: config.iY || 0
        });
    };
})();