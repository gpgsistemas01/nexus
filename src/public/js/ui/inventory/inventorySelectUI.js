import { setFormSectionVisibility, setFormDisabled } from '../forms/formStateUI.js';
import { isCreateMode, isEditMode, isStockMode } from '../../constants/formModes.js';
import { MATERIAL_ROLL_REFERENCE_FIELDS, INVENTORY_RESOURCES } from '../../constants/inventory.js';
import { INPUT_SELECTORS } from '../../constants/selectors.js';
import { setMdbWrapperInputValue } from '../../plugins/mdb/baseInstance.js';
import { isRollPresentation } from '../../utils/warehouseInventoryUtils.js';

export const updatePresentationDisplay = ({ modalSelector, data, presentation, option }) => {
    if (!option) return;

    Object.entries(data).forEach(([key, value]) => {
        option.dataset[key] = value;
    });

    setMdbWrapperInputValue({
        selector: `${ modalSelector } ${ INPUT_SELECTORS.PRESENTATION_DISPLAY }`,
        value: presentation.name || ''
    });
};

export const updateMaterialRollReferenceFields = ({ form }) => {
    const presentationName = form.elements.presentationId.selectedOptions?.[0]?.textContent;
    const applies = form.dataset.resource !== INVENTORY_RESOURCES.CONSUMABLE && isRollPresentation(presentationName);
    const canCapture = isCreateMode(form.dataset.mode) || isEditMode(form.dataset.mode);
    const hasReferences = MATERIAL_ROLL_REFERENCE_FIELDS.some(field => form.materialRollReference?.[field] != null);
    const isVisible = applies && !isStockMode(form.dataset.mode) && (canCapture || hasReferences);
    setFormSectionVisibility({
        form,
        selector: '.roll-reference-section',
        isVisible,
        fieldNames: MATERIAL_ROLL_REFERENCE_FIELDS,
        clearValues: !applies
    });
    MATERIAL_ROLL_REFERENCE_FIELDS.forEach(field => {
        const isRegistered = isEditMode(form.dataset.mode) && form.materialRollReference?.[field] != null;
        setFormDisabled({ form, fields: [field], isDisabled: !isVisible || !canCapture || isRegistered });
    });
};
