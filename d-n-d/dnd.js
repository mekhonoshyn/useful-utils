/**
 * created by mekhonoshyn on 10/31/14.
 */

/**
 * tTarget  - (required) -  transformation target - translatable element (f.e. panel)
 * dSTarget -               drag-start target - draggable element (f.e. header of target panel)
 * dETarget -               drag-end target - container within which is possible to perform dragging
 * initialX -               initial shift by x-Axis (relatively to rendered place)
 * initialY -               initial shift by y-Axis (relatively to rendered place)
 * callback -               if provided will be executed on each drag-end event with passing final X and Y
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
        transformationMatrixTemplate = ['translate(', 0, 'px, ', 0, 'px)'],
        eventListenerToken = 'EventListener',
        eventTargetPrototype = EventTarget.prototype;

    eventTargetPrototype._on = eventTargetPrototype['add' + eventListenerToken];
    eventTargetPrototype._un = eventTargetPrototype['remove' + eventListenerToken];

    function _DnDMagic(tTarget, dETarget, dSTarget, initialX, initialY, onDragEndCallback) {
        var x,
            y,
            savedX = 0,
            savedY = 0,
            savedPageX = 0,
            savedPageY = 0,
            transformationMatrix = transformationMatrixTemplate.slice();

        function _onStartDrag(event) {
            if (event.button || event.target.classList.contains(noDraggingClass)) {
                return;
            }

            savedX = x;
            savedY = y;

            savedPageX = event.pageX;
            savedPageY = event.pageY;

            dETarget._on(mouseMoveEvent, _onDoDrag);

            dETarget._on(mouseUpEvent, _onEndDrag);
        }

        function _onDoDrag(event) {
            transformationMatrix[1] = x = savedX + event.pageX - savedPageX;

            transformationMatrix[3] = y = savedY + event.pageY - savedPageY;

            tTarget.style.transform = transformationMatrix.join('');
        }

        function _onEndDrag() {
            if (onDragEndCallback) {
                onDragEndCallback(x, y);
            }

            dETarget._un(mouseMoveEvent, _onDoDrag);

            dETarget._un(mouseUpEvent, _onEndDrag);
        }

        dSTarget._on(mouseDownEvent, _onStartDrag);

        _onDoDrag({
            pageX: initialX,
            pageY: initialY
        });
    }

    return function _DnDFactory(config) {
        return new _DnDMagic(
            config.tTarget,
            config.dETarget || document,
            config.dSTarget || config.tTarget,
            config.initialX || 0,
            config.initialY || 0,
            config.callback
        );
    }
})();