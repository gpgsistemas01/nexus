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
        type: 'MATERIAL',
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

    it.each([
        ['MATERIAL', 'CONSUMABLE'],
        ['CONSUMABLE', 'MATERIAL']
    ])('rechaza detalles de %s cuando el inventario pertenece al otro tipo', async (contextType, type) => {
        findSupplierMaterialsSnapshot.mockResolvedValue([{
            ...supplierMaterial, material: { ...supplierMaterial.material, type }
        }]);
        await expect(buildGoodsIssueDetails({ details: [detail], type: contextType }))
            .rejects.toMatchObject({ code: 'MATERIAL_NOT_FOUND' });
    });

    it('acepta consumibles en su propio contexto', async () => {
        findSupplierMaterialsSnapshot.mockResolvedValue([{
            ...supplierMaterial, material: { ...supplierMaterial.material, type: 'CONSUMABLE' }
        }]);
        await expect(buildGoodsIssueDetails({ details: [detail], type: 'CONSUMABLE' }))
            .resolves.toHaveLength(1);
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
