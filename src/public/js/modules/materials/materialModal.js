import { openModal } from "../../ui/modalUI.js";
import { initMaterialFormSelect2, setMaterialFormSelectOptions } from "../../plugins/select2/modules/materialSelect.js";
import { setReasonVisualOption } from '../../plugins/select2/domains/reason.js';
import { clearFormErrors, hideFormFields, hideFormSection, initForm, setFormDisabled } from "../../ui/formUI.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";
import { UI_PERMISSIONS } from "../../constants/permissions.js";

const materialModalId = MODAL_SELECTORS.MATERIAL;
const formId = FORM_SELECTORS.MATERIAL_FORM;
const materialDataFields = ['name', 'minStock', 'maxUnitCost', 'base', 'height', 'presentationId', 'unitMeasureId', 'isActive'];
const supplierField = 'supplierId';
const maxUnitCostField = 'maxUnitCost';
const stockFields = ['newStock', 'reasonId', 'observations'];
const goodsReceiptCreationContext = 'goodsReceipt';
const maxUnitCostLabel = 'Costo Máximo';

const getCanAdjustStock = () => {
    const appContext = typeof window !== 'undefined' ? window.APP_CONTEXT || {} : {};
    const permissions = appContext.permissions || [];

    return Array.isArray(permissions)
        ? permissions.includes(UI_PERMISSIONS.MATERIALS_ADJUST_STOCK)
        : false;
};

const setMaterialValues = ({ form, data = null, creationContext = null }) => {

    form.elements.name.value = data?.name || '';
    form.elements.minStock.value = data?.minStock || '';
    form.elements.maxUnitCost.value = creationContext === goodsReceiptCreationContext ? '' : data?.maxUnitCost ?? '';
    form.elements.base.value = data?.base || '';
    form.elements.height.value = data?.height || '';

    if (form.elements.isActive) form.elements.isActive.checked = data?.isActive === undefined ? true : Boolean(data.isActive);
};

const setupMaterialModalFields = ({
    form,
    isStockAdjustment,
    creationContext
}) => {

    setFormDisabled({ form, isDisabled: false });
    setFormDisabled({ form, fields: materialDataFields, isDisabled: isStockAdjustment });
    setFormDisabled({ form, fields: stockFields, isDisabled: !isStockAdjustment });

    const isEditMode = form.dataset.mode === 'edit';
    setFormDisabled({
        form,
        fields: [supplierField],
        isDisabled: isEditMode || isStockAdjustment
    });

    const shouldHideMaxUnitCost = creationContext === goodsReceiptCreationContext;

    hideFormFields({
        form,
        fieldNames: [maxUnitCostField],
        isHidden: shouldHideMaxUnitCost,
        clearValues: true
    });

    if (!shouldHideMaxUnitCost) {
        setFormDisabled({
            form,
            fields: [maxUnitCostField],
            isDisabled: false
        });
    }

    const isGoodsReceiptCreation = creationContext === goodsReceiptCreationContext;
    const canAdjustStock = getCanAdjustStock();
    const shouldHideStockSection = isGoodsReceiptCreation || (!isStockAdjustment && !canAdjustStock);

    hideFormSection({
        form,
        selector: '.stock-data-section',
        isHidden: shouldHideStockSection,
        fieldNames: stockFields,
        clearValues: shouldHideStockSection
    });
};

const prepareMaterialModal = ({
    mode,
    data,
    isStockAdjustment,
    creationContext = null
}) => {

    const form = document.querySelector(formId);
    const modalElement = document.querySelector(materialModalId);

    initForm({ form, mode, id: data?.id });
    clearFormErrors(form);
    form.dataset.creationContext = creationContext || '';
    setupMaterialModalFields({
        form,
        isStockAdjustment,
        creationContext
    });
    initMaterialFormSelect2({
        modalSelector: materialModalId,
        isStockAdjustment
    });
    setMaterialFormSelectOptions({ modalSelector: materialModalId, data, isStockAdjustment });
    setReasonVisualOption({ selector: `${ materialModalId } ${ FORM_SELECTORS.REASON }` });

    return { form, modalElement };
};

export const openMaterialModal = ({
    mode = 'create',
    data = null,
    onSave = null,
    creationContext = null
}) => {

    const { form, modalElement } = prepareMaterialModal({
        mode,
        data,
        isStockAdjustment: mode === 'edit-stock',
        creationContext
    });

    setMaterialValues({
        form,
        data: mode === 'edit' ? data : { name: data?.name, supplier: data?.supplier },
        creationContext
    });
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

    setMaterialValues({ form, data, creationContext: null });
    beforeOpen?.({ form, modalElement });
    modalElement.querySelector('#modalTitle').textContent = title;
    form.querySelector('#submitBtn').textContent = submitText;

    form.onSave = onSave;

    openModal(modalElement);
};
