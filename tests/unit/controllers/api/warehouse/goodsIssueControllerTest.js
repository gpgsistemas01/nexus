import { beforeEach, describe, expect, it, vi } from 'vitest';

const createGoodsIssue = vi.fn();
const findAllGoodsIssues = vi.fn();
const returnGoodsIssueDetail = vi.fn();
const updateGoodsIssue = vi.fn();
const updateGoodsIssueDetails = vi.fn();
const updateGoodsIssueHeader = vi.fn();

vi.mock('../../../../../src/services/warehouse/goodsIssues/goodsIssueService.js', () => ({
    createGoodsIssue,
    findAllGoodsIssues,
    updateGoodsIssue,
    updateGoodsIssueDetails,
    updateGoodsIssueHeader
}));

vi.mock('../../../../../src/services/warehouse/goodsIssues/detailReturns/goodsIssueReturnService.js', () => ({
    returnGoodsIssueDetail
}));

vi.mock('../../../../../src/services/warehouse/reportService.js', () => ({
    findGoodsIssueReportRows: vi.fn()
}));

const { registerMaterialGoodsIssueDetailReturn } = await import('../../../../../src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueController.js');
const { registerConsumableGoodsIssueDetailReturn } = await import('../../../../../src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueController.js');

const createResponse = () => {
    const res = {
        status: vi.fn(),
        json: vi.fn()
    };
    res.status.mockReturnValue(res);
    return res;
};

describe('goodsIssueController', () => {
    beforeEach(() => vi.clearAllMocks());

    it.each(['material', 'consumable'])('registra la devolución con los datos sanitizados, el usuario y el contexto %s', async inventoryResource => {
        const goodsIssueReturn = { id: 'return-1', detail: { id: 'detail-1' } };
        const req = {
            params: { id: 'goods-issue-1', detailId: 'detail-1' },
            query: { inventoryResource },
            body: { returnQuantity: '2.5', observations: '  Material no utilizado  ' },
            user: { id: 'user-1' }
        };
        const res = createResponse();
        returnGoodsIssueDetail.mockResolvedValue(goodsIssueReturn);

        const handler = inventoryResource === 'consumable' ? registerConsumableGoodsIssueDetailReturn : registerMaterialGoodsIssueDetailReturn;
        await handler(req, res);

        expect(returnGoodsIssueDetail).toHaveBeenCalledWith({
            id: 'goods-issue-1',
            detailId: 'detail-1',
            returnDto: {
                returnQuantity: 2.5,
                observations: 'Material no utilizado'
            },
            userId: 'user-1',
            type: inventoryResource === 'consumable' ? 'CONSUMABLE' : 'MATERIAL'
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            goodsIssueReturn,
            code: 'UPDATED_GOODS_ISSUE'
        });
    });
});
