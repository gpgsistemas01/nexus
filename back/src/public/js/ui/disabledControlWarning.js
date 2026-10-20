import { notifications } from "../plugins/swal/swalComponent.js";

const disabledWarningEvent = 'mousedown.disabledControlWarning touchstart.disabledControlWarning';
const boundWarningEvents = new Set();

const getTargetElement = ({ element = null, selector = null }) => element || (selector ? document.querySelector(selector) : null);

export const bindDisabledControlWarning = ({
    eventTargetSelector,
    resolveControl,
    eventNamespace = eventTargetSelector
} = {}) => {

    if (!eventTargetSelector || typeof resolveControl !== 'function') return;

    if (boundWarningEvents.has(eventNamespace)) return;

    boundWarningEvents.add(eventNamespace);

    $(document).on(disabledWarningEvent, eventTargetSelector, (event) => {

        const control = resolveControl(event.currentTarget, event);
        const message = control?.dataset?.disabledWarning;

        if (!control?.disabled || !message) return;

        event.preventDefault();
        event.stopPropagation();

        notifications.showWarning(message);
    });
};

export const setDisabledControlWarning = ({
    element = null,
    selector = null,
    message = null
} = {}) => {

    const targetElement = getTargetElement({ element, selector });

    if (!targetElement) return;

    if (message) {
        targetElement.dataset.disabledWarning = message;
        return;
    }

    delete targetElement.dataset.disabledWarning;
};
