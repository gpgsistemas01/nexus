import { createGoodsReceiptDtoForCorrection, createGoodsReceiptDtoForEdit, createGoodsReceiptDtoForRegister } from "../../../dtos/goodsReceiptDTO.js";
import { successCodeMessages } from "../../../messages/codeMessages.js";
import {
    createGoodsReceipt,
    findAllGoodsReceipts,
    updateGoodsReceipt
} from "../../../services/warehouse/goodsReceipts/goodsReceiptService.js";
import { cancelGoodsReceiptDetailLine } from "../../../services/warehouse/goodsReceipts/detailChanges/goodsReceiptCancellationService.js";
import { correctGoodsReceiptDetailLine } from "../../../services/warehouse/goodsReceipts/detailChanges/goodsReceiptCorrectionService.js";
import { getDataTableOrder, getDataTablePaging, getDataTableSearch } from "../../../utils/requestQueryUtils.js";
import { emitInventoryUpdated } from "../../../utils/socketUtils.js";
import { sanitizeEmptyStrings } from "../../../utils/formattersUtils.js";

export const getAllGoodsReceipts = async (req, res) => {

    const { skip, take } = getDataTablePaging(req.query);
    const search = getDataTableSearch(req.query);
    const startDate = req.query.startDate || '';
    const endDate = req.query.endDate || '';
    const supplierId = req.query.supplierId || '';
    const personId = req.query.personId || '';

    const columns = ['referenceNumber', 'receptionDate', 'supplierName', 'invoice', null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns,
        defaultDirection: 'desc'
    });

    const result = await findAllGoodsReceipts({
        skip,
        take,
        search,
        startDate,
        endDate,
        supplierId,
        personId,
        orderBy,
        orderDir
    });

    return res.status(200).json(result);
}

export const registerGoodsReceipt = async (req, res) => {

    const goodsReceiptDto = createGoodsReceiptDtoForRegister(req.body);
    const sanitizedGoodsReceiptDto = sanitizeEmptyStrings(goodsReceiptDto);

    const goodsReceipt = await createGoodsReceipt({
        goodsReceiptDto: sanitizedGoodsReceiptDto
    });

    emitInventoryUpdated({ context: 'material', source: 'goods-receipt-created' });

    return res.status(200).json({
        goodsReceipt,
        code: successCodeMessages.CREATED_GOODS_RECEIPT
    });
}


export const editGoodsReceiptHeader = async (req, res) => {

    const goodsReceiptDto = createGoodsReceiptDtoForEdit(req.body);
    const sanitizedGoodsReceiptDto = sanitizeEmptyStrings(goodsReceiptDto);

    const goodsReceipt = await updateGoodsReceipt({
        id: req.params.id,
        goodsReceiptDto: {
            ...sanitizedGoodsReceiptDto,
            userId: req.user.id
        }
    });

    emitInventoryUpdated({ context: 'material', source: 'goods-receipt-updated' });

    return res.status(200).json({
        goodsReceipt,
        code: successCodeMessages.UPDATED_GOODS_RECEIPT
    });
};


export const correctGoodsReceiptDetail = async (req, res) => {

    const correctionDto = createGoodsReceiptDtoForCorrection(req.body);
    const sanitizedCorrectionDto = sanitizeEmptyStrings(correctionDto);

    const correction = await correctGoodsReceiptDetailLine({
        id: req.params.id,
        detailId: req.params.detailId,
        correctionDto: sanitizedCorrectionDto,
        userId: req.user.id
    });

    emitInventoryUpdated({ context: 'material', source: 'goods-receipt-detail-corrected' });

    return res.status(200).json({
        correction,
        code: successCodeMessages.UPDATED_GOODS_RECEIPT
    });
};

export const cancelGoodsReceiptDetail = async (req, res) => {

    const correction = await cancelGoodsReceiptDetailLine({
        id: req.params.id,
        detailId: req.params.detailId,
        userId: req.user.id
    });

    emitInventoryUpdated({ context: 'material', source: 'goods-receipt-detail-cancelled' });

    return res.status(200).json({
        correction,
        code: successCodeMessages.UPDATED_GOODS_RECEIPT
    });
};
