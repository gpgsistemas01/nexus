import { toggleErrorMessages } from '../forms/formErrorsUI.js';
import { EMPTY_DISPLAY_VALUE } from '../../constants/display.js';
import { setFormSectionVisibility, setFormDisabled } from '../forms/formStateUI.js';
import { isCreateMode } from '../../constants/formModes.js';
import { INPUT_SELECTORS } from '../../constants/selectors.js';
import { setMdbWrapperInputValue } from '../../plugins/mdb/baseInstance.js';
import { calculateWasteNetWeight, calculateWasteRollLength, getMaterialName, getPresentation, getWasteWeightCaptureValidationError, getUnitMeasure, isRollPresentation } from '../../utils/warehouseInventoryUtils.js';

export const getWasteMaterialTemplate = ({ form }) => {
    const option = form.elements.materialId.selectedOptions[0];
    if (!option?.value) return {};

    const { presentation, unitMeasure, rollReference, ...data } = option.dataset;
    return {
        ...data,
        presentation: JSON.parse(presentation || '{}'),
        unitMeasure: JSON.parse(unitMeasure || '{}'),
        rollReference: JSON.parse(rollReference || 'null')
    };
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
    if (!isCreateMode(form.dataset.mode)) return;
    displayWasteMaterialTemplate({ form, template });
    ['coneWeightKg', 'totalWeightKg', 'weightKg'].forEach(field => {
        if (form.elements?.[field]) form.elements[field].value = '';
    });
    toggleErrorMessages(form, { coneWeightKg: null, totalWeightKg: null });
    const reference = template.rollReference ?? {};
    if (isRollPresentation(getPresentation(template)) && form.elements.coneWeightKg) {
        form.elements.coneWeightKg.value = reference.referenceConeWeightKg ?? '';
    }
    setMdbWrapperInputValue({ selector: INPUT_SELECTORS.WASTE_MAX_UNIT_COST, value: template.maxUnitCost ?? '' });
    ['base', 'height'].forEach(field => { form.elements[field].value = ''; });
    setFormDisabled({ form, fields: ['base', 'height'], isDisabled: false });
    updateWasteWeightField({ form, template });
};

export const updateWasteWeightField = ({ form, template = {} }) => {
    const applies = isRollPresentation(getPresentation(template));
    const fields = ['coneWeightKg', 'totalWeightKg'];
    setFormSectionVisibility({ form, selector: '.waste-weight-fields', isVisible: applies });
    setFormDisabled({ form, fields, isDisabled: !applies || !isCreateMode(form.dataset.mode) });
    setFormDisabled({ form, fields: ['weightKg'], isDisabled: true });
    [...fields, 'weightKg'].forEach(name => {
        const field = form.elements?.[name];
        if (!field) return;
        if (!applies) field.value = '';
        if (field.id) setMdbWrapperInputValue({ selector: `#${field.id}`, value: field.value });
    });
    const reference = template.rollReference ?? {};
    setFormSectionVisibility({ form, selector: '.waste-roll-reference', isVisible: applies && isCreateMode(form.dataset.mode) });
    const info = form.querySelector('#wasteConeReferenceInfo');
    if (info) info.textContent = applies && isCreateMode(form.dataset.mode)
        ? `Cono predeterminado: ${reference.referenceConeWeightKg ?? 'sin registrar'} kg; rollo completo: ${reference.referenceRollTotalWeightKg ?? 'sin registrar'} kg; longitud: ${reference.referenceLengthM ?? 'sin registrar'} m.`
        : '';
    if (applies) updateWasteRollMeasurement({ form, template });
};

export const updateWasteRollMeasurement = ({ form, template }) => {
    if (!isCreateMode(form.dataset.mode)) return;
    template ??= getWasteMaterialTemplate({ form });
    if (!isRollPresentation(getPresentation(template))) return;

    const data = {
        coneWeightKg: form.elements?.coneWeightKg?.value,
        totalWeightKg: form.elements?.totalWeightKg?.value
    };
    const valid = ['coneWeightKg', 'totalWeightKg'].every(fieldName =>
        !getWasteWeightCaptureValidationError(data[fieldName], { ...data, fieldName }));
    const weightKg = valid ? calculateWasteNetWeight(data) : null;
    const field = form.elements?.weightKg;
    if (!field) return;
    field.value = weightKg ?? '';
    if (field.id) setMdbWrapperInputValue({ selector: `#${field.id}`, value: field.value });
    const reference = template.rollReference ?? {};
    const lengthField = reference.lengthField;
    if (!lengthField) {
        setFormDisabled({ form, fields: ['base', 'height'], isDisabled: false });
        return;
    }

    const widthField = lengthField === 'base' ? 'height' : 'base';
    form.elements[widthField].value = reference.referenceWidthM ?? '';
    setFormDisabled({ form, fields: [widthField], isDisabled: true });
    const length = weightKg != null ? calculateWasteRollLength({
        weightKg,
        referenceRollNetWeightKg: reference.referenceRollNetWeightKg,
        referenceLengthM: reference.referenceLengthM
    }) : null;
    const wasCalculated = form.elements[lengthField].disabled;
    setFormDisabled({ form, fields: [lengthField], isDisabled: length != null });
    if (length != null || wasCalculated) form.elements[lengthField].value = length ?? '';
    ['base', 'height'].forEach(field => {
        if (form.elements[field].id) setMdbWrapperInputValue({ selector: `#${form.elements[field].id}`, value: form.elements[field].value });
    });
};

