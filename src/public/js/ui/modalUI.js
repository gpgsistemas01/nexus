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

export const openModal = (modalElement) => {

    const instance = initMdbModal(modalElement);
    const handleShown = () => adjustModalDataTables(modalElement);

    modalElement.addEventListener('shown.mdb.modal', handleShown, { once: true });
    modalElement.addEventListener('shown.bs.modal', handleShown, { once: true });

    showModal(instance);

    setTimeout(handleShown, 150);
}

export const closeModal = (form) => {
    
    const currentEl = form.closest('.modal');

    if (!currentEl) return;

    const instance = initMdbModal(currentEl);

    hideModal({ el: currentEl, instance, form });
}