import { expect, it, vi } from 'vitest';

const findMany = vi.fn().mockResolvedValue([]);
const count = vi.fn().mockResolvedValue(0);
const queryRaw = vi.fn();

vi.mock('../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({ wasteMovementDetail: { findMany, count }, movementDetail: { findMany, count }, $queryRaw: queryRaw })
}));

vi.mock('../../../../src/utils/logger.js', () => ({
  createServiceLogger: () => ({}),
  logServiceError: vi.fn()
}));

const { findAllWasteMovements, findAllMaterialMovements } = await import('../../../../src/services/inventory/movementQueryService.js');

it('filtra movimientos de merma por el id de Waste seleccionado', async () => {
  await findAllWasteMovements({ wasteId: 'waste-1', supplierId: 'supplier-1' });

  expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: expect.objectContaining({
      wasteId: 'waste-1',
      waste: { supplierId: 'supplier-1' }
    })
  }));
});

it('muestra el nombre actual de Material aunque el documento conserve otro nombre', async () => {
  findMany.mockResolvedValueOnce([{
    id: 'detail-1', material: { name: 'Nombre vigente', base: 1, height: 1 },
    goodsReceiptDetail: { materialName: 'Nombre histórico' },
    supplier: { tradeName: 'Proveedor' }, quantity: 2, previousStock: 0, newStock: 2,
    movement: { type: 'ENTRY', date: new Date('2026-10-07'), createdAt: new Date('2026-10-07'), referenceNumber: 'COM-001' }
  }]);
  const result = await findAllMaterialMovements();
  expect(result.data[0]).toMatchObject({ materialName: 'Nombre vigente', quantity: 2, newStock: 2 });
  expect(result.data[0]).not.toHaveProperty('unitCost');
  expect(queryRaw).not.toHaveBeenCalled();
});

it('omite la lectura de costos cuando una página autorizada no tiene movimientos', async () => {
  await findAllMaterialMovements({ canReadCosts: true, take: 0 });

  expect(queryRaw).not.toHaveBeenCalled();
});
