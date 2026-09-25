import { describe, expect, it, vi } from 'vitest';

const applyWasteStockChange = vi.fn();

vi.mock('../../../../../src/services/warehouse/wastes/wasteInventoryService.js', () => ({
  applyWasteStockChange
}));

vi.mock('../../../../../src/repository/baseRepository.js', () => ({
  getDb: tx => tx
}));

const { applyWasteMovement } = await import(
  '../../../../../src/services/warehouse/wastes/wasteMovementService.js'
);

describe('movimientos de inventario de merma', () => {
  it.each([
    ['entrada', 'ENTRY', 2, 3],
    ['salida', 'ISSUE', -2, -3]
  ])('aplica %s mediante el mismo flujo', async (_label, movementType, signedQuantity, signedConvertedQuantity) => {
    const create = vi.fn().mockResolvedValue({ id: 'movement-1' });
    const tx = { wasteMovement: { create } };
    applyWasteStockChange.mockResolvedValue({ previousStock: 4, newStock: 4 + signedQuantity, updated: true });

    await applyWasteMovement({
      tx,
      reference: { referenceNumber: 'MOV-1' },
      movementType,
      details: [{ wasteId: 'waste-1', quantity: 2, convertedQuantity: 3 }]
    });

    expect(applyWasteStockChange).toHaveBeenCalledWith({
      tx,
      id: 'waste-1',
      quantityChange: signedQuantity,
      convertedQuantityChange: signedConvertedQuantity
    });
    expect(create).toHaveBeenCalledWith({
      data: {
        referenceNumber: 'MOV-1',
        type: movementType,
        details: {
          create: [{
            wasteId: 'waste-1',
            quantity: signedQuantity,
            previousStock: 4,
            newStock: 4 + signedQuantity
          }]
        }
      },
      include: { details: true }
    });
  });
});
