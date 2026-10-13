import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../../src/public/js/plugins/mdb/baseInstance.js', () => ({ setMdbWrapperInputValue: vi.fn() }));
const { updateWasteWeightField } = await import('../../../../../../src/public/js/ui/inventory/inventorySelectUI.js');
const { FORM_MODES } = await import('../../../../../../src/public/js/constants/formModes.js');

const createForm = mode => {
    const weightKg = { value: '2.5', disabled: true, classList: { toggle: vi.fn() } };
    return { elements: { weightKg }, dataset: { mode }, querySelector: () => weightKg };
};

describe('captura de peso según la presentación real de la merma', () => {
    it('habilita kg para Rollo y limpia y deshabilita al cambiar a otra presentación', () => {
        const form = createForm(FORM_MODES.CREATE);
        updateWasteWeightField({ form, template: { presentation: { name: ' Rollo ' } } });
        expect(form.elements.weightKg.disabled).toBe(false);
        updateWasteWeightField({ form, template: { presentation: { name: 'Lámina' } } });
        expect(form.elements.weightKg.disabled).toBe(true);
        expect(form.elements.weightKg.value).toBe('');
    });

    it.each([FORM_MODES.EDIT, FORM_MODES.EDIT_STOCK, FORM_MODES.VIEW])('conserva el peso de consulta y lo deshabilita en modo %s', mode => {
        const form = createForm(mode);
        updateWasteWeightField({ form, template: { presentation: { name: 'ROLLO' } } });
        expect(form.elements.weightKg.disabled).toBe(true);
        expect(form.elements.weightKg.value).toBe('2.5');
    });
});
