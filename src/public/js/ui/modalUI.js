import { MODAL_EVENT_NAMES } from '../constants/events.js';
import { hideModal, initMdbModal, showModal } from "../plugins/mdb/baseInstance.js";

const adjustModalDataTables = (modalElement) => {

    if (!window.$?.fn?.DataTable) return;

    $(modalElement).find('table.dataTable').each(function() {
        if (!$.fn.DataTable.isDataTable(this)) return;

        const table = $(this).DataTable();

        table.columns.adjust();
        if (typeof table.responsive?.recalc === 'function') table.responsive.recalc();
    });
};

export const buildModalTitle = ({ action, entityName, referenceNumber }) => {

    const baseTitle = `${ action } ${ entityName }`;

    return referenceNumber ? `${ baseTitle } - Folio ${ referenceNumber }` : baseTitle;
};

export const openModal = (modalElement) => {

    const instance = initMdbModal(modalElement);
    const handleShown = () => adjustModalDataTables(modalElement);

    modalElement.addEventListener(MODAL_EVENT_NAMES.MDB_SHOWN, handleShown, { once: true });
    modalElement.addEventListener(MODAL_EVENT_NAMES.BOOTSTRAP_SHOWN, handleShown, { once: true });

    showModal(instance);

    setTimeout(handleShown, 150);
}

export const closeModal = (form) => {
    
    const currentEl = form.closest('.modal');

    if (!currentEl) return;

    const instance = initMdbModal(currentEl);

    hideModal({ el: currentEl, instance, form });
}