import { getPresentation, getUnitMeasure } from '../../../utils/warehouseInventoryUtils.js';
import { INPUT_SELECTORS } from '../../../constants/selectors.js';
import { EMPTY_DISPLAY_VALUE } from '../../../constants/display.js';
import { setMdbWrapperInputValue } from '../../../plugins/mdb/baseInstance.js';

export const displayWasteMaterialTemplate = ({ form, template = {} }) => {
    form.querySelector(INPUT_SELECTORS.WASTE_PRESENTATION_DISPLAY).textContent = getPresentation(template) || EMPTY_DISPLAY_VALUE;
    form.querySelector(INPUT_SELECTORS.WASTE_UNIT_MEASURE_DISPLAY).textContent = getUnitMeasure(template) || EMPTY_DISPLAY_VALUE;
};

export const applyWasteMaterialTemplate = ({ form, template = {} }) => {
    displayWasteMaterialTemplate({ form, template });
    setMdbWrapperInputValue({
        selector: INPUT_SELECTORS.WASTE_WIDTH,
        value: template.suggestedWidth ?? ''
    });
    form.elements.maxUnitCost.value = template.maxUnitCost ?? '';
};
