import { MaterialInactiveConflict, MaterialNotFound } from "../../../errors/warehouse/materialError.js";
import { roundTo } from "../../../utils/formattersUtils.js";
import { calculateConvertedQuantity } from "../../inventory/stockHelpers.js";
import { findMaterialsSnapshot } from "../materials/materialService.js";
import { MATERIAL_TYPES } from "../../../constants/inventory.js";
import { GoodsReceiptNotFound } from "../../../errors/warehouse/goodsReceiptError.js";

const IVA_RATE = 1.16;

export const buildGoodsReceiptContextWhere = (type = null) => {
    if (type === null) return {};
    if (!Object.values(MATERIAL_TYPES).includes(type)) throw new GoodsReceiptNotFound();

    return {
        type,
        details: {
            some: {},
            every: { material: { type } }
        }
    };
};

/**
 * Relation graph for raw purchase details returned to the browser. Scalar
 * fields are intentionally not selected so Prisma preserves the persisted
 * detail contract and the frontend owns the table-row mapping.
 */
export const GOODS_RECEIPT_DETAIL_INCLUDE = Object.freeze({
    material: {
        include: {
            presentation: true,
            unitMeasure: true
        }
    }
});

export const buildGoodsReceiptDetails = async (details, { tx = null, supplierId = null, type = null, requireActive = true } = {}) => {
    const materialIds = details.map(d => d.materialId);

    const materials = await findMaterialsSnapshot({ tx, materialIds, supplierId });

    const materialMap = new Map(materials.map(p => [p.id, p]));

    return details.map(detail => {
        const { materialId } = detail;
        const material = materialMap.get(materialId);

        if (!material) throw new MaterialNotFound();
        if (type && material.type !== type) throw new MaterialNotFound();
        if (requireActive && !material.isActive) throw new MaterialInactiveConflict();

        return calculateGoodsReceiptDetail({ material, detail });
    });
};

export const calculateGoodsReceiptDetail = ({ material, detail: { quantity, costPerUnitType } }) => {
    const netPurchaseAmount = roundTo(quantity * costPerUnitType);
    const convertedQuantity = calculateConvertedQuantity({ quantity, base: material.base, height: material.height });

    return {
        materialId: material.id,
        materialName: material.name,
        quantity,
        convertedQuantity,
        costPerUnitType,
        conversionUnitCost: convertedQuantity > 0 ? roundTo(netPurchaseAmount / convertedQuantity) : 0,
        netPurchaseAmount,
        grossPurchaseAmount: roundTo(netPurchaseAmount * IVA_RATE)
    };
};

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
