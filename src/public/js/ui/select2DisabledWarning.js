import { notifications } from "../plugins/swal/swalComponent.js";

const disabledWarningEvent = 'mousedown.select2DisabledWarning touchstart.select2DisabledWarning';
const disabledWarningMessageKey = 'select2DisabledWarning';
let isDisabledWarningBound = false;

const getSelectFromContainer = (container) => {

    const select = container?.previousElementSibling;

    if (select?.tagName === 'SELECT') return select;

    return null;
};

const bindDisabledWarningListener = () => {

    if (isDisabledWarningBound) return;

    isDisabledWarningBound = true;

    $(document).on(disabledWarningEvent, '.select2-container', (event) => {

        const select = getSelectFromContainer(event.currentTarget);
        const message = select?.dataset?.[disabledWarningMessageKey];

        if (!select?.disabled || !message) return;

        event.preventDefault();
        event.stopPropagation();

        notifications.showWarning(message);
    });
};

export const setSelect2DisabledWarning = ({
    element = null,
    selector = null,
    message = null
} = {}) => {

    const targetElement = element || (selector ? document.querySelector(selector) : null);

    if (!targetElement) return;

    if (message) {
        targetElement.dataset[disabledWarningMessageKey] = message;
        bindDisabledWarningListener();
        return;
    }

    delete targetElement.dataset[disabledWarningMessageKey];
};
