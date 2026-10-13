import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../../src/public/js/plugins/mdb/baseInstance.js', () => ({ setMdbWrapperInputValue: vi.fn() }));
const { updateWasteWeightField, updateWasteNetWeightField } = await import('../../../../../../src/public/js/ui/inventory/inventorySelectUI.js');
const { FORM_MODES } = await import('../../../../../../src/public/js/constants/formModes.js');

const createForm = mode => {
    const elements = Object.fromEntries(Object.entries({ weightKg: '2.5', coneWeightKg: '0.5', totalWeightKg: '3' }).map(([name, value]) => [name, { value, disabled: true, classList: { toggle: vi.fn() } }]));
    return { elements, dataset: { mode }, querySelector: selector => elements[selector.match(/name='([^']+)'/)[1]] };

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
        updateWasteNetWeightField({ form });
        expect(form.elements.weightKg.value).toBe(0.2);
        form.elements.coneWeightKg.value = '0.4';
        updateWasteNetWeightField({ form });
        expect(form.elements.weightKg.value).toBe('');
    });

});
