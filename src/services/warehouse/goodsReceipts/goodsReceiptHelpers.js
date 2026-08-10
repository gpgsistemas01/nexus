import { MaterialNotFound } from "../../../errors/warehouse/materialError.js";
import { roundTo } from "../../../utils/formattersUtils.js";
import { calculateConvertedQuantity } from "../../inventory/stockHelpers.js";
import { GOODS_RECEIPT_STATUS_NAMES } from "../../../constants/warehouseStatuses.js";
import { findMaterialsSnapshot } from "../materials/materialService.js";
import { GoodsReceiptDetailAlreadyCanceled } from "../../../errors/warehouse/goodsReceiptError.js";

const IVA_RATE = 1.16;

export const buildGoodsReceiptDetails = async (details, { tx = null } = {}) => {

    const materialIds = details.map(d => d.materialId);

    const materials = await findMaterialsSnapshot({ tx, materialIds });

    const materialMap = new Map(materials.map(p => [p.id, p]));

    return details.map(({ materialId, quantity, costPerUnitType }) => {

        const material = materialMap.get(materialId);

        if (!material) throw new MaterialNotFound();

        const { name, base, height } = material;
        const netPurchaseAmount = roundTo(quantity * costPerUnitType);
        const grossPurchaseAmount = roundTo(netPurchaseAmount * IVA_RATE);
        const convertedQuantity = calculateConvertedQuantity({
            quantity,
            base,
            height
        });
        let conversionUnitCost = 0;

        if (convertedQuantity) conversionUnitCost = convertedQuantity > 0 ? roundTo(netPurchaseAmount / convertedQuantity) : 0;

        return {
            materialId,
            quantity,
            convertedQuantity,
            costPerUnitType,
            conversionUnitCost,
            netPurchaseAmount,
            grossPurchaseAmount,
            materialName: name
        };
    });
}

export const calculateGoodsReceiptTotals = (details = [], { includeCanceled = false } = {}) => details.reduce((acc, detail) => {
    if (!includeCanceled && detail.status === 'CANCELED') return acc;

    acc.totalQuantity += Number(detail.quantity || 0);
    acc.totalNetPurchaseAmount += Number(detail.netPurchaseAmount || 0);
    acc.totalGrossPurchaseAmount += Number(detail.grossPurchaseAmount || 0);

    return acc;
}, {
    totalQuantity: 0,
    totalNetPurchaseAmount: 0,
    totalGrossPurchaseAmount: 0
});

const updateActiveGoodsReceiptDetailAndTotals = async ({ tx, goodsReceiptId, detailId, detailData }) => {
    const { count: updatedDetailsCount } = await tx.goodsReceiptDetail.updateMany({
        where: {
            id: detailId,
            goodsReceiptId,
            status: 'ACTIVE'
        },
        data: detailData
    });

    // The header and totals must never change unless this receipt's detail was
    // still active. This also makes concurrent cancellation attempts safe.
    if (updatedDetailsCount !== 1) throw new GoodsReceiptDetailAlreadyCanceled();

    const updatedDetail = await tx.goodsReceiptDetail.findUnique({
        where: { id: detailId }
    });

    const activeReceiptDetails = await tx.goodsReceiptDetail.findMany({
        where: {
            goodsReceiptId,
            status: 'ACTIVE'
        },
        select: {
            quantity: true,
            netPurchaseAmount: true,
            grossPurchaseAmount: true
        }
    });
    const allDetailsCanceled = activeReceiptDetails.length === 0;
    const historicalReceiptDetails = allDetailsCanceled
        ? await tx.goodsReceiptDetail.findMany({
            where: { goodsReceiptId },
            select: {
                quantity: true,
                netPurchaseAmount: true,
                grossPurchaseAmount: true,
                status: true
            }
        })
        : [];
    const detailsForTotals = allDetailsCanceled
        ? historicalReceiptDetails
        : activeReceiptDetails;
    const totals = calculateGoodsReceiptTotals(detailsForTotals, {
        includeCanceled: allDetailsCanceled
    });

    const updatedReceipt = await tx.goodsReceipt.update({
        where: { id: goodsReceiptId },
        data: {
            ...totals,
            ...(allDetailsCanceled && {
                status: {
                    connect: {
                        name: GOODS_RECEIPT_STATUS_NAMES.CANCELED
                    }
                }
            })
        },
        include: {
            details: {
                include: {
                    material: {
                        include: {
                            presentation: true,
                            unitMeasure: true
                        }
                    }
                }
            },
            status: true
        }
    });

    return {
        updatedDetail,
        updatedReceipt
    };
};

export const correctGoodsReceiptDetailAndTotals = ({ tx, goodsReceiptId, detailId, correctedDetail }) => (
    updateActiveGoodsReceiptDetailAndTotals({
        tx,
        goodsReceiptId,
        detailId,
        detailData: correctedDetail
    })
);

export const cancelGoodsReceiptDetailAndTotals = ({ tx, goodsReceiptId, detailId }) => (
    updateActiveGoodsReceiptDetailAndTotals({
        tx,
        goodsReceiptId,
        detailId,
        detailData: { status: 'CANCELED' }
    })
);

export const createGoodsReceiptDetailsAndUpdateTotals = async ({ tx, goodsReceiptId, details }) => {
    const processedDetails = await buildGoodsReceiptDetails(details, { tx });
    const createdDetails = await tx.goodsReceiptDetail.createManyAndReturn({
        data: processedDetails.map(detail => ({
            ...detail,
            goodsReceiptId
        }))
    });

    const receiptDetails = await tx.goodsReceiptDetail.findMany({
        where: { goodsReceiptId },
        select: {
            quantity: true,
            netPurchaseAmount: true,
            grossPurchaseAmount: true
        }
    });

    const updatedReceipt = await tx.goodsReceipt.update({
        where: { id: goodsReceiptId },
        data: calculateGoodsReceiptTotals(receiptDetails),
        include: {
            details: {
                include: {
                    material: {
                        include: {
                            presentation: true,
                            unitMeasure: true
                        }
                    }
                }
            },
            status: true
        }
    });

    return {
        createdDetails,
        updatedReceipt
    };
};
