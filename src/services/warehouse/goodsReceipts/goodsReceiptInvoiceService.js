import { GoodsReceiptInvoiceAlreadyExists } from '../../../errors/warehouse/goodsReceiptError.js';
import { getDb } from '../../../repository/baseRepository.js';

export const assertGoodsReceiptInvoiceAvailable = async ({
    supplierId,
    invoice,
    excludeGoodsReceiptId = null
}) => {
    if (!invoice) return;

    const existingGoodsReceipt = await getDb().goodsReceipt.findFirst({
        where: {
            supplierId,
            invoice,
            ...(excludeGoodsReceiptId && { id: { not: excludeGoodsReceiptId } })
        },
        select: {
            id: true,
            referenceNumber: true
        }
    });

    if (existingGoodsReceipt) {
        throw new GoodsReceiptInvoiceAlreadyExists(existingGoodsReceipt);
    }
};
