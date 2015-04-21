/**
 * Created by mekhonoshyn on 21-Apr-15.
 */

function _HTMLSelectWrapper(element) {
    function _onInput(event) {
        event.target.newIndex = event.target.selectedIndex;
    }

    function _onChange(event) {
        event.target.oldIndex = event.target.newIndex;
    }

    function _hookedAddEventListener(eventName, eventHandler, useCapture) {
        return EventTarget.prototype.addEventListener.call(this, eventName === 'change' ? 'input' : eventName, eventHandler, useCapture);
    }

    element.oldIndex = element.selectedIndex;

    element.addEventListener('input', _onInput);

    element.addEventListener('change', _onChange);

    element.addEventListener = _hookedAddEventListener;

    return function _HTMLSelectUnWrapper() {
        element.removeEventListener('input', _onInput);

        element.removeEventListener('change', _onChange);

        delete element.addEventListener;

        delete element.oldIndex;

        delete element.newIndex;
    };
}