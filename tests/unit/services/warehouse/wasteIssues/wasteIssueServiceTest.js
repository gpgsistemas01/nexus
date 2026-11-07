import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../src/repository/baseRepository.js', () => ({
    getDb: vi.fn()
}));

import { buildWasteIssueDetails } from '../../../../../src/services/warehouse/wasteIssues/wasteIssueService.js';

describe('buildWasteIssueDetails', () => {
    it('rechaza una merma sin costo máximo antes de utilizarla en una salida', async () => {
        const tx = {
            waste: {
                findMany: vi.fn().mockResolvedValue([{
                    id: 'waste-id',
                    name: 'Merma sin costo',
                    isActive: true,
                    maxUnitCost: null
                }])
            }
        };

        await expect(buildWasteIssueDetails({
            tx,
            details: [{ wasteId: 'waste-id', quantity: 1 }],
            fulfillmentStatusId: 'pending-id'
        })).rejects.toMatchObject({
            code: 'WASTE_ISSUE_MISSING_MAX_UNIT_COST',
            statusCode: 409
        });
    });
});
