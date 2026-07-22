import { openModal } from "../../ui/modalUI.js";
import { syncMdbWrapperInputs } from "../../plugins/mdb/baseInstance.js";
import { initProductFormSelect2, setProductFormSelectOptions, setProductReasonVisualOption } from "../../plugins/select2/modules/productSelect.js";
import { configureStockAdjustmentForm, shouldShowStockAdjustmentFields } from "../stockAdjustmentForm.js";
import { clearFormErrors, initForm, setFormFieldVisibility } from "../../ui/formUI.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";

const productModalId = MODAL_SELECTORS.PRODUCT;
const formId = FORM_SELECTORS.PRODUCT_FORM;
const productFields = ['name', 'minStock', 'maxUnitCost', 'base', 'height', 'supplierId', 'presentationId', 'unitMeasureId', 'isActive'];
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
    configureStockAdjustmentForm({
        form,
        dataFields: productFields,
        stockFields,
        stockSectionSelector,
        showStockFields,
        isStockAdjustment
    });
    setFormFieldVisibility({
        form,
        fieldName: 'maxUnitCost',
        isVisible: creationContext !== goodsReceiptCreationContext,
        clearWhenHidden: true,
        requiredWhenVisible: true,
        enableWhenVisible: !isStockAdjustment,
        labelContent: maxUnitCostLabel
    });
    setFormFieldVisibility({
        form,
        fieldName: 'newStock',
        isVisible: showStockFields,
        clearWhenHidden: !showStockFields,
        requiredWhenVisible: showStockFields,
        enableWhenVisible: true,
        labelContent: newStockLabel
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
        isStockAdjustment: false,
        includeStockAdjustmentOnCreate,
        creationContext
    });

    setProductValues({ form, data: mode === 'edit' ? data : { name: data?.name, supplier: data?.supplier } });
    syncMdbWrapperInputs(form);

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
    syncMdbWrapperInputs(form);

    modalElement.querySelector('#modalTitle').textContent = title;
    form.querySelector('#submitBtn').textContent = submitText;

    form.onSave = onSave;

    openModal(modalElement);
};
