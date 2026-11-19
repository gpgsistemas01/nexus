import { MaterialInactiveConflict, MaterialNotFound } from "../../../errors/warehouse/materialError.js";
import { calculateGoodsReceiptDetailAmounts, usesAutomaticTotalCost } from '../../../shared/inventory/goodsReceiptCalculations.js';
import { findMaterialsSnapshot } from "../materials/materialService.js";
import { MATERIAL_TYPES } from '../../../shared/constants/inventory.js';
import { GoodsReceiptNotFound } from "../../../errors/warehouse/goodsReceiptError.js";
import { assertPieceQuantity } from '../../inventory/stockHelpers.js';
import { lockMaterialIdentitiesForPurchase } from '../../../repository/warehouse/stockLockRepository.js';
import { materialDocumentDetailsWhere } from '../materials/materialDocumentSnapshot.js';
import { ensureSupplierMaterials } from '../materials/supplierMaterialService.js';

export const buildGoodsReceiptContextWhere = (type = null) => {
    if (type === null) return {};
    if (!Object.values(MATERIAL_TYPES).includes(type)) throw new GoodsReceiptNotFound();

    return {
        type,
        details: materialDocumentDetailsWhere(type)
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
    const materialIds = [...new Set(details.map(d => d.materialId))];

    if (tx) await lockMaterialIdentitiesForPurchase({ tx, materialIds });
    const materials = await findMaterialsSnapshot({ tx, materialIds, supplierId });

    const materialMap = new Map(materials.map(p => [p.id, p]));

    return details.map(detail => {
        const { materialId } = detail;
        const material = materialMap.get(materialId);

        if (!material) throw new MaterialNotFound();
        if (type && material.type !== type) throw new MaterialNotFound();
        if (requireActive && !material.isActive) throw new MaterialInactiveConflict();

        return calculateGoodsReceiptDetail({ material, detail: { ...detail, costIsTotal: usesAutomaticTotalCost(material) || detail.costIsTotal === true } });
    });
};

export const calculateGoodsReceiptDetail = ({ material, detail, materialName = material.name }) => {
    assertPieceQuantity({ quantity: detail.quantity, item: material });

    return {
        materialId: material.id,
        materialName,
        ...calculateGoodsReceiptDetailAmounts({ ...detail, base: material.base, height: material.height })
    };
};

export const prepareGoodsReceiptDetails = async ({ tx, supplierId, type, details }) => {
    const processedDetails = await buildGoodsReceiptDetails(details, { tx, supplierId, type });
    await ensureSupplierMaterials({ tx, supplierId, materialIds: processedDetails.map(detail => detail.materialId) });
    return processedDetails;
};

// Las entradas ya hidratan los artículos al guardar la compra; reutilizan esos datos para el movimiento.
export const buildGoodsReceiptStockOffers = (goodsReceipt, details = goodsReceipt.details) => {
    const materials = details === goodsReceipt.details
        ? null
        : new Map(goodsReceipt.details.map(detail => [detail.materialId, detail.material]));
    const offers = new Map();
    for (const { materialId, material, conversionUnitCost } of details) {
        let offer = offers.get(materialId);
        if (!offer) {
            offer = {
                materialId,
                supplierId: goodsReceipt.supplierId,
                material: material ?? materials?.get(materialId),
                supplier: { tradeName: goodsReceipt.supplierName }
            };
            offers.set(materialId, offer);
        }
        const unitCost = Number(conversionUnitCost);
        if (unitCost > (offer.receiptUnitCost ?? 0)) {
            offer.receiptUnitCost = unitCost;
        }
    }
    return [...offers.values()];
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
