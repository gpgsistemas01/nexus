import { openModal } from "../../../ui/modalUI.js";
import { initMaterialFormSelect2, setMaterialFormSelectOptions } from "../../../plugins/select2/modules/materialSelect.js";
import { setReasonVisualOption } from '../../../plugins/select2/domains/reason.js';
import { clearFormErrors } from "../../../ui/forms/formErrorsUI.js";
import { initForm, setFormDisabled, setFormSectionVisibility } from "../../../ui/forms/formStateUI.js";
import { BUTTON_SELECTORS, FORM_SELECTORS, HEADING_SELECTORS, MODAL_SELECTORS, SELECT_SELECTORS } from "../../../constants/selectors.js";
import { materialDataFields, materialEditableDataFields } from './materialFields.js';
import { FORM_MODES, isCreateMode, isEditMode, isStockMode } from '../../../constants/formModes.js';

const initialStockReasonName = 'Stock inicial';
const stockDataSectionSelector = '.stock-data-section';
const goodsReceiptCreationContext = 'goodsReceipt';

export const openMaterialModal = ({
    mode = FORM_MODES.CREATE,
    data = null,
    onSave = null,
    creationContext = null
}) => {

    const form = document.querySelector(FORM_SELECTORS.MATERIAL);
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

    form.elements.name.value = data?.name ?? '';
    form.elements.minStock.value = data?.minStock ?? '';
    form.elements.maxUnitCost.value = data?.maxUnitCost ?? '';
    form.elements.base.value = data?.base ?? '';
    form.elements.height.value = data?.height ?? '';
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
        isVisible: !isEditing && !isGoodsReceiptCreation
    });
    setFormSectionVisibility({
        form,
        isVisible: !isGoodsReceiptCreation,
        fieldNames: ['maxUnitCost']
    });
    form.elements.maxUnitCost.required = !isGoodsReceiptCreation;
    setFormDisabled({ 
        form, 
        fields: [...materialDataFields, 'minStock', 'maxUnitCost', 'isActive'],
        isDisabled: !isCreating
    });
    setFormDisabled({
        form,
        fields: materialEditableDataFields,
        isDisabled: isAdjustingStock
    });
    setFormDisabled({
        form,
        fields: ['maxUnitCost'],
        isDisabled: isAdjustingStock || isGoodsReceiptCreation
    });
    setReasonVisualOption({
        selector: `${ MODAL_SELECTORS.MATERIAL } ${ SELECT_SELECTORS.REASON }`,
        name: !isAdjustingStock ? initialStockReasonName : null,
        isDisabled: !isAdjustingStock
    });
    clearFormErrors(form);

    modalElement.querySelector(HEADING_SELECTORS.MODAL_TITLE).textContent = isEditing
        ? 'Editar material'
        : isAdjustingStock
            ? 'Ajustar stock de material'
            : 'Registrar material';
    form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = isEditing
        ? 'Actualizar'
        : isAdjustingStock
            ? 'Ajustar'
            : 'Guardar';

    form.onSave = onSave;

    openModal(modalElement);
};
