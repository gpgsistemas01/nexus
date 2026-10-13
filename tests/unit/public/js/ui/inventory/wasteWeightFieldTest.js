import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../../src/public/js/plugins/mdb/baseInstance.js', () => ({ setMdbWrapperInputValue: vi.fn() }));
const { applyWasteMaterialTemplate, updateWasteRollMeasurement, updateWasteWeightField } = await import('../../../../../../src/public/js/ui/inventory/inventorySelectUI.js');
const { FORM_MODES } = await import('../../../../../../src/public/js/constants/formModes.js');

const createForm = mode => {
    const elements = Object.fromEntries(Object.entries({ weightKg: '2.5', coneWeightKg: '0.5', totalWeightKg: '3', base: '1.5', height: '2' }).map(([name, value]) => [name, { value, disabled: true, closest: () => null, classList: { toggle: vi.fn() } }]));
    return { elements, dataset: { mode }, querySelector: selector => selector === '#wastePresentationDisplayValue' || selector === '#wasteUnitMeasureDisplayValue' ? { textContent: '' } : elements[selector?.match(/name='([^']+)'/)?.[1]] };

};

describe('captura de peso según la presentación real de la merma', () => {
    it('habilita kg para Rollo y limpia y deshabilita al cambiar a otra presentación', () => {
        const form = createForm(FORM_MODES.CREATE);
        updateWasteWeightField({ form, template: { presentation: { name: ' Rollo ' } } });
        expect(form.elements.coneWeightKg.disabled).toBe(false);
        expect(form.elements.totalWeightKg.disabled).toBe(false);
        expect(form.elements.weightKg.disabled).toBe(true);
        expect(form.elements.weightKg.value).toBe(2.5);
        updateWasteWeightField({ form, template: { presentation: { name: 'Lámina' } } });
        expect(form.elements.weightKg.disabled).toBe(true);
        expect(form.elements.weightKg.value).toBe('');
        expect(form.elements.coneWeightKg.value).toBe('');
        expect(form.elements.totalWeightKg.value).toBe('');
    });

    it.each([FORM_MODES.EDIT, FORM_MODES.EDIT_STOCK, FORM_MODES.VIEW])('conserva el peso de consulta y lo deshabilita en modo %s', mode => {
        const form = createForm(mode);
        updateWasteWeightField({ form, template: { presentation: { name: 'ROLLO' } } });
        expect(form.elements.weightKg.disabled).toBe(true);
        expect(form.elements.weightKg.value).toBe('2.5');
        expect(form.elements.coneWeightKg.disabled).toBe(true);
        expect(form.elements.totalWeightKg.disabled).toBe(true);
    });
    it('calcula sin residuos binarios y limpia el neto si la captura es inválida', () => {
        const form = createForm(FORM_MODES.CREATE);
        form.elements.totalWeightKg.value = '0.3';
        form.elements.coneWeightKg.value = '0.1';
        updateWasteRollMeasurement({ form });
        expect(form.elements.weightKg.value).toBe(0.2);
        form.elements.coneWeightKg.value = '0.4';
        updateWasteRollMeasurement({ form });
        expect(form.elements.weightKg.value).toBe('');
    });

    it('precarga el cono y permite editarlo; cambiar material borra las mediciones anteriores', () => {
        const form = createForm(FORM_MODES.CREATE);
        const template = { presentation: { name: 'ROLLO' }, rollReference: { referenceConeWeightKg: 0.25, referenceRollTotalWeightKg: 2.25, referenceRollNetWeightKg: 2, referenceLengthM: 20, referenceWidthM: 1.5, lengthField: 'height' } };
        applyWasteMaterialTemplate({ form, template });
        expect(form.elements.coneWeightKg.value).toBe(0.25);
        expect(form.elements.coneWeightKg.disabled).toBe(false);
        expect(form.elements.totalWeightKg.value).toBe('');
        form.elements.coneWeightKg.value = '0.4';
        form.elements.totalWeightKg.value = '1.4';
        updateWasteRollMeasurement({ form });
        expect(form.elements.coneWeightKg.value).toBe('0.4');
        expect(form.elements.weightKg.value).toBe(1);
        expect(form.elements.height.value).toBe(10);
        expect(form.elements.base.value).toBe(1.5);
        expect(form.elements.base.disabled).toBe(true);
        applyWasteMaterialTemplate({ form, template: { ...template, rollReference: { referenceConeWeightKg: 0.3 } } });
        expect(form.elements.coneWeightKg.value).toBe(0.3);
        expect(form.elements.totalWeightKg.value).toBe('');
        expect(form.elements.weightKg.value).toBe('');
    });
});
