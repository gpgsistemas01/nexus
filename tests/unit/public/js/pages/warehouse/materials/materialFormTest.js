import { describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ config: null }));
vi.mock('../../../../../../../src/public/js/ui/forms/formUI.js', () => ({ useForm: config => { state.config = config; } }));
vi.mock('../../../../../../../src/public/js/application/warehouse/materials/materials.js', () => ({ editMaterial: vi.fn(), editMaterialStock: vi.fn(), registerMaterial: vi.fn() }));
vi.mock('../../../../../../../src/public/js/application/warehouse/consumables/consumables.js', () => ({ editConsumable: vi.fn(), editConsumableStock: vi.fn(), registerConsumable: vi.fn() }));
vi.mock('../../../../../../../src/public/js/utils/formUtils.js', () => ({
    handleSubmit: vi.fn(), validateFields: vi.fn(),
    pickFormFields: (data, fields) => Object.fromEntries(fields.filter(field => field in data).map(field => [field, data[field]]))
}));
vi.stubGlobal('document', { querySelector: () => ({ checked: true }) });
await import('../../../../../../../src/public/js/pages/warehouse/materials/materialForm.js');

describe('envío de referencias de material bloqueadas', () => {
    it('incluye el cono guardado cuando se completa el total, aunque el cono no esté en FormData', () => {
        const form = {
            dataset: { mode: 'edit' }, elements: { supplierId: { value: 'supplier-1' } },
            materialRollReference: { referenceConeWeightKg: 0, referenceRollTotalWeightKg: null }
        };
        const data = state.config.normalizeData({ form, formData: { name: 'Lona', referenceRollTotalWeightKg: '2.25', maxUnitCost: '10' } });
        expect(data).toMatchObject({ referenceConeWeightKg: 0, referenceRollTotalWeightKg: '2.25', supplierId: 'supplier-1' });
    });

    it('conserva la pareja registrada al editar otros datos', () => {
        const form = {
            dataset: { mode: 'edit' }, elements: { supplierId: { value: 'supplier-1' } },
            materialRollReference: { referenceConeWeightKg: '0.25', referenceRollTotalWeightKg: '2.25' }
        };
        const data = state.config.normalizeData({ form, formData: { name: 'Lona', maxUnitCost: '12' } });
        expect(data).toMatchObject({ referenceConeWeightKg: '0.25', referenceRollTotalWeightKg: '2.25', maxUnitCost: '12' });
    });
});
