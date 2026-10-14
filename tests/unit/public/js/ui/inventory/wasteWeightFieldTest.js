import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../../src/public/js/plugins/mdb/baseInstance.js', () => ({ setMdbWrapperInputValue: vi.fn() }));
const { applyWasteMaterialTemplate, configureWasteWeightFields, updateWasteRollMeasurement, displayWasteMaterialTemplate } = await import('../../../../../../src/public/js/ui/inventory/wasteFormUI.js');
const { FORM_MODES } = await import('../../../../../../src/public/js/constants/formModes.js');
const { setMdbWrapperInputValue } = await import('../../../../../../src/public/js/plugins/mdb/baseInstance.js');

const createForm = (mode = FORM_MODES.CREATE) => {
    const elements = Object.fromEntries(Object.entries({ weightKg: '2.5', coneWeightKg: '0.5', totalWeightKg: '3', base: '1.5', height: '2' })
        .map(([name, value]) => [name, { value, disabled: false, readOnly: false, classList: { toggle: vi.fn() } }]));
    const presentation = { textContent: '' };
    const unit = { textContent: '' };
    return {
        elements,
        dataset: { mode },
        querySelector: selector => selector === '#wastePresentationDisplayValue' ? presentation
            : selector === '#wasteUnitMeasureDisplayValue' ? unit
            : elements[selector?.match(/name='([^']+)'/)?.[1]]
    };
};

const roll = (overrides = {}) => ({
    name: 'Lona',
    presentation: { name: 'ROLLO' },
    unitMeasure: { symbol: 'm²' },
    base: 1.5,
    height: 20,
    supplierMaterials: [{ referenceConeWeightKg: 0.25, referenceRollTotalWeightKg: 2.25 }],
    ...overrides
});

describe('mediciones del registro de merma', () => {
    it('mostrar una merma conserva las mediciones sin recalcularlas', () => {
        const form = createForm();
        displayWasteMaterialTemplate({ form, template: roll() });
        expect(setMdbWrapperInputValue).toHaveBeenCalledWith({ selector: '#wastePresentationDisplayValue', value: 'ROLLO' });
        expect(form.elements.weightKg.value).toBe('2.5');
        expect(form.elements.height.value).toBe('2');
    });

    it.each([FORM_MODES.EDIT, FORM_MODES.EDIT_STOCK, FORM_MODES.VIEW])('conserva los pesos guardados en modo %s', mode => {
        const form = createForm(mode);
        configureWasteWeightFields({ form, template: roll() });
        updateWasteRollMeasurement({ form });
        expect(form.elements.coneWeightKg.disabled).toBe(true);
        expect(form.elements.totalWeightKg.disabled).toBe(true);
        expect(form.elements.weightKg.value).toBe('2.5');
        expect(form.elements.height.value).toBe('2');
    });

    it.each([[1.5, 20, 'base', 'height'], [20, 1.5, 'height', 'base']])('conserva la menor dimensión para %s × %s y calcula el otro campo', (base, height, fixedField, calculatedField) => {
        const form = createForm();
        const template = roll({ base, height });
        applyWasteMaterialTemplate({ form, template });
        expect(form.wasteMaterialTemplate).toBe(template);
        expect(form.elements.coneWeightKg.value).toBe(0.25);
        expect(form.elements[fixedField].value).toBe(1.5);
        expect(form.elements[fixedField].disabled).toBe(true);
        expect(form.elements[calculatedField].disabled).toBe(true);

        form.elements.totalWeightKg.value = '1.25';
        updateWasteRollMeasurement({ form });
        expect(form.elements.weightKg.value).toBe(1);
        expect(form.elements[calculatedField].value).toBe(10);
        expect(form.elements[calculatedField].disabled).toBe(true);
    });

    it('actualiza los resultados al corregir pesos y los limpia si la captura queda incompleta o inválida', () => {
        const form = createForm();
        applyWasteMaterialTemplate({ form, template: roll() });
        form.elements.totalWeightKg.value = '1.25';
        updateWasteRollMeasurement({ form });
        form.elements.coneWeightKg.value = '0.5';
        updateWasteRollMeasurement({ form });
        expect(form.elements.weightKg.value).toBe(0.75);
        expect(form.elements.height.value).toBe(7.5);

        form.elements.totalWeightKg.value = '';
        updateWasteRollMeasurement({ form });
        expect(form.elements.weightKg.value).toBe('');
        expect(form.elements.height.value).toBe('');
        expect(form.elements.height.disabled).toBe(true);

        form.elements.totalWeightKg.value = '0.4';
        updateWasteRollMeasurement({ form });
        expect(form.elements.weightKg.value).toBe('');
    });

    it('limpia las mediciones anteriores al cambiar o quitar el material', () => {
        const form = createForm();
        applyWasteMaterialTemplate({ form, template: roll() });
        form.elements.totalWeightKg.value = '1.25';
        updateWasteRollMeasurement({ form });
        applyWasteMaterialTemplate({ form, template: roll({ supplierMaterials: [{ referenceConeWeightKg: 0.3 }] }) });
        expect(form.elements.coneWeightKg.value).toBe(0.3);
        expect(form.elements.totalWeightKg.value).toBe('');
        expect(form.elements.weightKg.value).toBe('');
        expect(form.elements.height.value).toBe('');

        applyWasteMaterialTemplate({ form });
        expect(form.wasteRollReference).toBeNull();
        expect(form.elements.coneWeightKg.disabled).toBe(true);
        expect(form.elements.base.value).toBe('');
        expect(form.elements.base.disabled).toBe(false);
    });

    it('mantiene ambas medidas bloqueadas y el largo vacío si faltan referencias', () => {
        const form = createForm();
        applyWasteMaterialTemplate({ form, template: roll({ supplierMaterials: [{ referenceConeWeightKg: 0.25 }] }) });
        form.elements.totalWeightKg.value = '1.25';
        updateWasteRollMeasurement({ form });
        expect(form.elements.height.value).toBe('');
        expect(form.elements.height.disabled).toBe(true);
        expect(form.elements.base.disabled).toBe(true);
        expect(form.elements.base.value).toBe(1.5);
        expect(form.elements.weightKg.value).toBe(1);
    });

    it('prepara las referencias al seleccionar y no modifica la respuesta recibida', () => {
        const form = createForm();
        const offer = Object.freeze({ referenceConeWeightKg: 0.25, referenceRollTotalWeightKg: 2.25 });
        const template = Object.freeze(roll({ supplierMaterials: Object.freeze([offer]) }));
        applyWasteMaterialTemplate({ form, template });
        const reference = form.wasteRollReference;
        form.elements.totalWeightKg.value = '1.25';
        updateWasteRollMeasurement({ form });
        updateWasteRollMeasurement({ form });
        expect(form.wasteRollReference).toBe(reference);
        expect(template.supplierMaterials[0]).toBe(offer);
        expect(template).not.toHaveProperty('referenceConeWeightKg');
    });

    it('otras presentaciones conservan la captura manual y no calculan pesos', () => {
        const form = createForm();
        applyWasteMaterialTemplate({ form, template: { presentation: { name: 'LÁMINA' } } });
        form.elements.base.value = '1';
        form.elements.height.value = '2';
        updateWasteRollMeasurement({ form });
        expect(form.elements.base.value).toBe('1');
        expect(form.elements.height.value).toBe('2');
        expect(form.elements.weightKg.value).toBe('');
        expect(form.elements.coneWeightKg.disabled).toBe(true);
    });
});
