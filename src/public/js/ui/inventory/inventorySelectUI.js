import { setFormSectionVisibility, setFormDisabled } from '../forms/formStateUI.js';
import { isCreateMode, isEditMode } from '../../constants/formModes.js';
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
    setFormSectionVisibility({
        form,
        selector: '.roll-reference-section',
        isVisible: applies,
        fieldNames: MATERIAL_ROLL_REFERENCE_FIELDS,
        clearValues: true
    });
    setFormDisabled({ form, fields: MATERIAL_ROLL_REFERENCE_FIELDS, isDisabled: !applies || (!isCreateMode(form.dataset.mode) && !isEditMode(form.dataset.mode)) });
};
