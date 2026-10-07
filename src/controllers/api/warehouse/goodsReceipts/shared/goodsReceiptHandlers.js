import { createGoodsReceiptDtoForCorrection, createGoodsReceiptDtoForEdit, createGoodsReceiptDtoForRegister } from '../../../../../dtos/goodsReceiptDTO.js';
import { successCodeMessages } from '../../../../../messages/codeMessages.js';
import { getDataTableOrder, getDataTablePaging, getDataTableSearch } from '../../../../../utils/requestQueryUtils.js';
import { emitInventoryUpdated } from '../../../../../utils/socketUtils.js';
import { sanitizeEmptyStrings } from '../../../../../utils/formattersUtils.js';

export const buildListHandler = findGoodsReceipts => async (req, res) => {
    const { skip, take } = getDataTablePaging(req.query);
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns: ['referenceNumber', 'receptionDate', 'supplierName', 'invoice', null],
        defaultDirection: 'desc'
    });
    const result = await findGoodsReceipts({
        skip,
        take,
        search: getDataTableSearch(req.query),
        startDate: req.query.startDate || '',
        endDate: req.query.endDate || '',
        supplierId: req.query.supplierId || '',
        personId: req.query.personId || '',
        orderBy,
        orderDir
    });

    return res.status(200).json(result);
};

export const buildRegisterHandler = ({ createGoodsReceipt, inventoryContext }) => async (req, res) => {
    const goodsReceiptDto = sanitizeEmptyStrings(createGoodsReceiptDtoForRegister(req.body));
    const goodsReceipt = await createGoodsReceipt({ goodsReceiptDto });

    emitInventoryUpdated({ context: inventoryContext, source: 'goods-receipt-created' });

    return res.status(200).json({
        goodsReceipt,
        code: successCodeMessages.CREATED_GOODS_RECEIPT
    });
};

export const buildEditHandler = ({ updateGoodsReceipt, inventoryContext }) => async (req, res) => {
    const goodsReceiptDto = sanitizeEmptyStrings(createGoodsReceiptDtoForEdit(req.body));
    const goodsReceipt = await updateGoodsReceipt({
        id: req.params.id,
        goodsReceiptDto: {
            ...goodsReceiptDto,
            userId: req.user.id
        }
    });

    emitInventoryUpdated({ context: inventoryContext, source: 'goods-receipt-updated' });

    return res.status(200).json({
        goodsReceipt,
        code: successCodeMessages.UPDATED_GOODS_RECEIPT
    });
};

export const buildCorrectionHandler = ({ correctGoodsReceiptDetail, inventoryContext }) => async (req, res) => {
    const correctionDto = sanitizeEmptyStrings(createGoodsReceiptDtoForCorrection(req.body));
    const correction = await correctGoodsReceiptDetail({
        id: req.params.id,
        detailId: req.params.detailId,
        correctionDto,
        userId: req.user.id
    });

    emitInventoryUpdated({ context: inventoryContext, source: 'goods-receipt-detail-corrected' });

    return res.status(200).json({
        correction,
        code: successCodeMessages.UPDATED_GOODS_RECEIPT
    });
};

export const buildCancellationHandler = ({ cancelGoodsReceiptDetail, inventoryContext }) => async (req, res) => {
    const correction = await cancelGoodsReceiptDetail({
        id: req.params.id,
        detailId: req.params.detailId,
        userId: req.user.id
    });

    emitInventoryUpdated({ context: inventoryContext, source: 'goods-receipt-detail-cancelled' });

    return res.status(200).json({
        correction,
        code: successCodeMessages.UPDATED_GOODS_RECEIPT
    });
};
