import { EMPTY_DISPLAY_VALUE } from '../../constants/display.js';
import { isCreateMode } from '../../constants/formModes.js';
import { INPUT_SELECTORS } from '../../constants/selectors.js';
import { setMdbWrapperInputValue } from '../../plugins/mdb/baseInstance.js';
import { calculateWasteNetWeight, calculateWasteRollLength, getMaterialName, getPresentation, getUnitMeasure, isRollPresentation, prepareWasteRollReference } from '../../utils/warehouseInventoryUtils.js';
import { toggleErrorMessages } from '../forms/formErrorsUI.js';
import { setFormSectionVisibility, setFormDisabled } from '../forms/formStateUI.js';

export const displayWasteMaterialTemplate = ({ form, template = {} }) => {
    setMdbWrapperInputValue({
        selector: INPUT_SELECTORS.WASTE_NAME_DISPLAY,
        value: getMaterialName(template) || ''
    });
    setMdbWrapperInputValue({ selector: INPUT_SELECTORS.WASTE_PRESENTATION_DISPLAY, value: getPresentation(template) || EMPTY_DISPLAY_VALUE });
    setMdbWrapperInputValue({ selector: INPUT_SELECTORS.WASTE_UNIT_MEASURE_DISPLAY, value: getUnitMeasure(template) || EMPTY_DISPLAY_VALUE });
    setFormDisabled({ form, fields: ['presentationDisplay', 'unitMeasureDisplay'], isDisabled: true });
};

export const configureWasteWeightFields = ({ form, template = {} }) => {
    const applies = isRollPresentation(getPresentation(template));
    const isCreating = isCreateMode(form.dataset.mode);
    setFormSectionVisibility({ form, selector: '.waste-weight-fields', isVisible: applies });
    setFormDisabled({ form, fields: ['coneWeightKg', 'totalWeightKg'], isDisabled: !applies || !isCreating });
    setFormDisabled({ form, fields: ['weightKg'], isDisabled: true });
    setFormDisabled({ form, fields: ['base', 'height'], isDisabled: applies || !isCreating });
};

export const applyWasteMaterialTemplate = ({ form, template = null }) => {
    if (!isCreateMode(form.dataset.mode)) return;

    form.wasteMaterialTemplate = template;
    template ??= {};
    const offer = template.supplierMaterials?.[0] ?? {};
    const reference = prepareWasteRollReference({ ...offer, material: template });
    form.wasteRollReference = reference;

    toggleErrorMessages(form, { coneWeightKg: null, totalWeightKg: null, base: null, height: null });
    displayWasteMaterialTemplate({ form, template });
    configureWasteWeightFields({ form, template });
    setMdbWrapperInputValue({ selector: INPUT_SELECTORS.WASTE_MAX_UNIT_COST, value: template.maxUnitCost ?? '' });

    const values = {
        coneWeightKg: isRollPresentation(getPresentation(template)) ? offer.referenceConeWeightKg : null,
        totalWeightKg: null,
        weightKg: null,
        base: reference?.widthField === 'base' ? reference.widthM : null,
        height: reference?.widthField === 'height' ? reference.widthM : null
    };
    Object.entries(values).forEach(([name, value]) => {
        const field = form.elements[name];
        field.value = value ?? '';
        if (field.id) setMdbWrapperInputValue({ selector: `#${field.id}`, value: field.value });
    });
};

export const updateWasteRollMeasurement = ({ form }) => {
    if (!isCreateMode(form.dataset.mode)
        || !isRollPresentation(getPresentation(form.wasteMaterialTemplate ?? {}))) return;

    const weightKg = calculateWasteNetWeight({
        coneWeightKg: form.elements.coneWeightKg.value,
        totalWeightKg: form.elements.totalWeightKg.value
    });
    const weightField = form.elements.weightKg;
    weightField.value = weightKg ?? '';
    if (weightField.id) setMdbWrapperInputValue({ selector: `#${weightField.id}`, value: weightField.value });

    const reference = form.wasteRollReference;
    if (!reference) return;

    const length = weightKg == null ? null : calculateWasteRollLength({ weightKg, ...reference });
    const lengthField = form.elements[reference.lengthField];
    lengthField.value = length ?? '';
    if (lengthField.id) setMdbWrapperInputValue({ selector: `#${lengthField.id}`, value: lengthField.value });
};
