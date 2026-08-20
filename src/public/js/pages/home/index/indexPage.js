import { DOM_EVENT_NAMES } from '../../../constants/events.js';
import { getErrorMessage, getSuccessMessage } from '../../../constants/apiMessages.js';
import { notifications } from "../../../plugins/swal/swalComponent.js";
import { initDatePickers, initDateTimePickers } from "../../../plugins/flatpickr/dateTimePicker.js";
import { initMdbDismissibleSubmenus, initMdbTooltips } from "../../../plugins/mdb/baseInstance.js";

initDateTimePickers();
initDatePickers();
initMdbTooltips();
initMdbDismissibleSubmenus();

const flashMessage = window.FLASH_MESSAGE;

if (flashMessage) {
    const { message, type, code } = flashMessage;

    switch (type) {
        case 'success':
            notifications.showSuccess(message || getSuccessMessage(code));
            break;
        case 'warning':
            notifications.showWarning(message || getErrorMessage(code));
            break;
        case 'error':
            notifications.showError(message || getErrorMessage(code));
            break;
        default:
            break;
    }
}

const successMessage = localStorage.getItem('showSuccessToast');
const errorMessage = localStorage.getItem('showErrorToast');

if (successMessage) {

    notifications.showSuccess(successMessage);
    localStorage.removeItem('showSuccessToast');
}

if (errorMessage) {

    notifications.showError(errorMessage);
    localStorage.removeItem('showErrorToast');
}

document.querySelectorAll('.dropdown').forEach(dropdown => {
    const btn = dropdown.querySelector('button[data-mdb-dropdown-init]');
    const instance = window.mdb.Dropdown.getOrCreateInstance(btn);
    dropdown.addEventListener(DOM_EVENT_NAMES.MOUSE_ENTER, () => {
        instance.show();
    });
    dropdown.addEventListener(DOM_EVENT_NAMES.MOUSE_LEAVE, () => {
        instance.hide();
        btn.blur();
    });
});
if (typeof window.io === 'function') {
    const socket = window.io();

    [
        'materials:updated',
        'wastes:updated',
        'material-movements:updated',
        'waste-movements:updated'
    ].forEach((eventName) => {
        socket.on(eventName, (data) => {
            window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
        });
    });
}
