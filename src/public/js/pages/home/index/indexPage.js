import { DOM_EVENT_NAMES } from '../../../constants/events.js';
import { notifications } from "../../../plugins/swal/swalComponent.js";
import { handleFlashMessage } from "../../../handlers/flashMessageHandler.js";
import { initDatePickers, initDateTimePickers } from "../../../plugins/flatpickr/dateTimePicker.js";
import { initMdbDismissibleSubmenus, initMdbTooltips } from "../../../plugins/mdb/baseInstance.js";

initDateTimePickers();
initDatePickers();
initMdbTooltips();
initMdbDismissibleSubmenus();

handleFlashMessage(window.FLASH_MESSAGE || null);

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
