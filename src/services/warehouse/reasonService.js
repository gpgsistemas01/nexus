import { getDb } from "../../repository/baseRepository.js";


export const GOODS_RECEIPT_CORRECTION_REASON_NAME = 'Corrección de compra';

export const findGoodsReceiptCorrectionReason = ({ tx = null } = {}) => {
    const db = tx || getDb();

    return db.stockAdjustmentReason.findFirst({
        where: {
            name: GOODS_RECEIPT_CORRECTION_REASON_NAME
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
