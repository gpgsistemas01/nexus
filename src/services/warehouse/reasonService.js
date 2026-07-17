import { getDb } from "../../repository/baseRepository.js";


export const GOODS_RECEIPT_CORRECTION_REASON_NAME = 'Corrección de compra';
export const GOODS_RECEIPT_RETURN_REASON_NAME = 'Devolución de compra';
export const GOODS_RECEIPT_CORRECTION_REASON_NAMES = Object.freeze([
    GOODS_RECEIPT_CORRECTION_REASON_NAME,
    GOODS_RECEIPT_RETURN_REASON_NAME
]);

export const findGoodsReceiptCorrectionReason = ({ tx = null, name = GOODS_RECEIPT_CORRECTION_REASON_NAME } = {}) => {
    const db = tx || getDb();

    return db.stockAdjustmentReason.findFirst({
        where: {
            name
        },
        select: {
            id: true
        }
    });
};

export const findAllReasons = async ({
    skip = 0,
    take = 10,
    search = '',
    orderBy = 'name',
    orderDir = 'asc'
}) => {

    const where = search
        ? {
            name: {
                contains: search,
                mode: 'insensitive'
            }
        }
        : {};

    const reasons = await getDb().stockAdjustmentReason.findMany({
        skip,
        take,
        where,
        orderBy: {
            [orderBy]: orderDir
        },
        select: {
            id: true,
            name: true
        }
    });

    const total = await getDb().stockAdjustmentReason.count();
    const filtered = await getDb().stockAdjustmentReason.count({ where });

    return {
        data: reasons,
        recordsTotal: total,
        recordsFiltered: filtered
    };
}
