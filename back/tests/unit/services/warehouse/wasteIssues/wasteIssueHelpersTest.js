import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../src/services/warehouse/issues/issueHeaderService.js', () => ({ resolveIssueHeaderData: vi.fn() }));
const { buildWasteIssueDetails } = await import('../../../../../src/services/warehouse/wasteIssues/wasteIssueHelpers.js');

describe('costo de merma antes de solicitar su uso', () => {
  const details = [{ wasteId: 'waste-1', quantity: 2, maxUnitCost: 99 }];
  const waste = { id: 'waste-1', name: 'Lona', base: 1, height: 2 };

  it.each([null, undefined, 0, '0.000000', -1])('rechaza el costo %j del almacén aunque el cliente envíe otro', async maxUnitCost => {
    const tx = { waste: { findMany: vi.fn().mockResolvedValue([{ ...waste, maxUnitCost }]) } };
    await expect(buildWasteIssueDetails({ tx, details, fulfillmentStatusId: 'pending' }))
      .rejects.toMatchObject({ code: 'WASTE_ISSUE_MISSING_MAX_UNIT_COST', statusCode: 409, meta: { materialName: 'Lona' } });
  });

  it('acepta un costo positivo de seis decimales sin persistir el costo enviado', async () => {
    const tx = { waste: { findMany: vi.fn().mockResolvedValue([{ ...waste, maxUnitCost: '0.000001' }]) } };
    const result = await buildWasteIssueDetails({ tx, details, fulfillmentStatusId: 'pending' });
    expect(result).toEqual([expect.objectContaining({ quantity: 2, convertedQuantity: 4 })]);
    expect(result[0]).not.toHaveProperty('maxUnitCost');
  });
});
