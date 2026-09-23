import { beforeEach, describe, expect, it, vi } from 'vitest';

const findSupplierMaterialsSnapshot = vi.fn();

vi.mock('../../../../../src/services/warehouse/materials/supplierMaterialService.js', () => ({
    findSupplierMaterialsSnapshot
}));

const { buildGoodsIssueDetails } = await import('../../../../../src/services/warehouse/goodsIssues/goodsIssueHelpers.js');

const detail = {
    materialId: 'material-1',
    supplierId: 'supplier-1',
    quantity: 2
};

const supplierMaterial = {
    id: 'supplier-material-1',
    isActive: true,
    maxUnitCost: 10,
    material: {
        id: 'material-1',
        name: 'Material',
        base: null,
        height: null,
        presentation: { id: 'presentation-1' }
    },
    supplier: {
        id: 'supplier-1',
        tradeName: 'Proveedor',
        isActive: true
    }
};

describe('buildGoodsIssueDetails', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        findSupplierMaterialsSnapshot.mockResolvedValue([supplierMaterial]);
    });

    it.each([
        ['material', { isActive: false }, 'MATERIAL_INACTIVE_CONFLICT'],
        ['proveedor', { supplier: { ...supplierMaterial.supplier, isActive: false } }, 'SUPPLIER_INACTIVE_CONFLICT']
    ])('rechaza un %s inactivo en detalles nuevos', async (_resource, override, code) => {
        findSupplierMaterialsSnapshot.mockResolvedValue([{
            ...supplierMaterial,
            ...override
        }]);

        await expect(buildGoodsIssueDetails({ details: [detail] }))
            .rejects.toMatchObject({ code });
    });

    it('construye el detalle cuando material y proveedor están activos', async () => {
        await expect(buildGoodsIssueDetails({ details: [detail] })).resolves.toEqual([
            expect.objectContaining({
                materialId: 'material-1',
                supplierId: 'supplier-1',
                quantity: 2,
                materialName: 'Material',
                maxUnitCost: 10
            })
        ]);
    });
});
