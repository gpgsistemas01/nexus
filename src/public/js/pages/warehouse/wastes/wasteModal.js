import { WASTE_OPERATION_ACTIONS } from '../../../../../shared/constants/inventory.js';
import { initWasteSelect2, setWasteSelectOptions } from "../../../plugins/select2/modules/wasteSelect.js";
import { setFormDisabled, setFormSectionVisibility } from "../../../ui/forms/formStateUI.js";
import { initializeInventoryCrudModal } from '../../../ui/inventory/inventoryCrudModalUI.js';
import { openModal } from "../../../ui/modalUI.js";
import {
    BUTTON_SELECTORS,
    FORM_SELECTORS,
    HEADING_SELECTORS,
    MODAL_SELECTORS,
    SELECT_SELECTORS
} from "../../../constants/selectors.js";
import { wasteDataFields, wasteSecondaryDataFields } from './wasteFields.js';
import { FORM_MODES, isCreateMode, isEditMode, isStockMode } from '../../../constants/formModes.js';
import { configureWasteWeightFields, displayWasteMaterialTemplate } from '../../../ui/inventory/wasteFormUI.js';

import { showPendingWasteOperation } from '../../../ui/inventory/wasteOperationUI.js';

const stockDataSectionSelector = '.stock-data-section';
const materialTemplateFieldSelector = '.waste-material-template-field';

export const openWasteModal = ({
    mode = FORM_MODES.CREATE,
    data = null
} = {}) => {

    const form = document.querySelector(FORM_SELECTORS.WASTE);
    const modalElement = document.querySelector(MODAL_SELECTORS.WASTE);
    const isCreating = isCreateMode(mode);
    const isEditing = isEditMode(mode);
    const isAdjustingStock = isStockMode(mode);

    initializeInventoryCrudModal({ form, mode, data: isCreating ? null : data });
    form.wasteMaterialTemplate = null;
    form.wasteRollReference = null;
    initWasteSelect2({ modalSelector: MODAL_SELECTORS.WASTE });
    setWasteSelectOptions({ modalSelector: MODAL_SELECTORS.WASTE, data });

    form.elements.minStock.value = data?.minStock ?? '';
    ['base', 'height'].forEach(field => {
        form.elements[field].value = data?.[field] ?? '';
        form.elements[field].readOnly = false;
    });
    form.elements.maxUnitCost.value = data?.maxUnitCost ?? '';
    ['coneWeightKg', 'totalWeightKg', 'weightKg', 'referenceRollTotalWeightKg', 'sampleLengthM', 'sampleNetWeightKg'].forEach(field => { form.elements[field].value = data?.[field] ?? ''; });
    form.elements.isActive.checked = data?.isActive ?? true;
    form.elements.observations.value = '';
    form.elements.initialQuantity.value = '';
    form.elements.newStock.value = '';

    setFormSectionVisibility({
        form,
        selector: stockDataSectionSelector,
        isVisible: !isEditing
    });
    setFormSectionVisibility({
        form,
        selector: materialTemplateFieldSelector,
        isVisible: isCreating,
        fieldNames: ['materialId']
    });
    setFormDisabled({ 
        form, 
        fields: wasteDataFields, 
        isDisabled: !isCreating
    });
    setFormDisabled({
        form,
        fields: wasteSecondaryDataFields,
        isDisabled: isAdjustingStock
    });
    setFormDisabled({
        form,
        fields: ['name'],
        isDisabled: isAdjustingStock
    });
    setFormDisabled({ 
        form, 
        fields: ['observations'],
        isDisabled: isEditing
    });
    setFormSectionVisibility({
        form,
        selector: '[name="initialQuantity"]',
        isVisible: isCreating,
        fieldNames: ['initialQuantity'],
        clearValues: true
    });
    setFormSectionVisibility({
        form,
        selector: '[name="newStock"]',
        isVisible: isAdjustingStock,
        fieldNames: ['newStock'],
        clearValues: true
    });
    setFormSectionVisibility({
        form,
        selector: SELECT_SELECTORS.REASON,
        isVisible: isAdjustingStock,
        fieldNames: ['reasonId'],
        clearValues: true
    });
    modalElement.querySelector(HEADING_SELECTORS.MODAL_TITLE).textContent = isEditing
        ? 'Editar merma'
        : isAdjustingStock
            ? 'Ajustar stock de merma'
            : 'Registrar merma';
    form.querySelector(BUTTON_SELECTORS.SUBMIT).textContent = isEditing
        ? 'Actualizar'
        : isAdjustingStock
            ? 'Ajustar'
            : 'Guardar';

    displayWasteMaterialTemplate({ form, template: data ?? {} });
    configureWasteWeightFields({ form, template: data ?? {} });
    if (isCreating) showPendingWasteOperation({ form, action: WASTE_OPERATION_ACTIONS.CREATE });
    else form.querySelector('[data-pending-waste-operation]')?.remove();
    openModal(modalElement);
};
