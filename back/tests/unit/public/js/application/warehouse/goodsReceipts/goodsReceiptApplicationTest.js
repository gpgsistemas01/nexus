import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiRequest = vi.hoisted(() => vi.fn());
vi.mock('../../../../../../../src/public/js/services/axiosInstanceApi.js', () => ({ apiRequest }));
const { createGoodsReceiptApplication } = await import('../../../../../../../src/public/js/application/warehouse/goodsReceipts/goodsReceipts.js');

describe('operaciones de goods-receipts configuradas sin estado de la página', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        apiRequest.mockResolvedValue({ data: { code: 'OK', goodsReceipt: { id: 'document-1' } } });
    });

    it.each(['material', 'consumable'])('conserva las rutas y los datos de %s aunque se configure otro contexto', async resource => {
        const application = createGoodsReceiptApplication({ resource });
        createGoodsReceiptApplication({ resource: resource === 'material' ? 'consumable' : 'material' });
        const path = `/api/warehouse/goods-receipts/${ resource === 'material' ? 'materials' : 'consumables' }`;
        for (const operation of ['getAll', 'register', 'editHeader', 'correctDetail', 'cancelDetail']) {
            await application[operation]({
                formData: { observations: 'Captura' }, id: 'document-1', detailId: 'detail-1', start: 0
            });
        }
        expect(apiRequest).toHaveBeenCalledTimes(5);
        for (const [config] of apiRequest.mock.calls) expect(config.url.startsWith(path)).toBe(true);
        expect(apiRequest.mock.calls[0][0].params).toMatchObject({ start: 0 });
        expect(apiRequest.mock.calls[1][0].data).toEqual({ observations: 'Captura' });

        await expect(application.get({ id: 'document-1' })).resolves.toEqual({ id: 'document-1' });
        expect(apiRequest).toHaveBeenLastCalledWith({ method: 'get', url: `${ path }/document-1` });
        await application.exportReport({ startDate: '2026-10-07' });
        expect(apiRequest).toHaveBeenLastCalledWith(expect.objectContaining({
            url: `/api/warehouse/reports/goods-receipts/${ resource === 'material' ? 'materials' : 'consumables' }/excel`,
            params: { startDate: '2026-10-07' }, responseType: 'blob'
        }));
    });
});
