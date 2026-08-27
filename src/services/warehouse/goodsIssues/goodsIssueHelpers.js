import { MaterialNotFound } from "../../../errors/warehouse/materialError.js";
import { GoodsIssueMissingMaxUnitCost } from "../../../errors/inventory/stockError.js";
import { buildStockKey } from "../../../utils/formattersUtils.js";
import { calculateConvertedQuantity } from "../../inventory/stockHelpers.js";
import { findSupplierMaterialsSnapshot } from "../materials/supplierMaterialService.js";

export const buildGoodsIssueDetails = async ({
    details,
    initialFulfillmentStatusId = null
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
            buildStockKey(sp.id, sp.supplier.id),
            sp
        ])
    );

    return details.map(({ materialId, quantity, supplierId, presentationId }) => {

        const key = buildStockKey(materialId, supplierId);
        const sp = spMap.get(key);

        if (!sp) throw new MaterialNotFound();

        if (presentationId && sp.presentation?.id !== presentationId) throw new MaterialNotFound();

        const { name, base, height, maxUnitCost } = sp;
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
