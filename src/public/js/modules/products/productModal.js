import { openModal } from "../../ui/modalUI.js";
import { initProductFormSelect2, setProductFormSelectOptions, setProductReasonVisualOption } from "../../plugins/select2/modules/productSelect.js";
import { configureStockAdjustmentForm, shouldShowStockAdjustmentFields } from "../stockAdjustmentForm.js";
import { clearFormErrors, initForm, setFormFieldVisibility, setFormReadOnly } from "../../ui/formUI.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";

const productModalId = MODAL_SELECTORS.PRODUCT;
const formId = FORM_SELECTORS.PRODUCT_FORM;
const productDataFields = ['name', 'minStock', 'maxUnitCost', 'base', 'height', 'supplierId', 'presentationId', 'unitMeasureId', 'isActive'];
const stockFields = ['newStock', 'reasonId', 'observations'];
const stockSectionSelector = '.stock-data-section';
const goodsReceiptCreationContext = 'goodsReceipt';
const maxUnitCostLabel = 'Costo Máximo';
const newStockLabel = 'Nueva cantidad';
const initialStockReasonName = 'Stock inicial';

const setProductValues = ({ form, data = null }) => {

    form.elements.name.value = data?.name || '';
    form.elements.minStock.value = data?.minStock || '';
    form.elements.maxUnitCost.value = data?.maxUnitCost ?? '';
    form.elements.base.value = data?.base || '';
    form.elements.height.value = data?.height || '';

    if (form.elements.isActive) form.elements.isActive.checked = data?.isActive === undefined ? true : Boolean(data.isActive);
};

const resetProductFormFieldStates = (form) => {

    setFormReadOnly({
        form,
        isReadOnly: false
    });
};

const setProductModalFieldVisibility = ({
    form,
    showStockFields,
    isStockAdjustment,
    creationContext
}) => {

    configureStockAdjustmentForm({
        form,
        dataFields: productDataFields,
        stockFields,
        stockSectionSelector,
        showStockFields,
        isStockAdjustment,
        setDataFieldsReadOnly: false
    });

    setFormFieldVisibility({
        form,
        fieldName: productDataFields,
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

const setCreateOrEditProductFieldStates = ({ form, hasInitialStockFields }) => {

    setFormReadOnly({
        form,
        fields: productDataFields,
        isReadOnly: false
    });

    setFormReadOnly({
        form,
        fields: stockFields,
        isReadOnly: false
    });

    if (!hasInitialStockFields) return;

    setFormReadOnly({
        form,
        fields: ['reasonId'],
        isReadOnly: true
    });
};

const setStockAdjustmentFieldStates = ({ form }) => {

    setFormReadOnly({
        form,
        fields: productDataFields,
        isReadOnly: true
    });

    setFormReadOnly({
        form,
        fields: stockFields,
        isReadOnly: false
    });
};

const setProductModalFieldStates = ({
    form,
    showStockFields,
    isStockAdjustment,
    creationContext
}) => {

    resetProductFormFieldStates(form);
    setProductModalFieldVisibility({
        form,
        showStockFields,
        isStockAdjustment,
        creationContext
    });

    if (isStockAdjustment) {
        setStockAdjustmentFieldStates({ form });
        return;
    }

    setCreateOrEditProductFieldStates({
        form,
        hasInitialStockFields: showStockFields
    });
};

const prepareProductModal = ({
    mode,
    data,
    isStockAdjustment,
    includeStockAdjustmentOnCreate = mode === 'create',
    creationContext = null
}) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(productModalId);

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
    setProductModalFieldStates({
        form,
        showStockFields,
        isStockAdjustment,
        creationContext
    });
    initProductFormSelect2({
        modalSelector: productModalId,
        isStockAdjustment: showStockFields
    });
    setProductFormSelectOptions({ modalSelector: productModalId, data, isStockAdjustment: showStockFields });
    setProductReasonVisualOption({
        modalSelector: productModalId,
        name: isInitialStockCreation ? initialStockReasonName : null,
        isDisabled: isInitialStockCreation
    });

    return { form, modalElement };
};

export const openProductModal = ({
    mode = 'create',
    data = null,
    onSave = null,
    includeStockAdjustmentOnCreate = mode === 'create',
    creationContext = null
}) => {

    const { form, modalElement } = prepareProductModal({
        mode,
        data,
        isStockAdjustment: mode === 'edit-stock',
        includeStockAdjustmentOnCreate,
        creationContext
    });

    setProductValues({ form, data: mode === 'edit' ? data : { name: data?.name, supplier: data?.supplier } });
    if (mode === 'create') {
        modalElement.querySelector('#modalTitle').textContent = 'Registrar producto';
        form.querySelector('#submitBtn').textContent = 'Guardar';
    }

    if (mode === 'edit') {
        modalElement.querySelector('#modalTitle').textContent = 'Editar producto';
        form.querySelector('#submitBtn').textContent = 'Editar';
    }

    form.onSave = onSave;

    openModal(modalElement);
};

export const openStockAdjustmentModal = ({
    mode = 'edit-stock',
    data = null,
    onSave = null,
    title = 'Editar stock de producto',
    submitText = 'Ajustar',
    beforeOpen = null
}) => {

    const { form, modalElement } = prepareProductModal({ mode, data, isStockAdjustment: true });

    setProductValues({ form, data });
    beforeOpen?.({ form, modalElement });
    modalElement.querySelector('#modalTitle').textContent = title;
    form.querySelector('#submitBtn').textContent = submitText;

    form.onSave = onSave;

    openModal(modalElement);
};
