import { beforeEach, describe, expect, it, vi } from 'vitest';

const generateYearlyReferenceNumber = vi.fn();
const throwIfReferenceNumberAlreadyExists = vi.fn();
const applyWasteMovement = vi.fn();

vi.mock('../../../../../src/services/document/referenceNumberService.js', () => ({
  generateYearlyReferenceNumber,
  throwIfReferenceNumberAlreadyExists
}));

vi.mock('../../../../../src/services/warehouse/wastes/wasteMovementService.js', () => ({
  applyWasteMovement
}));

const { registerWasteStockEntry } = await import(
  '../../../../../src/services/warehouse/wastes/wasteStockEntryService.js'
);

describe('documento de entrada de existencia de merma', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    generateYearlyReferenceNumber.mockResolvedValue('ENT-MER-2026-0001');
    applyWasteMovement.mockResolvedValue({
      id: 'movement-1',
      details: [
        { wasteId: 'other-waste', previousStock: 10, newStock: 12 },
        { wasteId: 'waste-1', previousStock: 4, newStock: 6 }
      ]
    });
  });

  it('conserva folio, actor, captura, saldos de la merma y vínculo al movimiento', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'entry-1' });
    const tx = { wasteStockEntry: { create } };
    const waste = { id: 'waste-1', name: 'Retazo', base: 2, height: 3 };

    await registerWasteStockEntry({
      tx,
      waste,
      quantity: 2,
      observations: 'Recuperado de producción',
      userId: 'user-1'
    });

    expect(applyWasteMovement).toHaveBeenCalledWith({
      tx,
      movementType: 'ENTRY',
      details: [{ wasteId: 'waste-1', quantity: 2, convertedQuantity: 12 }]
    });
    expect(create).toHaveBeenCalledWith({
      data: {
        referenceNumber: 'ENT-MER-2026-0001',
        waste: { connect: { id: 'waste-1' } },
        createdBy: { connect: { id: 'user-1' } },
        movement: { connect: { id: 'movement-1' } },
        materialName: 'Retazo',
        quantity: 2,
        previousStock: 4,
        newStock: 6,
        observations: 'Recuperado de producción'
      },
      include: { movement: { include: { details: true } } }
    });
  });
});
