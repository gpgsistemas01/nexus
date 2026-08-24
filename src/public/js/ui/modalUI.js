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

const onModalHiddenOnce = (modalElement, callback) => {
    const eventNames = [
        MODAL_EVENT_NAMES.MDB_HIDDEN,
        MODAL_EVENT_NAMES.BOOTSTRAP_HIDDEN
    ];
    let handled = false;

    const handleHidden = () => {
        if (handled) return;

        handled = true;
        eventNames.forEach(eventName => {
            modalElement.removeEventListener(eventName, handleHidden);
        });
        callback();
    };

    eventNames.forEach(eventName => modalElement.addEventListener(eventName, handleHidden));
};

const syncModalStack = () => {
    const topIndex = modalStack.length - 1;

    modalStack.forEach((modalElement, index) => {
        modalElement.style.setProperty('--app-modal-stack-level', index);
        modalElement.inert = index !== topIndex;
        modalBackdrops.get(modalElement)?.style.setProperty('--app-modal-stack-level', index);
    });

    if (modalStack.length) document.body.classList.add('modal-open');
};

const unregisterModal = (modalElement) => {
    const index = modalStack.indexOf(modalElement);

    if (index !== -1) modalStack.splice(index, 1);
    modalElement.inert = false;
    modalElement.style.removeProperty('--app-modal-stack-level');
    modalBackdrops.delete(modalElement);
    syncModalStack();
};

const registerModal = (modalElement, existingBackdrops) => {
    if (modalStack.includes(modalElement)) return;

    const backdrop = [...document.querySelectorAll('.modal-backdrop')]
        .find(element => !existingBackdrops.has(element));

    modalStack.push(modalElement);
    if (backdrop) modalBackdrops.set(modalElement, backdrop);
    syncModalStack();
    onModalHiddenOnce(modalElement, () => unregisterModal(modalElement));
};

export const buildModalTitle = ({ action, entityName, referenceNumber }) => {
    const baseTitle = `${ action } ${ entityName }`;

    return referenceNumber ? `${ baseTitle } - Folio ${ referenceNumber }` : baseTitle;
};

export const openModal = (modalElement) => {
    const existingBackdrops = new Set(document.querySelectorAll('.modal-backdrop'));
    const instance = initMdbModal(modalElement);
    const handleShown = () => adjustModalDataTables(modalElement);

    modalElement.addEventListener(MODAL_EVENT_NAMES.MDB_SHOWN, handleShown, { once: true });
    modalElement.addEventListener(MODAL_EVENT_NAMES.BOOTSTRAP_SHOWN, handleShown, { once: true });

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
