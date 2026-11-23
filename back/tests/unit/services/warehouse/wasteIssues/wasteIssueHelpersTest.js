import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../src/services/warehouse/issues/issueHeaderService.js', () => ({ resolveIssueHeaderData: vi.fn() }));
const { buildWasteIssueDetails } = await import('../../../../../src/services/warehouse/wasteIssues/wasteIssueHelpers.js');

describe('costo de merma antes de solicitar su uso', () => {
  const details = [{ wasteId: 'waste-1', quantity: 2, maxUnitCost: 99 }];
  const waste = { id: 'waste-1', name: 'Lona', base: 1, height: 2, supplier: { tradeName: 'Proveedor vigente' } };

  it('rechaza una cantidad fraccionaria con la presentación de la merma guardada', async () => {
    const tx = { waste: { findMany: vi.fn().mockResolvedValue([{ ...waste, maxUnitCost: 10, presentation: { name: 'PIEZA' } }]) } };
    await expect(buildWasteIssueDetails({ tx, details: [{ wasteId: 'waste-1', quantity: 0.5 }], fulfillmentStatusId: 'pending' }))
      .rejects.toMatchObject({ code: 'INVENTORY_PIECE_QUANTITY_REQUIRED' });
  });

  it.each([null, undefined, 0, '0.000000', -1])('rechaza el costo %j del almacén aunque el cliente envíe otro', async maxUnitCost => {
    const tx = { waste: { findMany: vi.fn().mockResolvedValue([{ ...waste, maxUnitCost }]) } };
    await expect(buildWasteIssueDetails({ tx, details, fulfillmentStatusId: 'pending' }))
      .rejects.toMatchObject({ code: 'WASTE_ISSUE_MISSING_MAX_UNIT_COST', statusCode: 409, meta: { materialName: 'Lona' } });
  });

  it.each([
    [[], '0.000001'],
    [[{ wasteId: 'waste-1', materialName: 'Merma original', supplierName: 'Proveedor original', maxUnitCost: '2.25' }], '2.25'],
    [[{ wasteId: 'waste-1', materialName: 'Merma original', supplierName: 'Proveedor original', maxUnitCost: null }], null]
  ])('guarda el costo confiable y conserva el de una partida existente: %j', async (previousDetails, expectedCost) => {
    const tx = { waste: { findMany: vi.fn().mockResolvedValue([{ ...waste, maxUnitCost: '0.000001' }]) } };
    const result = await buildWasteIssueDetails({ tx, details, fulfillmentStatusId: 'pending', previousDetails });
    expect(result).toEqual([expect.objectContaining({
      quantity: 2,
      convertedQuantity: 4,
      materialName: previousDetails[0]?.materialName ?? waste.name,
      supplierName: previousDetails[0]?.supplierName ?? waste.supplier.tradeName,
      maxUnitCost: expectedCost
    })]);
  });
});
