import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../../src/public/js/plugins/mdb/baseInstance.js', () => ({ setMdbWrapperInputValue: vi.fn() }));
const { updateWasteWeightField } = await import('../../../../../../src/public/js/ui/inventory/inventorySelectUI.js');
const { FORM_MODES } = await import('../../../../../../src/public/js/constants/formModes.js');

describe('captura de peso según la presentación real de la merma', () => {
    it('habilita kg para Rollo y limpia y deshabilita al cambiar a otra presentación', () => {
        const form = { elements: { weightKg: { value: '2.5', disabled: true, readOnly: true } }, dataset: { mode: FORM_MODES.CREATE } };
        updateWasteWeightField({ form, template: { presentation: { name: ' Rollo ' } } });
        expect(form.elements.weightKg.disabled).toBe(false);
        updateWasteWeightField({ form, template: { presentation: { name: 'Lámina' } } });
        expect(form.elements.weightKg).toEqual({ value: '', disabled: true, readOnly: false });
    });

    it('conserva peso al editar la merma y lo deshabilita durante un ajuste de stock', () => {
        const form = { elements: { weightKg: { value: '2.5', disabled: false } }, dataset: { mode: FORM_MODES.EDIT_STOCK } };
        updateWasteWeightField({ form, template: { presentation: { name: 'ROLLO' } } });
        expect(form.elements.weightKg).toEqual({ value: '2.5', disabled: true, readOnly: true });
        form.dataset.mode = FORM_MODES.EDIT;
        updateWasteWeightField({ form, template: { presentation: { name: 'ROLLO' } } });
        expect(form.elements.weightKg.disabled).toBe(false);
        expect(form.elements.weightKg.readOnly).toBe(true);
        expect(form.elements.weightKg.value).toBe('2.5');
    });
});
