import { useForm } from "../../application/form.js";
import { createProductDatatable } from "../../plugins/datatable/productDatatable.js";
import { clearFormErrors, initForm } from "../../ui/formUI.js";
import { openModal } from "../../ui/modalUI.js";

const formId = '#stockAdjustmentForm';
const productModalId = '#stockAdjustmentModal';
const context = window.meta || {};

createProductDatatable(context);

useForm({
    selector: formId,
    normalizeData: ({ formData }) => {

        formData.isActive = document.querySelector(`${ formId } #isActiveInput`).checked;
        
        return formData;
    },
    // getErrors: ({ formData }) => validateFields(productValidators, formData),
    sendRequest: async ({ formData, form }) => {

        const product = await handleSubmit({
            form,
            formData,
            // create: registerProduct,
            // update: editProduct
        });

        form.onSave?.(product);
    },
});

export const openStockAdjustmentModal = ({ 
    mode = 'edit-stock', 
    data = null, 
    onSave = null 
}) => {
    
    const form = document.querySelector(formId);
    const modalElement = document.querySelector(productModalId);

    initForm({ form, mode, id: data?.id });

    clearFormErrors(form);

    modalElement.querySelector('#modalTitle').textContent = 'Editar stock de producto';
    form.querySelector('#submitBtn').textContent = 'Actualizar';

    form.onSave = onSave;

    openModal(modalElement);
}