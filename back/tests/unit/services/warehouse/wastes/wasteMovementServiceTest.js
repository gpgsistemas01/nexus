import { describe, expect, it, vi } from 'vitest';

const applyWasteStockChanges = vi.fn();

vi.mock('../../../../../src/services/warehouse/wastes/wasteInventoryService.js', () => ({
  applyWasteStockChanges
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
    applyWasteStockChanges.mockImplementation(async () => new Map([['waste-1', { previousStock: 4, newStock: 4 + signedQuantity }]]));

    await applyWasteMovement({
      tx,
      reference: { referenceNumber: 'MOV-1' },
      movementType,
      details: [{ wasteId: 'waste-1', quantity: 2, convertedQuantity: 3 }]
    });

    expect(applyWasteStockChanges).toHaveBeenCalledWith({
      tx,
      changes: [{
        id: 'waste-1',
        materialName: undefined,
        quantityChange: signedQuantity,
        convertedQuantityChange: signedConvertedQuantity
      }]
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

  it('agrupa una merma repetida y conserva la secuencia de cada detalle en el historial', async () => {
    const create = vi.fn().mockImplementation(async ({ data }) => ({ details: data.details.create }));
    const tx = { wasteMovement: { create } };
    applyWasteStockChanges.mockImplementation(async () => new Map([['waste-1', { previousStock: 10, newStock: 7 }]]));

    const movement = await applyWasteMovement({
      tx,
      movementType: 'ISSUE',
      details: [
        { wasteId: 'waste-1', quantity: 1, convertedQuantity: 2 },
        { wasteId: 'waste-1', quantity: 2, convertedQuantity: 4 }
      ]
    });

    expect(applyWasteStockChanges).toHaveBeenLastCalledWith({
      tx,
      changes: [{ id: 'waste-1', materialName: undefined, quantityChange: -3, convertedQuantityChange: -6 }]
    });
    expect(movement.details.map(detail => [detail.previousStock, detail.newStock])).toEqual([[10, 9], [9, 7]]);
  });
});
