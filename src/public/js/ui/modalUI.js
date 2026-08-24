import { MODAL_EVENT_NAMES } from '../constants/events.js';
import { hideModal, initMdbModal, showModal } from '../plugins/mdb/baseInstance.js';

const adjustModalDataTables = (modalElement) => {
    if (!window.$?.fn?.DataTable) return;

    $(modalElement).find('table.dataTable').each(function() {
        if (!$.fn.DataTable.isDataTable(this)) return;

        const table = $(this).DataTable();

        table.columns.adjust();
        if (typeof table.responsive?.recalc === 'function') table.responsive.recalc();
    });
};

const modalStack = [];
const modalBackdrops = new WeakMap();

const onModalEventOnce = (modalElement, eventNames, callback) => {
    let handled = false;

    const handleEvent = () => {
        if (handled) return;

        handled = true;
        eventNames.forEach(eventName => {
            modalElement.removeEventListener(eventName, handleEvent);
        });
        callback();
    };

    eventNames.forEach(eventName => modalElement.addEventListener(eventName, handleEvent));
};

const syncModalStack = () => {
    const topIndex = modalStack.length - 1;

    modalStack.forEach((modalElement, index) => {
        modalElement.style.setProperty('--app-modal-stack-level', index);
        modalElement.inert = index !== topIndex;
        modalBackdrops.get(modalElement)?.style.setProperty('--app-modal-stack-level', index);
    });

    document.body.classList.toggle('modal-open', modalStack.length > 0);
};

const associateModalBackdrop = (modalElement, existingBackdrops) => {
    if (modalBackdrops.has(modalElement)) return;

    const backdrop = [...document.querySelectorAll('.modal-backdrop')]
        .find(element => !existingBackdrops.has(element));

    if (backdrop) modalBackdrops.set(modalElement, backdrop);
};

const registerModal = (modalElement, existingBackdrops) => {
    if (modalStack.includes(modalElement)) return;

    modalStack.push(modalElement);
    associateModalBackdrop(modalElement, existingBackdrops);
    syncModalStack();
    onModalEventOnce(modalElement, [
        MODAL_EVENT_NAMES.MDB_HIDDEN,
        MODAL_EVENT_NAMES.BOOTSTRAP_HIDDEN
    ], () => {
        const index = modalStack.indexOf(modalElement);

        if (index !== -1) modalStack.splice(index, 1);
        modalElement.inert = false;
        modalElement.style.removeProperty('--app-modal-stack-level');
        modalBackdrops.delete(modalElement);
        syncModalStack();
    });
};

export const buildModalTitle = ({ action, entityName, referenceNumber }) => {
    const baseTitle = `${ action } ${ entityName }`;

    return referenceNumber ? `${ baseTitle } - Folio ${ referenceNumber }` : baseTitle;
};

export const openModal = (modalElement) => {
    const existingBackdrops = new Set(document.querySelectorAll('.modal-backdrop'));
    const instance = initMdbModal(modalElement);
    const handleShown = () => {
        associateModalBackdrop(modalElement, existingBackdrops);
        syncModalStack();
        adjustModalDataTables(modalElement);
    };

    onModalEventOnce(modalElement, [
        MODAL_EVENT_NAMES.MDB_SHOWN,
        MODAL_EVENT_NAMES.BOOTSTRAP_SHOWN
    ], handleShown);

    showModal(instance);
    registerModal(modalElement, existingBackdrops);
    setTimeout(handleShown, 150);
};

export const closeModal = (form) => {
    const currentEl = form.closest('.modal');

    if (!currentEl) return;

    const instance = initMdbModal(currentEl);

    hideModal({ el: currentEl, instance, form });
};
