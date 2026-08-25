import { expect, it, vi } from 'vitest';

const findMany = vi.fn().mockResolvedValue([]);
const count = vi.fn().mockResolvedValue(0);

vi.mock('../../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({ wasteMovementDetail: { findMany, count } })
}));

vi.mock('../../../../src/utils/logger.js', () => ({
  createServiceLogger: () => ({}),
  logServiceError: vi.fn()
}));

const { findAllWasteMovements } = await import('../../../../src/services/inventory/movementQueryService.js');

it('filtra movimientos de merma por el id de Waste seleccionado', async () => {
  await findAllWasteMovements({ materialId: 'waste-1', supplierId: 'supplier-1' });

  expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: expect.objectContaining({
      wasteId: 'waste-1',
      waste: { supplierId: 'supplier-1' }
    })
  }));
});
