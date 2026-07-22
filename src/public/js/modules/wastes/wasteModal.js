import { initWasteSelect2, setWasteReasonVisualOption, setWasteSelectOptions } from "../../plugins/select2/modules/wasteSelect.js";
import { clearFormErrors, initForm, setFormDisabled } from "../../ui/formUI.js";
import { openModal } from "../../ui/modalUI.js";
import { configureStockAdjustmentForm, shouldShowStockAdjustmentFields } from "../stockAdjustmentForm.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";

const wasteModalId = MODAL_SELECTORS.WASTE;
const formId = FORM_SELECTORS.WASTE_FORM;
const stockMode = 'edit-stock';
const wasteDataFields = ['supplierProductId', 'base', 'height'];
const wasteInitialStockFields = ['currentStock', 'reasonId', 'observations'];
const wasteStockAdjustmentFields = ['currentStock', 'reasonId', 'observations'];
const stockSectionSelector = '.stock-data-section';
const initialStockReasonName = 'Stock inicial';

const resetWasteFormFieldStates = (form) => {

    setFormDisabled({
        form,
        isDisabled: false
    });
};

const setWasteModalFieldStates = ({
    form,
    showStockFields,
    isStockAdjustment
}) => {

    resetWasteFormFieldStates(form);

    configureStockAdjustmentForm({
        form,
        dataFields: wasteDataFields,
        stockFields: isStockAdjustment ? wasteStockAdjustmentFields : wasteInitialStockFields,
        stockSectionSelector,
        showStockFields,
        isStockAdjustment,
        setDataFieldsDisabled: false
    });

    setFormDisabled({
        form,
        fields: wasteDataFields,
        isDisabled: isStockAdjustment
    });

    setFormDisabled({
        form,
        fields: isStockAdjustment ? wasteStockAdjustmentFields : wasteInitialStockFields,
        isDisabled: false
    });
};

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
    const isInitialStockCreation = showStockFields && mode === 'create' && !isStockAdjustment;

    initForm({ form, mode, id: mode === 'create' ? '' : data?.id });
    initWasteSelect2({ modalSelector: wasteModalId });
    setWasteSelectOptions({ modalSelector: wasteModalId, data });
    setWasteValues({
        form,
        data: mode === 'create' ? null : data
    });
    setWasteModalFieldStates({
        form,
        showStockFields,
        isStockAdjustment
    });
    setWasteReasonVisualOption({
        modalSelector: wasteModalId,
        name: isInitialStockCreation ? initialStockReasonName : null,
        isDisabled: isInitialStockCreation
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
