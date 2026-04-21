import { setFormReadOnly } from "../../ui/formUI.js";
import { backModal, openModal } from "../../ui/modalUI.js";
import { on } from "../../utils/domUtils.js";

const productModalId = '#productModal';
const goodsReceiptModalId = '#goodsReceiptModal';
const backSelector = `#backBtn-${productModalId.replace('#', '')}`;

export const openProductModal = async ({ mode, data = null, onSave = null }) => {
    
    const form = document.querySelector('#productForm');
    const modalElement = document.querySelector(productModalId);

    form.dataset.mode = mode;
    form.dataset.id = data?.id || '';

    setFormReadOnly({ form, isReadOnly: false });

    if (mode === 'create') {
        
        form.reset();
        if (form.elements.isActive) form.elements.isActive.checked = true;
        modalElement.querySelector('#modalTitle').textContent = 'Registrar producto';
        form.querySelector('#submitBtn').textContent = 'Guardar';
    }

    if (mode === 'edit' || mode === 'view') {

        form.elements.name.value = data.name;
        form.elements.minStock.value = data.minStock;
        form.elements.base.value = data.base || '';
        form.elements.height.value = data.height || '';
        if (form.elements.isActive) form.elements.isActive.checked = Boolean(data.isActive);

        if (mode === 'edit') {

            modalElement.querySelector('#modalTitle').textContent = 'Editar producto';
            form.querySelector('#submitBtn').textContent = 'Actualizar';
        }

        if (mode === 'view') {

            modalElement.querySelector('#modalTitle').textContent = 'Ver producto';

            setFormReadOnly({ form, isReadOnly: true });
        }
    }

    form.onSave = onSave;

    openModal(modalElement);
}

on('click', backSelector, () => backModal());
