import { createSupplierDatatable } from "../../plugins/datatable/supplierDatatable.js";
import { useForm } from "../../application/form.js";
import { editSupplier, registerSupplier } from "../../application/warehouse/suppliers.js";
import { handleSubmit, validateFields } from "../../utils/formUtils.js";
import { setFormReadOnly } from "../../ui/formUI.js";
import { supplierValidators } from "../../utils/validations/validators.js";
import { backModal, openModal } from "../../ui/modalUI.js";
import { on } from "../../utils/domUtils.js";

const modalId = '#supplierModal';
const formId = '#supplierForm';

createSupplierDatatable();

useForm({
    selector: formId,
    normalizeData: ({ formData }) => {
        formData.isActive = document.getElementById('isActiveInput').checked;
    },
    getErrors: (formData) => {
        
        let errors = {};

        errors = validateFields(supplierValidators, formData);

        return errors;
    },
    sendRequest: async ({ formData, form }) => {

        await handleSubmit({
            form,
            formData,
            create: registerSupplier,
            update: editSupplier,
        });
    }
});

export const openSupplierModal = ({ mode, data = null }) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(modalId);

    form.dataset.mode = mode;
    form.dataset.id = data?.id || '';

    setFormReadOnly({ form, isReadOnly: false });

    if (mode === 'create') {

        form.reset();
        modalElement.querySelector('#modalTitle').textContent = 'Registrar proveedor';
        form.querySelector('#submitBtn').textContent = 'Guardar';
    }

    if (mode === 'edit' || mode === 'view') {

        form.elements.name.value = data.name;
        form.elements.numberphone.value = data.numberphone || '';
        form.elements.isActive.checked = data.isActive;

        if (mode === 'edit') {

            modalElement.querySelector('#modalTitle').textContent = 'Editar proveedor';
            form.querySelector('#submitBtn').textContent = 'Actualizar';
        }

        if (mode === 'view') {

            modalElement.querySelector('#modalTitle').textContent = 'Ver proveedor';

            setFormReadOnly({ form, isReadOnly: true });
        }
    }

    openModal(modalElement);
}

on('click', `#backBtn-${modalId}`, backModal());