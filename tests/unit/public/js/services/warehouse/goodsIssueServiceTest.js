import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiRequest = vi.fn();
const goodsIssueContext = { resource: 'material' };
vi.mock('../../../../../../src/public/js/services/axiosInstanceApi.js', () => ({ apiRequest }));
vi.mock('../../../../../../src/public/js/pages/warehouse/goodsIssues/goodsIssueContext.js', () => ({ goodsIssueContext }));
vi.mock('../../../../../../src/public/js/pages/warehouse/goodsReceipts/goodsReceiptContext.js', () => ({
    goodsReceiptContext: { resource: 'material' }
}));

describe('rutas de salidas según el contexto de la página', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it.each(['material', 'consumable'])('usa rutas específicas para %s en todas las solicitudes', async resource => {
        goodsIssueContext.resource = resource;
        const service = await import('../../../../../../src/public/js/services/warehouse/goodsIssues/goodsIssueService.js');
        const requests = [
            service.getAllGoodsIssuesRequest, service.registerGoodsIssueRequest, service.editGoodsIssueRequest,
            service.editGoodsIssueHeaderRequest, service.editGoodsIssueDetailsRequest, service.returnGoodsIssueDetailRequest
        ];
        for (const request of requests) {
            request({ data: { observations: 'Salida' }, id: 'issue-1', detailId: 'detail-1', params: { start: 0 } });
        }
        const path = `/api/warehouse/goods-issues/${resource === 'consumable' ? 'consumables' : 'materials'}`;
        expect(apiRequest).toHaveBeenCalledTimes(requests.length);
        for (const [config] of apiRequest.mock.calls) expect(config.url.startsWith(path)).toBe(true);
        expect(apiRequest.mock.calls[0][0].params).toEqual({ start: 0 });
        const { exportGoodsIssueReportRequest } = await import('../../../../../../src/public/js/services/warehouse/reportService.js');
        await exportGoodsIssueReportRequest({ startDate: '2026-10-07' });
        expect(apiRequest).toHaveBeenLastCalledWith(expect.objectContaining({
            url: `/api/warehouse/reports/goods-issues/${resource === 'consumable' ? 'consumables' : 'materials'}/excel`
        }));
    });
    it.each([['materials', 'Material'], ['consumables', 'Consumable']])('la aplicación específica de %s conserva su contexto aunque la página indique otro', async (folder, label) => {
        goodsIssueContext.resource = label === 'Material' ? 'consumable' : 'material';
        const application = await import(`../../../../../../src/public/js/application/warehouse/goodsIssues/${folder}/${label.toLowerCase()}GoodsIssues.js`);
        application[`getAll${label}GoodsIssues`]({ type: label === 'Material' ? 'CONSUMABLE' : 'MATERIAL' });
        expect(apiRequest).toHaveBeenLastCalledWith(expect.objectContaining({
            url: `/api/warehouse/goods-issues/${folder}`
        }));
    });
});
