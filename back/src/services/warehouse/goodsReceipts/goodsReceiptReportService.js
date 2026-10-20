import { formatDateLongWithTime, toNumber } from '../../../utils/formattersUtils.js';
import { GOODS_RECEIPT_STATUS_NAMES } from '../../../constants/warehouseStatuses.js';
import { GOODS_RECEIPT_DETAIL_STATUSES } from '../../../shared/constants/goodsReceiptStatuses.js';
import { QUERY_BATCH_SIZES } from '../../../constants/pagination.js';
import { findBatches } from '../../../repository/paginationRepository.js';
import { findAllGoodsReceipts } from './goodsReceiptService.js';

const mapGoodsReceiptDetailRows = function* (goodsReceipts = [], { materialId = '' } = {}) {
    for (const goodsReceipt of goodsReceipts) {
        if (goodsReceipt.status?.name === GOODS_RECEIPT_STATUS_NAMES.CANCELED) continue;

        const receptionDate = formatDateLongWithTime(goodsReceipt.receptionDate);
        for (const detail of goodsReceipt.details || []) {
            if (detail.status === GOODS_RECEIPT_DETAIL_STATUSES.CANCELED || (materialId && detail.materialId !== materialId)) continue;

            yield {
                referenceNumber: goodsReceipt.referenceNumber,
                receptionDate,
                receivedByName: goodsReceipt.receivedByName,
                supplierName: goodsReceipt.supplierName,
                invoice: goodsReceipt.isInvoiced ? goodsReceipt.invoice : 'Sin factura',
                materialId: detail.materialId,
                materialName: detail.materialName,
                materialBase: toNumber(detail.material?.base),
                materialHeight: toNumber(detail.material?.height),
                quantity: toNumber(detail.quantity),
                presentationName: detail.material?.presentation?.name,
                convertedQuantity: toNumber(detail.convertedQuantity),
                unitMeasureName: detail.material?.unitMeasure?.symbol || detail.material?.unitMeasure?.name,
                conversionUnitCost: toNumber(detail.conversionUnitCost),
                costPerUnitType: toNumber(detail.costPerUnitType),
                netPurchaseAmount: toNumber(detail.netPurchaseAmount),
                grossPurchaseAmount: toNumber(detail.grossPurchaseAmount)
            };
        }
    }
};

export const findGoodsReceiptReportRows = async function* ({
    search = '',
    startDate = '',
    endDate = '',
    supplierId = '',
    personId = '',
    type = null,
    orderBy = 'referenceNumber',
    orderDir = 'desc'
} = {}) {

    for await (const page of findBatches({
        batchSize: QUERY_BATCH_SIZES.DOCUMENTS,
        fetchPage: async query => (await findAllGoodsReceipts({ ...query, includeCounts: false })).data,
        query: {
            search,
            startDate,
            endDate,
            supplierId,
            personId,
            type,
            excludeCanceled: true,
            activeDetailsOnly: true,
            orderBy,
            orderDir
        }
    })) yield* mapGoodsReceiptDetailRows(page);
};
