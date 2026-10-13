import { toggleErrorMessages } from '../forms/formErrorsUI.js';
import { calculateWasteRollLength } from '../../utils/wasteRollUtils.js';
import { hasPermission, UI_PERMISSIONS } from '../../constants/permissions.js';
import { EMPTY_DISPLAY_VALUE } from '../../constants/display.js';
import { setFormDisabled } from '../forms/formStateUI.js';
import { isCreateMode } from '../../constants/formModes.js';
import { INPUT_SELECTORS } from '../../constants/selectors.js';
import { setMdbWrapperInputValue } from '../../plugins/mdb/baseInstance.js';
import { calculateWasteNetWeight, getMaterialName, getPresentation, getWasteWeightCaptureValidationError, getUnitMeasure, isRollPresentation } from '../../utils/warehouseInventoryUtils.js';

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
    ['coneWeightKg', 'totalWeightKg', 'weightKg'].forEach(field => {
        if (form.elements?.[field]) form.elements[field].value = '';
    });
    toggleErrorMessages(form, { coneWeightKg: null, totalWeightKg: null });
    form.dataset.rollReference = JSON.stringify(template.rollReference ?? {});
    const reference = template.rollReference ?? {};
    if (form.elements.useConeReference) form.elements.useConeReference.checked = reference.coneWeightMode === 'FIXED' && reference.referenceConeWeightKg != null;
    if (form.elements.lengthSource) form.elements.lengthSource.value = 'MEASURED';
    const button = form.querySelector('#wasteDuplicateStockButton');
    button?.classList.add('d-none');
    delete form.dataset.duplicateWaste;
    updateWasteWeightField({ form, template });
    updateWasteRollMeasurement({ form });
    [
        [INPUT_SELECTORS.WASTE_WIDTH, template.suggestedWidth],
        [INPUT_SELECTORS.WASTE_MAX_UNIT_COST, template.maxUnitCost]
    ].forEach(([selector, value]) => setMdbWrapperInputValue({
        selector,
        value: value ?? ''
    }));
};

export const updateWasteNetWeightField = ({ form }) => {
    if (!isCreateMode(form.dataset.mode)) return;
    const data = {
        coneWeightKg: form.elements?.coneWeightKg?.value,
        totalWeightKg: form.elements?.totalWeightKg?.value
    };
    const valid = ['coneWeightKg', 'totalWeightKg'].every(fieldName =>
        !getWasteWeightCaptureValidationError(data[fieldName], { ...data, fieldName }));
    const value = valid ? calculateWasteNetWeight(data) : null;
    const field = form.elements?.weightKg;
    if (!field) return;
    field.value = value ?? '';
    if (field.id) setMdbWrapperInputValue({ selector: `#${field.id}`, value: field.value });
};

export const updateWasteWeightField = ({ form, template = {} }) => {
    const applies = isRollPresentation(getPresentation(template));
    const fields = ['coneWeightKg', 'totalWeightKg'];
    setFormDisabled({ form, fields, isDisabled: !applies || !isCreateMode(form.dataset.mode) });
    setFormDisabled({ form, fields: ['weightKg'], isDisabled: true });
    [...fields, 'weightKg'].forEach(name => {
        const field = form.elements?.[name];
        if (!field) return;
        if (!applies) field.value = '';
        if (field.id) setMdbWrapperInputValue({ selector: `#${field.id}`, value: field.value });
    });
    updateWasteNetWeightField({ form });
};

export const updateWasteRollMeasurement = ({ form }) => {
    const isCreating = isCreateMode(form.dataset.mode);
    const isRoll = form.querySelector('#wastePresentationDisplayValue')?.textContent?.trim().toUpperCase() === 'ROLLO';
    const reference = JSON.parse(form.dataset.rollReference || '{}');
    const coneToggle = form.elements.useConeReference;
    const lengthSource = form.elements.lengthSource;
    setFormDisabled({ form, fields: ['useConeReference', 'lengthSource'], isDisabled: !isCreating || !isRoll });
    setFormDisabled({ form, fields: ['useConeReference'], isDisabled: !isCreating || !isRoll || reference.referenceConeWeightKg == null });
    form.querySelector('#wasteRollReferenceButton')?.classList.toggle('d-none', !isCreating || !isRoll || !hasPermission(window.meta || {}, UI_PERMISSIONS.MATERIALS_WRITE));
    const referenceText = form.querySelector('#wasteConeReferenceInfo');
    if (referenceText) referenceText.textContent = reference.referenceConeWeightKg == null ? 'Sin peso de referencia del cono' : `Referencia del cono: ${reference.referenceConeWeightKg} kg (${reference.coneWeightMode === 'FIXED' ? 'fijo' : 'variable'})`;
    if (!isCreating) return;
    if (coneToggle?.checked && isRoll) {
        form.elements.coneWeightKg.value = reference.referenceConeWeightKg ?? '';
        setFormDisabled({ form, fields: ['coneWeightKg'], isDisabled: true });
    } else setFormDisabled({ form, fields: ['coneWeightKg'], isDisabled: !isRoll });
    updateWasteNetWeightField({ form });
    const estimated = isRoll && lengthSource?.value === 'ESTIMATED';
    setFormDisabled({ form, fields: ['height'], isDisabled: estimated });
    if (estimated) {
        const length = calculateWasteRollLength({ netWeightKg: form.elements.weightKg.value, referenceNetWeightKg: reference.referenceRollNetWeightKg, referenceLengthM: reference.referenceLengthM, referenceWidthM: reference.referenceWidthM, widthM: form.elements.base.value });
        form.elements.height.value = length ?? '';
        setMdbWrapperInputValue({ selector: '#heightInput', value: form.elements.height.value });
    }
};
