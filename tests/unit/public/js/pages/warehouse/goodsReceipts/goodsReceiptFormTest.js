import { describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ config: null, details: [] }));
vi.mock('../../../../../../../src/public/js/ui/forms/formUI.js', () => ({
    useForm: config => { state.config = config; }, handleSubmit: vi.fn()
}));
vi.mock('../../../../../../../src/public/js/pages/warehouse/goodsReceipts/goodsReceiptContext.js', () => ({ goodsReceiptContext: {}, details: state.details }));
vi.mock('../../../../../../../src/public/js/plugins/datatable/shared/inventory/renderMaterialDatatable.js', () => ({ refreshMaterialTable: vi.fn() }));
vi.mock('../../../../../../../src/public/js/plugins/select2/modules/goodsReceiptSelect.js', () => ({ GOODS_RECEIPT_SUPPLIER_CHANGED_EVENT: 'supplier-changed' }));
vi.mock('../../../../../../../src/public/js/ui/forms/detailFormUI.js', () => ({ clearAddedMaterialInput: vi.fn() }));
vi.mock('../../../../../../../src/public/js/ui/forms/formErrorsUI.js', () => ({ normalizeFormErrors: vi.fn() }));
vi.mock('../../../../../../../src/public/js/ui/forms/totalsSummaryUI.js', () => ({ updateTotals: vi.fn() }));
vi.mock('../../../../../../../src/public/js/utils/domUtils.js', () => ({ on: vi.fn() }));
vi.stubGlobal('document', { querySelector: () => ({ checked: false, addEventListener: vi.fn() }) });
await import('../../../../../../../src/public/js/pages/warehouse/goodsReceipts/goodsReceiptForm.js');
const form = { dataset: { mode: 'edit' }, elements: { supplierId: { value: 'supplier-1' } } };

describe('payload de compra con y sin partidas nuevas', () => {
    it('omite details al editar sólo el encabezado y conserva las partidas persistidas', () => {
        state.details.splice(0, state.details.length, { id: 'detail-1', materialId: 'material-1', quantity: 2 });
        const payload = state.config.normalizeData({ form, formData: { observations: 'Encabezado' } });
        expect(payload).not.toHaveProperty('details');
        expect(payload).toMatchObject({ observations: 'Encabezado', supplierId: 'supplier-1' });
        expect(state.details).toHaveLength(1);
    });

    it('al editar envía únicamente las partidas que se agregaron en la captura', () => {
        const addition = { materialId: 'material-2', quantity: 3, costPerUnitType: 4 };
        state.details.splice(0, state.details.length, { id: 'detail-1' }, addition);
        expect(state.config.normalizeData({ form, formData: {} }).details).toEqual([addition]);
    });

    it('el alta conserva details para exigir al menos una partida', () => {
        state.details.length = 0;
        expect(state.config.normalizeData({ form: { dataset: { mode: 'create' } }, formData: {} }).details).toEqual([]);
    });
});
