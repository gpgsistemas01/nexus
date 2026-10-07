import { MATERIAL_TYPES } from '../../../constants/inventory.js';
import { GoodsIssueNotFound } from '../../../errors/warehouse/goodsIssueError.js';
import { MaterialInactiveConflict, MaterialNotFound } from "../../../errors/warehouse/materialError.js";
import { SupplierInactiveConflict } from "../../../errors/warehouse/supplierError.js";
import { GoodsIssueMissingMaxUnitCost } from "../../../errors/inventory/stockError.js";
import { buildStockKey } from "../../../utils/formattersUtils.js";
import { calculateConvertedQuantity } from "../../inventory/stockHelpers.js";
import { findSupplierMaterialsSnapshot } from "../materials/supplierMaterialService.js";

export const buildGoodsIssueContextWhere = (type = MATERIAL_TYPES.MATERIAL) => {
    if (!Object.values(MATERIAL_TYPES).includes(type)) throw new GoodsIssueNotFound();

    return {
        type,
        details: {
            some: {},
            every: { material: { type } }
        }
    };
};

export const buildGoodsIssueDetails = async ({
    details,
    initialFulfillmentStatusId = null,
    type = MATERIAL_TYPES.MATERIAL
}) => {

    const pairs = [
        ...new Map(
            details.map(detail => [
                buildStockKey(detail.materialId, detail.supplierId),
                {
                    materialId: detail.materialId,
                    supplierId: detail.supplierId
                }
            ])
        ).values()
    ];

    const supplierMaterials = await findSupplierMaterialsSnapshot({ pairs });

    const spMap = new Map(
        supplierMaterials.map(sp => [
            buildStockKey(sp.material.id, sp.supplier.id),
            sp
        ])
    );

    return details.map(({ materialId, quantity, supplierId, presentationId }) => {

        const key = buildStockKey(materialId, supplierId);
        const sp = spMap.get(key);

        if (!sp || sp.material.type !== type) throw new MaterialNotFound();
        if (!sp.isActive) throw new MaterialInactiveConflict();
        if (!sp.supplier.isActive) throw new SupplierInactiveConflict();

        if (presentationId && sp.material.presentation?.id !== presentationId) throw new MaterialNotFound();

        const { name, base, height } = sp.material;
        const { maxUnitCost } = sp;
        const convertedQuantity = calculateConvertedQuantity({
            quantity,
            base,
            height
        });

        if (maxUnitCost === null || maxUnitCost === undefined) {
            throw new GoodsIssueMissingMaxUnitCost({
                materialName: name,
                height,
                base,
                supplierName: sp.supplier.tradeName
            });
        }

        return {
            materialId,
            supplierId,
            quantity,
            convertedQuantity,
            maxUnitCost,
            materialName: name,
            ...(initialFulfillmentStatusId ? { fulfillmentStatusId: initialFulfillmentStatusId } : {})
        };
    });
}
