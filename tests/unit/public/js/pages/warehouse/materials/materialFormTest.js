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

describe('materiales sin captura de referencias de rollo', () => {
    it.each(['create', 'edit'])('omite referencias históricas del payload en %s', mode => {
        const form = { dataset: { mode }, elements: { supplierId: { value: 'supplier-1' } } };
        const data = state.config.normalizeData({ form, formData: {
            name: 'Lona', maxUnitCost: '12', referenceConeWeightKg: '0.25', referenceRollTotalWeightKg: '2.25'
        } });
        expect(data).not.toHaveProperty('referenceConeWeightKg');
        expect(data).not.toHaveProperty('referenceRollTotalWeightKg');
        expect(data).toMatchObject({ name: 'Lona', maxUnitCost: '12' });
    });
});
