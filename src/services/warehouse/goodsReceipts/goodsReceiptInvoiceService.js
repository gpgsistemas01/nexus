import { GoodsReceiptInvoiceAlreadyExists } from '../../../errors/warehouse/goodsReceiptError.js';
import { getDb } from '../../../repository/baseRepository.js';

export const assertGoodsReceiptInvoiceAvailable = async ({
    tx,
    supplierId,
    invoice,
    excludeGoodsReceiptId = null
}) => {
    if (!invoice) return;

    const existingGoodsReceipt = await getDb(tx).goodsReceipt.findFirst({
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
