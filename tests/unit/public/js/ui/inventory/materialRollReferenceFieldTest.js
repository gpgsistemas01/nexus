import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../../src/public/js/plugins/mdb/baseInstance.js', () => ({ setMdbWrapperInputValue: vi.fn() }));
const { updateMaterialRollReferenceFields } = await import('../../../../../../src/public/js/ui/inventory/inventorySelectUI.js');

const createForm = ({ mode = 'edit', reference = {}, resource = 'material', presentation = 'ROLLO' } = {}) => {
    const elements = Object.fromEntries(['referenceConeWeightKg', 'referenceRollTotalWeightKg'].map(field => [field, {
        value: reference[field] ?? '', classList: { toggle: vi.fn() }, closest: () => null
    }]));
    elements.presentationId = { selectedOptions: [{ textContent: presentation }] };
    const section = { classList: { toggle: vi.fn() } };
    return {
        dataset: { mode, resource }, elements, section, materialRollReference: reference,
        querySelector: selector => selector === '.roll-reference-section' ? section : elements[selector.match(/name='([^']+)'/)?.[1]]
    };
};

describe('captura inicial de pesos del rollo completo', () => {
    it('permite capturar ambos pesos durante el alta', () => {
        const form = createForm({ mode: 'create' });
        updateMaterialRollReferenceFields({ form });
        expect(form.elements.referenceConeWeightKg.disabled).toBe(false);
        expect(form.elements.referenceRollTotalWeightKg.disabled).toBe(false);
        expect(form.elements.referenceConeWeightKg.required).toBe(false);
        expect(form.elements.referenceRollTotalWeightKg.required).toBe(false);
        expect(form.section.classList.toggle).toHaveBeenCalledWith('d-none', false);
    });

    it('bloquea ambos pesos registrados, incluido el cono cero', () => {
        const form = createForm({ reference: { referenceConeWeightKg: 0, referenceRollTotalWeightKg: 2 } });
        updateMaterialRollReferenceFields({ form });
        expect(form.elements.referenceConeWeightKg.disabled).toBe(true);
        expect(form.elements.referenceRollTotalWeightKg.disabled).toBe(true);
        expect(form.elements.referenceConeWeightKg.value).toBe(0);
        expect(form.section.classList.toggle).toHaveBeenCalledWith('d-none', false);
    });

    it('permite completar sólo el peso que falta sin desbloquear el cono registrado', () => {
        const form = createForm({ reference: { referenceConeWeightKg: 0.25 } });
        updateMaterialRollReferenceFields({ form });
        expect(form.elements.referenceConeWeightKg.disabled).toBe(true);
        expect(form.elements.referenceRollTotalWeightKg.disabled).toBe(false);
    });

    it.each([{ mode: 'edit-stock' }, { mode: 'view' }, { presentation: 'LÁMINA' }, { resource: 'consumable' }])('deshabilita los pesos fuera de la captura de un rollo: %j', options => {
        const form = createForm(options);
        updateMaterialRollReferenceFields({ form });
        expect(form.elements.referenceConeWeightKg.disabled).toBe(true);
        expect(form.elements.referenceRollTotalWeightKg.disabled).toBe(true);
        expect(form.section.classList.toggle).toHaveBeenCalledWith('d-none', true);
    });

    it('en consulta muestra los pesos registrados como datos deshabilitados', () => {
        const form = createForm({ mode: 'view', reference: { referenceConeWeightKg: 0, referenceRollTotalWeightKg: 2 } });
        updateMaterialRollReferenceFields({ form });
        expect(form.section.classList.toggle).toHaveBeenCalledWith('d-none', false);
        expect(form.elements.referenceConeWeightKg.disabled).toBe(true);
        expect(form.elements.referenceRollTotalWeightKg.disabled).toBe(true);
        expect(form.elements.referenceConeWeightKg.value).toBe(0);
    });

    it('oculta los pesos durante un ajuste sin borrar las referencias registradas', () => {
        const form = createForm({ mode: 'edit-stock', reference: { referenceConeWeightKg: 0.25, referenceRollTotalWeightKg: 2 } });
        updateMaterialRollReferenceFields({ form });
        expect(form.section.classList.toggle).toHaveBeenCalledWith('d-none', true);
        expect(form.elements.referenceConeWeightKg.value).toBe(0.25);
        expect(form.elements.referenceRollTotalWeightKg.value).toBe(2);
    });
});
