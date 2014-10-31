/**
 * created by mekhonoshyn on 10/31/14.
 */

// tTarget - transformation target - translatable element (f.e. panel)
// dSTarget - drag-start target - draggable element (f.e. header of target panel)
// dETarget - drag-end target - container within which is possible to perform dragging
// xShift - initial shift by x-Axis (relatively to rendered place)
// yShift - initial shift by y-Axis (relatively to rendered place)

//add class 'no-dragging' to any child element to forbid child element to be draggable

/*jslint browser:true */
function _DnDMagic(config) {
    var xShift,
        yShift,
        savedXShift,
        savedYShift,
        savedXOffsetForDnD,
        savedYOffsetForDnD,
        matrix = ['translate(', 0, 'px, ', 0, 'px)'],
        dETarget = config.dETarget || document,
        tTarget = config.tTarget,
        onDragEndCallback = config.callback;

    function _applyTransformation(newXShift, newYShift) {
        matrix[1] = xShift = newXShift;

        matrix[3] = yShift = newYShift;

        tTarget.style.transform = matrix.join('');
    }

    function _onStartDrag(event) {
        if (event.button || event.target.classList.contains('no-dragging')) {
            return;
        }

        savedXShift = xShift;
        savedYShift = yShift;

        savedXOffsetForDnD = event.pageX;
        savedYOffsetForDnD = event.pageY;

        dETarget.addEventListener('mousemove', _onDoDrag);

        dETarget.addEventListener('mouseup', _onEndDrag);
    }

    function _onDoDrag(event) {
        _applyTransformation(savedXShift + event.pageX - savedXOffsetForDnD, savedYShift + event.pageY - savedYOffsetForDnD);
    }

    function _onEndDrag() {
        if (onDragEndCallback) {
            onDragEndCallback(xShift, yShift);
        }

        dETarget.removeEventListener('mousemove', _onDoDrag);

        dETarget.removeEventListener('mouseup', _onEndDrag);
    }

    config.dSTarget.addEventListener('mousedown', _onStartDrag);

    _applyTransformation(config.xShift || 0, config.yShift || 0);
}

/*module.exports = */function _DnDFactory(config) {
    return new _DnDMagic(config);
}