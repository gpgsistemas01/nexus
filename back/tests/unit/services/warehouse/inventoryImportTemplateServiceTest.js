import { beforeEach, describe, expect, it, vi } from 'vitest';
import { INVENTORY_IMPORT_LIMITS } from '../../../../src/shared/constants/inventoryImport.js';
import { PERMISSIONS } from '../../../../src/shared/constants/permissions.js';

const mocks = vi.hoisted(() => ({
    getDb: vi.fn(),
    processInventoryWorkbook: vi.fn(),
}));

vi.mock('../../../../src/repository/baseRepository.js', () => ({ getDb: mocks.getDb }));
vi.mock('../../../../src/services/warehouse/imports/inventoryWorkbookService.js', () => ({
    processInventoryWorkbook: mocks.processInventoryWorkbook,
}));

const { createInventoryImportTemplate } = await import(
    '../../../../src/services/warehouse/imports/inventoryImportTemplateService.js'
);

const offer = (resource, index) => {
    const name = `Material ${index}`;
    const presentation = { name: 'Pieza' };
    const unitMeasure = { symbol: 'pza', name: 'Unidad' };
    const common = {
        currentStock: 2,
        convertedQuantity: 2,
        maxUnitCost: 10,
        isActive: true,
        supplier: { tradeName: 'Proveedor' },
    };

    return resource === 'wastes'
        ? {
              id: `waste-${index}`,
              version: 1,
              name,
              ...common,
              minStock: 1,
              presentation,
              unitMeasure,
          }
        : {
              materialId: `material-${index}`,
              supplierId: 'supplier',
              version: 1,
              ...common,
              material: {
                  name,
                  version: 1,
                  base: null,
                  height: null,
                  minStock: 1,
                  presentation,
                  unitMeasure,
              },
          };
};

describe('plantilla completa de importación de inventario', () => {
    let findMany;

    beforeEach(() => {
        vi.clearAllMocks();
        findMany = vi.fn();
        mocks.getDb.mockReturnValue({ supplierMaterial: { findMany } });
        mocks.processInventoryWorkbook.mockResolvedValue(new Uint8Array());
    });

    it.each(['materials', 'consumables', 'wastes'])(
        'incluye todos los registros coincidentes de %s hasta el límite y no solicita página',
        async resource => {
            findMany.mockResolvedValue(
                Array.from({ length: INVENTORY_IMPORT_LIMITS.maxRows }, (_, i) =>
                    offer(resource, i),
                ),
            );
            mocks.getDb.mockReturnValue({
                [resource === 'wastes' ? 'waste' : 'supplierMaterial']: { findMany },
            });

            await createInventoryImportTemplate({
                user: { permissions: Object.values(PERMISSIONS) },
                resource,
                mode: 'update',
                query: { search: 'Material' },
            });

            expect(findMany).toHaveBeenCalledWith(
                expect.objectContaining({ take: INVENTORY_IMPORT_LIMITS.maxRows + 1 }),
            );
            expect(findMany.mock.calls[0][0]).not.toHaveProperty('skip');
            const workbook = mocks.processInventoryWorkbook.mock.calls[0][0];
            expect(workbook.rows).toHaveLength(INVENTORY_IMPORT_LIMITS.maxRows);
            expect(workbook.rows[0].name).toBe('Material 0');
            expect(workbook.rows.at(-1).name).toBe(
                `Material ${INVENTORY_IMPORT_LIMITS.maxRows - 1}`,
            );
        },
    );

    it.each(['materials', 'consumables', 'wastes'])(
        'rechaza consultas de %s con más filas del límite en vez de devolver una plantilla parcial',
        async resource => {
            findMany.mockResolvedValue(
                Array.from({ length: INVENTORY_IMPORT_LIMITS.maxRows + 1 }, (_, i) =>
                    offer(resource, i),
                ),
            );
            mocks.getDb.mockReturnValue({
                [resource === 'wastes' ? 'waste' : 'supplierMaterial']: { findMany },
            });

            await expect(
                createInventoryImportTemplate({
                    user: { permissions: Object.values(PERMISSIONS) },
                    resource,
                    mode: 'update',
                }),
            ).rejects.toMatchObject({ code: 'INVENTORY_IMPORT_LIMIT' });

            expect(mocks.processInventoryWorkbook).not.toHaveBeenCalled();
        },
    );
});
