import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    findAllGoodsIssues: vi.fn(), createGoodsIssue: vi.fn(), updateGoodsIssue: vi.fn(),
    updateGoodsIssueHeader: vi.fn(), updateGoodsIssueDetails: vi.fn(),
    returnGoodsIssueDetail: vi.fn(), findGoodsIssueReportRows: vi.fn()
}));
vi.mock('../../../../../src/services/warehouse/goodsIssues/goodsIssueService.js', () => mocks);
vi.mock('../../../../../src/services/warehouse/goodsIssues/detailReturns/goodsIssueReturnService.js', () => ({
    returnGoodsIssueDetail: mocks.returnGoodsIssueDetail
}));
vi.mock('../../../../../src/services/warehouse/reportService.js', () => ({
    findGoodsIssueReportRows: mocks.findGoodsIssueReportRows
}));
const materialService = await import('../../../../../src/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js');
const consumableService = await import('../../../../../src/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js');

describe('servicios de salida específicos por contexto como las compras', () => {
    beforeEach(() => vi.clearAllMocks());

    it.each([
        ['Material', 'MATERIAL', materialService],
        ['Consumable', 'CONSUMABLE', consumableService]
    ])('fija el tipo de %s aunque el llamador envíe otro tipo', (label, type, service) => {
        for (const [publicName, baseName] of [
            [`findAll${label}GoodsIssues`, 'findAllGoodsIssues'],
            [`create${label}GoodsIssue`, 'createGoodsIssue'],
            [`update${label}GoodsIssue`, 'updateGoodsIssue'],
            [`update${label}GoodsIssueHeader`, 'updateGoodsIssueHeader'],
            [`update${label}GoodsIssueDetails`, 'updateGoodsIssueDetails'],
            [`return${label}GoodsIssueDetail`, 'returnGoodsIssueDetail'],
            [`find${label}GoodsIssueReportRows`, 'findGoodsIssueReportRows']
        ]) {
            const options = { id: 'issue-1', type: type === 'MATERIAL' ? 'CONSUMABLE' : 'MATERIAL' };
            service[publicName](options);
            expect(mocks[baseName]).toHaveBeenCalledWith({ id: 'issue-1', type });
        }
    });
});
