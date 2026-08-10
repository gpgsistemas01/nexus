import { useForm } from "../../application/form.js";
import { cancelPurchaseRequisition, confirmPurchaseRequisition, editPurchaseRequisition, registerPurchaseRequisition } from "../../application/warehouse/purchaseRequisitions.js";
import { refreshMaterialTable } from "../../plugins/datatable/utils/renderMaterialDatatable.js";
import { createPurchaseRequisitionDatatable, details, initDetailsPurchaseRequisitionTable } from "../../plugins/datatable/purchaseRequisitionDatatable.js";
import { initPurchaseRequisitionFormSelect2 } from "../../plugins/select2/modules/purchaseRequisitionSelect.js";
import { setFormDisabled, toggleButtons, clearFormErrors, normalizeFormErrors, clearAddedMaterialInput, initForm } from "../../ui/formUI.js";
import { openModal } from "../../ui/modalUI.js";
import { on } from "../../utils/domUtils.js";
import { setDateTimePickerValue } from "../../plugins/flatpickr/dateTimePicker.js";
import { handleAction, handleSubmit, hasValidationErrors, validateFields } from "../../utils/formUtils.js";
import { addMaterialValidation, purchaseRequisitionValidation } from "../../utils/validations/validators.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";

const context = window.meta || {};
const modalId = MODAL_SELECTORS.PURCHASE_REQUISITION;
const formId = FORM_SELECTORS.PURCHASE_REQUISITION;
const backSelector = `#backBtn-${modalId.replace('#', '')}`;

createPurchaseRequisitionDatatable(context);

useForm({
    selector: formId,
    normalizeData: ({ formData }) => {

        formData.details = details;

        return formData;
    },
    getErrors: ({ formData }) => {

        let errors = {};

        errors = validateFields(purchaseRequisitionValidation, formData);

        return errors;
    },
    sendRequest: async ({ formData, form }) => {

        await handleSubmit({
            form,
            formData,
            create: registerPurchaseRequisition,
            update: editPurchaseRequisition
        });
    },
});

export const openPurchaseRequisitionModal = async ({ mode, data = null }) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(modalId);

    initForm(form, data?.id || '');
    clearFormErrors(form);
    toggleButtons({ mode, status: data?.status?.name });
    setFormDisabled({ form, isDisabled: false });

    details.length = 0;

    if (mode === 'create') {

        form.reset();
        modalElement.querySelector('#modalTitle').textContent = 'Registrar requisición';
        form.querySelector('#submitBtn').textContent = 'Guardar';
        form.querySelector('#presentationDisplayInput').value = '';

        await initPurchaseRequisitionFormSelect2();
    }

    if (mode === 'edit' || mode === 'view') {

        form.querySelector('#observationsInput').value = data.observations || '';
        setDateTimePickerValue(form.querySelector('#requestDateInput'), data.requestDate);
        details.push(...data?.details.map(detail => ({
            id: detail.id,
            name: detail.material.name,
            materialId: detail.material.id,
            quantity: detail.quantity,
            description: detail.description,
            uom: detail.material.presentation?.name || 'PIEZA'
        })));

        await initPurchaseRequisitionFormSelect2(data);

        if (mode === 'edit') {

            modalElement.querySelector('#modalTitle').textContent = 'Editar requisición';
            form.querySelector('#submitBtn').textContent = 'Actualizar';
        }

        if (mode === 'view') {

            modalElement.querySelector('#modalTitle').textContent = 'Ver requisición';

            setFormDisabled({ form, isDisabled: true });
        }
    }

    initDetailsPurchaseRequisitionTable(mode);

    openModal(modalElement);
};

const addMaterial = () => {

    const option = document.querySelector('#materialInput option:checked');

    const { materialName, presentation } = option?.dataset;
    const materialId = option.value;
    const quantity = document.querySelector('#quantityInput').value;

    const errors = validateFields(addMaterialValidation, {
        materialId,
        quantity
    });

    normalizeFormErrors({ form: document.querySelector(formId), errors });

    if (hasValidationErrors(errors)) return;

    if (!option) return null;

    const material = { materialId, name: materialName, quantity, presentation };
    details.push(material);

    refreshMaterialTable(details);

    clearAddedMaterialInput();
};

on('click', '#addMaterialBtn', addMaterial);
on('click', '#cancelBtn', async ()=> await handleAction({ action: cancelPurchaseRequisition, formId }));
on('click', '#confirmBtn', async () => await handleAction({ action: confirmPurchaseRequisition, formId }));
