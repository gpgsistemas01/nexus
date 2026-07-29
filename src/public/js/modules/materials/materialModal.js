import { openModal } from "../../ui/modalUI.js";
import { initMaterialFormSelect2, setMaterialFormSelectOptions, setMaterialReasonVisualOption } from "../../plugins/select2/modules/materialSelect.js";
import { configureStockAdjustmentForm, shouldShowStockAdjustmentFields } from "../stockAdjustmentForm.js";
import { clearFormErrors, initForm, setFormFieldVisibility, setFormDisabled } from "../../ui/formUI.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";

const materialModalId = MODAL_SELECTORS.MATERIAL;
const formId = FORM_SELECTORS.MATERIAL_FORM;
const materialDataFields = ['name', 'minStock', 'maxUnitCost', 'base', 'height', 'supplierId', 'presentationId', 'unitMeasureId', 'isActive'];
const stockFields = ['newStock', 'reasonId', 'observations'];
const stockSectionSelector = '.stock-data-section';
const goodsReceiptCreationContext = 'goodsReceipt';
const maxUnitCostLabel = 'Costo Máximo';
const newStockLabel = 'Nueva cantidad';
const initialStockReasonName = 'Stock inicial';

const setMaterialValues = ({ form, data = null }) => {

    form.elements.name.value = data?.name || '';
    form.elements.minStock.value = data?.minStock || '';
    form.elements.maxUnitCost.value = data?.maxUnitCost ?? '';
    form.elements.base.value = data?.base || '';
    form.elements.height.value = data?.height || '';

    if (form.elements.isActive) form.elements.isActive.checked = data?.isActive === undefined ? true : Boolean(data.isActive);
};

const resetMaterialFormFieldStates = (form) => {

    setFormDisabled({
        form,
        isDisabled: false
    });
};

const setMaterialModalFieldVisibility = ({
    form,
    showStockFields,
    isStockAdjustment,
    creationContext
}) => {

    configureStockAdjustmentForm({
        form,
        dataFields: materialDataFields,
        stockFields,
        stockSectionSelector,
        showStockFields,
        isStockAdjustment,
        setDataFieldsDisabled: false
    });

    setFormFieldVisibility({
        form,
        fieldName: materialDataFields,
        isVisible: creationContext !== goodsReceiptCreationContext,
        clearWhenHidden: true,
        requiredWhenVisible: true,
        enableWhenVisible: true,
        labelContent: maxUnitCostLabel
    });

    setFormFieldVisibility({
        form,
        fieldName: stockFields,
        isVisible: showStockFields,
        clearWhenHidden: !showStockFields,
        requiredWhenVisible: showStockFields,
        enableWhenVisible: true,
        labelContent: newStockLabel
    });
};

const setCreateOrEditMaterialFieldStates = ({ form, hasInitialStockFields }) => {

    setFormDisabled({
        form,
        fields: materialDataFields,
        isDisabled: false
    });

    setFormDisabled({
        form,
        fields: stockFields,
        isDisabled: false
    });

    if (!hasInitialStockFields) return;

    setFormDisabled({
        form,
        fields: ['reasonId'],
        isDisabled: true
    });
};

const setStockAdjustmentFieldStates = ({ form }) => {

    setFormDisabled({
        form,
        fields: materialDataFields,
        isDisabled: true
    });

    setFormDisabled({
        form,
        fields: stockFields,
        isDisabled: false
    });
};

const setMaterialModalFieldStates = ({
    form,
    showStockFields,
    isStockAdjustment,
    creationContext
}) => {

    resetMaterialFormFieldStates(form);
    setMaterialModalFieldVisibility({
        form,
        showStockFields,
        isStockAdjustment,
        creationContext
    });

    if (isStockAdjustment) {
        setStockAdjustmentFieldStates({ form });
        return;
    }

    setCreateOrEditMaterialFieldStates({
        form,
        hasInitialStockFields: showStockFields
    });
};

const prepareMaterialModal = ({
    mode,
    data,
    isStockAdjustment,
    includeStockAdjustmentOnCreate = mode === 'create',
    creationContext = null
}) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(materialModalId);

    const showStockFields = shouldShowStockAdjustmentFields({
        mode,
        includeStockAdjustmentOnCreate,
        isStockAdjustment
    });
    const isInitialStockCreation = showStockFields && mode === 'create' && !isStockAdjustment;

    initForm({ form, mode, id: data?.id });
    clearFormErrors(form);
    form.dataset.includeStockAdjustmentOnCreate = showStockFields && !isStockAdjustment ? 'true' : 'false';
    form.dataset.creationContext = creationContext || '';
    setMaterialModalFieldStates({
        form,
        showStockFields,
        isStockAdjustment,
        creationContext
    });
    initMaterialFormSelect2({
        modalSelector: materialModalId,
        isStockAdjustment: showStockFields
    });
    setMaterialFormSelectOptions({ modalSelector: materialModalId, data, isStockAdjustment: showStockFields });
    setMaterialReasonVisualOption({
        modalSelector: materialModalId,
        name: isInitialStockCreation ? initialStockReasonName : null,
        isDisabled: isInitialStockCreation
    });

    return { form, modalElement };
};

export const openMaterialModal = ({
    mode = 'create',
    data = null,
    onSave = null,
    includeStockAdjustmentOnCreate = mode === 'create',
    creationContext = null
}) => {

    const { form, modalElement } = prepareMaterialModal({
        mode,
        data,
        isStockAdjustment: mode === 'edit-stock',
        includeStockAdjustmentOnCreate,
        creationContext
    });

    setMaterialValues({ form, data: mode === 'edit' ? data : { name: data?.name, supplier: data?.supplier } });
    if (mode === 'create') {
        modalElement.querySelector('#modalTitle').textContent = 'Registrar material';
        form.querySelector('#submitBtn').textContent = 'Guardar';
    }

    if (mode === 'edit') {
        modalElement.querySelector('#modalTitle').textContent = 'Editar material';
        form.querySelector('#submitBtn').textContent = 'Editar';
    }

    form.onSave = onSave;

    openModal(modalElement);
};

export const openStockAdjustmentModal = ({
    mode = 'edit-stock',
    data = null,
    onSave = null,
    title = 'Editar stock de material',
    submitText = 'Ajustar',
    beforeOpen = null
}) => {

    const { form, modalElement } = prepareMaterialModal({ mode, data, isStockAdjustment: true });

    setMaterialValues({ form, data });
    beforeOpen?.({ form, modalElement });
    modalElement.querySelector('#modalTitle').textContent = title;
    form.querySelector('#submitBtn').textContent = submitText;

    form.onSave = onSave;

    openModal(modalElement);
};
