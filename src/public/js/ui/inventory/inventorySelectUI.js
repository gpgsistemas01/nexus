import { toggleErrorMessages } from '../forms/formErrorsUI.js';
import { EMPTY_DISPLAY_VALUE } from '../../constants/display.js';
import { setFormDisabled } from '../forms/formStateUI.js';
import { isCreateMode } from '../../constants/formModes.js';
import { INPUT_SELECTORS } from '../../constants/selectors.js';
import { setMdbWrapperInputValue } from '../../plugins/mdb/baseInstance.js';
import { getMaterialName, getPresentation, getUnitMeasure, isRollPresentation } from '../../utils/warehouseInventoryUtils.js';

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

export const displayWasteMaterialTemplate = ({ form, template = {} }) => {
    setMdbWrapperInputValue({
        selector: INPUT_SELECTORS.WASTE_NAME_DISPLAY,
        value: getMaterialName(template) || ''
    });
    form.querySelector(INPUT_SELECTORS.WASTE_PRESENTATION_DISPLAY).textContent = getPresentation(template) || EMPTY_DISPLAY_VALUE;
    form.querySelector(INPUT_SELECTORS.WASTE_UNIT_MEASURE_DISPLAY).textContent = getUnitMeasure(template) || EMPTY_DISPLAY_VALUE;
};

export const applyWasteMaterialTemplate = ({ form, template = {} }) => {
    displayWasteMaterialTemplate({ form, template });
    if (form.elements?.weightKg) {
        form.elements.weightKg.value = '';
        toggleErrorMessages(form, { weightKg: null });
    }
    updateWasteWeightField({ form, template });
    [
        [INPUT_SELECTORS.WASTE_WIDTH, template.suggestedWidth],
        [INPUT_SELECTORS.WASTE_MAX_UNIT_COST, template.maxUnitCost]
    ].forEach(([selector, value]) => setMdbWrapperInputValue({
        selector,
        value: value ?? ''
    }));
};

export const updateWasteWeightField = ({ form, template = {} }) => {
    const field = form.elements?.weightKg;
    if (!field) return;
    const applies = isRollPresentation(getPresentation(template));
    setFormDisabled({ form, fields: ['weightKg'], isDisabled: !applies || !isCreateMode(form.dataset.mode) });
    if (!applies) field.value = '';
    if (field.id) setMdbWrapperInputValue({ selector: `#${field.id}`, value: field.value });
};
