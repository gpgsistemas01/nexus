import { cleanForm } from "../../utils/formUtils.js";

export const modalStack = []
export const initMdbModal = (el) => mdb.Modal.getOrCreateInstance(el);

export const showModal = (instance) => {

    const last = modalStack[modalStack.length - 1];

    if (last !== instance) modalStack.push(instance);
    
    instance.show();
}

export const hideModal = ({ el, modal, form }) => {

    el.addEventListener('hidden.mdb.modal', () => {
        cleanForm(form);
    });
    modal.hide();
}

export const initMdbWrapperInput = ({ selector, value }) => {

    const inputElement = document.querySelector(selector);

    if (!inputElement) return;

    const wrapper = inputElement.closest('.form-outline');
    inputElement.value = value || '';
    return mdb.Input.getOrCreateInstance(wrapper);
}

export const updateMdbWrapperInput = (instance) => {

    if (!instance) return;

    instance.update();
}