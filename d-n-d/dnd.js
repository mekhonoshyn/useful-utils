/**
 * created by mekhonoshyn on 10/31/14.
 */

// tTarget - transformation target - translatable element (f.e. panel)
// dSTarget - drag-start target - draggable element (f.e. header of target panel)
// dETarget - drag-end target - container within which is possible to perform dragging
// initialX - initial shift by x-Axis (relatively to rendered place)
// initialY - initial shift by y-Axis (relatively to rendered place)

//add class 'no-dragging' (by default) to any child element to forbid child element to be draggable

/*jslint browser:true */

_DnDFactory = (function () {
    var mouseMoveEvent = 'mousemove',
        mouseUpEvent = 'mouseup',
        mouseDownEvent = 'mousedown',
        noDraggingClass = 'no-dragging',
        transformationMatrixTemplate = ['translate(', 0, 'px, ', 0, 'px)'];

    function _DnDMagic(config) {
        var x,
            y,
            savedX,
            savedY,
            savedPageX,
            savedPageY,
            transformationMatrix = transformationMatrixTemplate.slice(),
            dETarget = config.dETarget || document,
            tTarget = config.tTarget,
            onDragEndCallback = config.callback;

        function _applyTransformation(newX, newY) {
            transformationMatrix[1] = x = newX;

            transformationMatrix[3] = y = newY;

            tTarget.style.transform = transformationMatrix.join('');
        }

        function _onStartDrag(event) {
            if (event.button || event.target.classList.contains(noDraggingClass)) {
                return;
            }

            savedX = x;
            savedY = y;

            savedPageX = event.pageX;
            savedPageY = event.pageY;

            dETarget.addEventListener(mouseMoveEvent, _onDoDrag);

            dETarget.addEventListener(mouseUpEvent, _onEndDrag);
        }

        function _onDoDrag(event) {
            _applyTransformation(savedX + event.pageX - savedPageX, savedY + event.pageY - savedPageY);
        }

        function _onEndDrag() {
            if (onDragEndCallback) {
                onDragEndCallback(x, y);
            }

            dETarget.removeEventListener(mouseMoveEvent, _onDoDrag);

            dETarget.removeEventListener(mouseUpEvent, _onEndDrag);
        }

        config.dSTarget.addEventListener(mouseDownEvent, _onStartDrag);

        _applyTransformation(config.initialX || 0, config.initialY || 0);
    }

    return function _DnDFactory(config) {
        return new _DnDMagic(config);
    }
})();