import { createGoodsReceiptDtoForRegister } from "../../../dtos/goodsReceiptDto.js";
import { successCodeMessages } from "../../../messages/codeMessages.js";
import {
    createGoodsReceipt,
    findAllGoodsReceipts
} from "../../../services/warehouse/goodsReceipts/goodsReceiptService.js";
import {
    createStockNotification,
    notifyProductStockStatusChanges,
} from "../../../services/warehouse/notificationService.js";
import { emitStockUpdated } from "../../../utils/socketUtils.js";
import { sanitizeEmptyStrings } from "../../../utils/formattersUtils.js";

export const getAllGoodsReceipts = async (req, res) => {

    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const search = req.query['search[value]'] || '';

    const columns = ['referenceNumber'];
    const orderColumnIndex = req.query.order?.[0]?.column || 0;
    const orderDir = req.query.order?.[0]?.dir || 'desc';

    const result = await findAllGoodsReceipts({
        skip: start,
        take: length,
        search,
        orderBy: columns[orderColumnIndex],
        orderDir
    });

    res.status(200).json(result);
}

export const registerGoodsReceipt = async (req, res) => {

    const goodsReceiptDto = createGoodsReceiptDtoForRegister(req.body);
    const sanitizedGoodsReceiptDto = sanitizeEmptyStrings(goodsReceiptDto);

    const { goodsReceipt, impactedProductIds } = await createGoodsReceipt({
        goodsReceiptDto: sanitizedGoodsReceiptDto
    });

    res.status(200).json({
        goodsReceipt,
        code: successCodeMessages.CREATED_GOODS_RECEIPT
    });

    // (async () => {

    //     const productStockNotifications = await notifyProductStockStatusChanges({
    //         productIds: impactedProductIds || [],
    //         userId: req.userId
    //     });
    //     const restoredProductsCount = new Set(
    //         productStockNotifications
    //             .filter((notification) => notification.entityType === 'product-stock-restored')
    //             .map((notification) => notification.entityId)
    //     ).size;

    //     const notification = await createStockNotification({
    //         title: 'Recepción de compra',
    //         message: `La recepción ${goodsReceipt.referenceNumber} restauró el stock de ${restoredProductsCount} producto(s).`,
    //         type: 'info',
    //         referenceNumber: goodsReceipt.referenceNumber,
    //         entityId: goodsReceipt.id,
    //         entityType: 'goods-receipt',
    //         userId: null,
    //         departmentId: null
    //     });

    //     emitStockUpdated({ source: 'goods-receipt-create', notification });

    //     for (const productNotification of productStockNotifications) {
    //         emitStockUpdated({ source: 'product-stock-status', notification: productNotification });
    //     }
    // });
}
