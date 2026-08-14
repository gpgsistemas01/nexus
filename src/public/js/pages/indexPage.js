import { notifications } from "../plugins/swal/swalComponent.js";
import { handleFlashMessage } from "../handlers/flashMessageHandler.js";
import { initDatePickers, initDateTimePickers } from "../plugins/flatpickr/dateTimePicker.js";
import { initMdbTooltips } from "../plugins/mdb/baseInstance.js";

initDateTimePickers();
initDatePickers();
initMdbTooltips();

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
    const instance = mdb.Dropdown.getOrCreateInstance(btn);
    dropdown.addEventListener('mouseenter', () => {
        instance.show();
    });
    dropdown.addEventListener('mouseleave', () => {
        instance.hide();
        btn.blur();
    });
});
if (typeof window.io === 'function') {
    const socket = window.io();

    socket.on('materials:updated', (data) => {
        window.dispatchEvent(new CustomEvent('materials:updated', { detail: data }));
    });
}
