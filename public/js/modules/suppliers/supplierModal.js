import { backModal, openModal } from "../../ui/modalUI.js";
import { on } from "../../utils/domUtils.js";

const modalId = '#supplierModal';
const formId = '#supplierForm';
const backSelector = `#backBtn-${modalId.replace('#', '')}`;

export const openSupplierModal = ({ 
    mode = 'create', 
    data = null, 
    onSave = null 
}) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(modalId);

    form.dataset.mode = mode;
    form.dataset.id = data?.id || '';

    form.reset();
    modalElement.querySelector('#modalTitle').textContent = 'Registrar proveedor';
    form.querySelector('#submitBtn').textContent = 'Guardar';
    form.onSave = onSave;

    openModal(modalElement);
}

on('click', backSelector, () => backModal());