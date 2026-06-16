import { useForm } from "../../application/form.js";
import { editWaste, editWasteStock, registerWaste } from "../../application/warehouse/wastes.js";
import { createWasteDatatable } from "../../plugins/datatable/wasteDatatable.js";
import { initWasteSelect2, setWasteSelectOptions } from "../../plugins/select2/modules/wasteSelect.js";
import { clearFormErrors, initForm } from "../../ui/formUI.js";
import { openModal } from "../../ui/modalUI.js";
import { configureStockAdjustmentForm, shouldShowStockAdjustmentFields } from "../../modules/stockAdjustmentForm.js";
import { handleSubmit, validateFields } from "../../utils/formUtils.js";
import { wasteDataValidators, wasteStockValidators, wasteValidators } from "../../utils/validations/validators.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";

const context = window.meta || {};

createWasteDatatable(context);

const wasteModalId = MODAL_SELECTORS.WASTE;
const formId = FORM_SELECTORS.WASTE_FORM;
const stockMode = 'edit-stock';
const wasteDataFields = ['supplierProductId', 'base', 'height'];
const wasteStockFields = ['currentStock', 'reasonId', 'observations'];
const stockSectionSelector = '.stock-data-section';
const isStockMode = (form) => form.dataset.mode === stockMode;

const setWasteValues = ({ form, data = null }) => {

    form.elements.base.value = data?.base || '';
    form.elements.height.value = data?.height || '';
    form.elements.currentStock.value = '';
    form.elements.observations.value = '';
};

const prepareWasteModal = ({
    mode,
    data,
    isStockAdjustment = false
}) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(wasteModalId);
    const showStockFields = shouldShowStockAdjustmentFields({
        mode,
        includeStockAdjustmentOnCreate: true,
        isStockAdjustment
    });

    initForm({ form, mode, id: mode === 'create' ? '' : data?.id });
    initWasteSelect2({ modalSelector: wasteModalId });
    setWasteSelectOptions({ modalSelector: wasteModalId, data });
    setWasteValues({
        form,
        data: mode === 'create' ? null : data
    });
    configureStockAdjustmentForm({
        form,
        dataFields: wasteDataFields,
        stockFields: wasteStockFields,
        stockSectionSelector,
        showStockFields,
        isStockAdjustment
    });
    clearFormErrors(form);

    return { form, modalElement };
};

export const openWasteModal = ({
    mode = 'create',
    data = null
} = {}) => {

    const { form, modalElement } = prepareWasteModal({
        mode,
        data,
        isStockAdjustment: false
    });

    modalElement.querySelector('#modalTitle').textContent = mode === 'edit'
        ? 'Editar merma'
        : 'Registrar merma';
    form.querySelector('#submitBtn').textContent = mode === 'edit'
        ? 'Actualizar'
        : 'Guardar';

    openModal(modalElement);
};

export const openWasteStockAdjustmentModal = ({
    mode = stockMode,
    data = null
} = {}) => {

    const { form, modalElement } = prepareWasteModal({
        mode,
        data,
        isStockAdjustment: true
    });

    modalElement.querySelector('#modalTitle').textContent = 'Editar stock de merma';
    form.querySelector('#submitBtn').textContent = 'Actualizar';

    openModal(modalElement);
};

useForm({
    selector: formId,
    getErrors: ({ form, formData }) => {

        if (isStockMode(form)) return validateFields(wasteStockValidators, formData);

        if (form.dataset.mode === 'edit') return validateFields(wasteDataValidators, formData);

        return validateFields(wasteValidators, formData);
    },
    sendRequest: async ({ formData, form }) => {

        await handleSubmit({
            form,
            formData,
            create: registerWaste,
            update: isStockMode(form) ? editWasteStock : editWaste
        });
    }
});
