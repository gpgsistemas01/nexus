import { toggleErrorMessages } from '../forms/formErrorsUI.js';
import { calculateWasteRollLength } from '../../utils/wasteRollUtils.js';
import { EMPTY_DISPLAY_VALUE } from '../../constants/display.js';
import { setFormSectionVisibility, setFormDisabled } from '../forms/formStateUI.js';
import { isCreateMode, isEditMode } from '../../constants/formModes.js';
import { MATERIAL_ROLL_REFERENCE_FIELDS, INVENTORY_RESOURCES } from '../../constants/inventory.js';
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
    if (isRollPresentation(getPresentation(template)) && form.elements.coneWeightKg) {
        form.elements.coneWeightKg.value = reference.referenceConeWeightKg ?? '';
    }
    setMdbWrapperInputValue({ selector: INPUT_SELECTORS.WASTE_MAX_UNIT_COST, value: template.maxUnitCost ?? '' });
    ['base', 'height'].forEach(field => { form.elements[field].value = ''; });
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
    const reference = JSON.parse(form.dataset.rollReference || '{}');
    const info = form.querySelector('#wasteConeReferenceInfo');
    if (info) info.textContent = applies && isCreateMode(form.dataset.mode)
        ? `Cono predeterminado: ${reference.referenceConeWeightKg ?? 'sin registrar'} kg; rollo completo: ${reference.referenceRollTotalWeightKg ?? 'sin registrar'} kg; longitud: ${reference.referenceLengthM ?? 'sin registrar'} m.`
        : '';
    updateWasteRollMeasurement({ form });
};

export const updateWasteRollMeasurement = ({ form }) => {
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
    const reference = JSON.parse(form.dataset.rollReference || '{}');
    const lengthField = reference.lengthField;
    const hasWeights = form.elements.weightKg.value !== '';
    if (!lengthField) {
        setFormDisabled({ form, fields: ['base', 'height'], isDisabled: false });
        return;
    }

    const widthField = lengthField === 'base' ? 'height' : 'base';
    form.elements[widthField].value = reference.referenceWidthM ?? '';
    setFormDisabled({ form, fields: [widthField], isDisabled: true });
    const length = hasWeights ? calculateWasteRollLength({
        netWeightKg: form.elements.weightKg.value,
        referenceNetWeightKg: reference.referenceRollNetWeightKg,
        referenceLengthM: reference.referenceLengthM
    }) : null;
    setFormDisabled({ form, fields: [lengthField], isDisabled: length != null });
    if (length != null) form.elements[lengthField].value = length;
    ['base', 'height'].forEach(field => {
        if (form.elements[field].id) setMdbWrapperInputValue({ selector: `#${form.elements[field].id}`, value: form.elements[field].value });
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
