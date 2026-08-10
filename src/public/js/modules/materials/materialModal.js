import { openModal } from "../../ui/modalUI.js";
import { initMaterialFormSelect2, setMaterialFormSelectOptions } from "../../plugins/select2/modules/materialSelect.js";
import { setReasonVisualOption } from '../../plugins/select2/domains/reason.js';
import { clearFormErrors, initForm, setFormDisabled, setFormSectionVisibility } from "../../ui/formUI.js";
import { FORM_SELECTORS, MODAL_SELECTORS } from "../../constants/selectors.js";
import { materialDataFields, materialSecondaryDataFields, materialStockFields } from './materialFields.js';
import { FORM_MODES, isCreateMode, isEditMode, isStockMode } from '../../constants/formModes.js';

const initialStockReasonName = 'Stock inicial';
const stockDataSectionSelector = '.stock-data-section';
const goodsReceiptCreationContext = 'goodsReceipt';

export const openMaterialModal = ({
    mode = FORM_MODES.CREATE,
    data = null,
    onSave = null,
    creationContext = null
}) => {

    const form = document.querySelector(FORM_SELECTORS.MATERIAL_FORM);
    const modalElement = document.querySelector(MODAL_SELECTORS.MATERIAL);
    const isCreating = isCreateMode(mode);
    const isEditing = isEditMode(mode);
    const isAdjustingStock = isStockMode(mode);
    const isGoodsReceiptCreation = creationContext === goodsReceiptCreationContext;

    initForm({ 
        form, 
        mode, 
        id: data?.id 
    });
    initMaterialFormSelect2({ modalSelector: MODAL_SELECTORS.MATERIAL });
    setMaterialFormSelectOptions({ modalSelector: MODAL_SELECTORS.MATERIAL, data });
    form.dataset.creationContext = creationContext || '';

    form.elements.name.value = data?.name || '';
    form.elements.minStock.value = data?.minStock || '';
    form.elements.maxUnitCost.value = data?.maxUnitCost ?? '';
    form.elements.base.value = data?.base || '';
    form.elements.height.value = data?.height || '';
    form.elements.isActive.checked = data?.isActive ?? true;
    form.elements.newStock.value = '';
    form.elements.observations.value = '';

    setFormDisabled({ 
        form, 
        isDisabled: false 
    });
    setFormSectionVisibility({
        form,
        selector: stockDataSectionSelector,
        isVisible: !isEditing && !isGoodsReceiptCreation,
        fieldNames: materialStockFields
    });
    setFormDisabled({ 
        form, 
        fields: [...materialDataFields, 'minStock', 'maxUnitCost', 'isActive'],
        isDisabled: !isCreating
    });
    setFormDisabled({
        form,
        fields: materialSecondaryDataFields,
        isDisabled: isAdjustingStock
    });
    setFormSectionVisibility({
        form,
        selector: null,
        isVisible: !isGoodsReceiptCreation,
        fieldNames: ['maxUnitCost']
    });
    setReasonVisualOption({
        selector: `${ MODAL_SELECTORS.MATERIAL } ${ FORM_SELECTORS.REASON }`,
        name: !isAdjustingStock ? initialStockReasonName : null,
        isDisabled: !isAdjustingStock
    });
    clearFormErrors(form);

    modalElement.querySelector('#modalTitle').textContent = isEditing
        ? 'Editar material'
        : isAdjustingStock
            ? 'Ajustar stock de material'
            : 'Registrar material';
    form.querySelector('#submitBtn').textContent = isEditing
        ? 'Actualizar'
        : isAdjustingStock
            ? 'Ajustar'
            : 'Guardar';

    form.onSave = onSave;

    openModal(modalElement);
};
