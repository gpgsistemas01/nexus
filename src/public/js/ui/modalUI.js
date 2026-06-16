import { hideModal, initMdbModal, showModal } from "../plugins/mdb/baseInstance.js";

export const openModal = (modalElement) => {

    const instance = initMdbModal(modalElement);

    showModal(instance);
}

export const closeModal = (form) => {
    
    const currentEl = form.closest('.modal');

    if (!currentEl) return;

    const instance = initMdbModal(currentEl);

    hideModal({ el: currentEl, instance, form });
}