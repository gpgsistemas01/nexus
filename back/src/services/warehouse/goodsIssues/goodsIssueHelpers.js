import { MATERIAL_TYPES } from '../../../shared/constants/inventory.js';
import { GoodsIssueNotFound } from '../../../errors/warehouse/goodsIssueError.js';
import { MaterialInactiveConflict, MaterialNotFound } from "../../../errors/warehouse/materialError.js";
import { SupplierInactiveConflict } from "../../../errors/warehouse/supplierError.js";
import { GoodsIssueMissingMaxUnitCost } from "../../../errors/inventory/stockError.js";
import { buildStockKey } from '../../../utils/formattersUtils.js';
import { calculateConvertedQuantity } from '../../../shared/inventory/stockQuantity.js';
import { assertPieceQuantity } from "../../inventory/stockHelpers.js";
import { findSupplierMaterialsSnapshot } from "../materials/supplierMaterialService.js";
import { lockSupplierMaterialsForIssue } from '../../../repository/warehouse/stockLockRepository.js';
import { assertMaterialDetailMatchesInventory, materialDocumentDetailsWhere } from '../materials/materialDocumentSnapshot.js';

export const buildGoodsIssueContextWhere = (type = MATERIAL_TYPES.MATERIAL) => {
    if (!Object.values(MATERIAL_TYPES).includes(type)) throw new GoodsIssueNotFound();

    return {
        type,
        details: materialDocumentDetailsWhere(type)
    };
};

export const buildGoodsIssueDetails = async ({
    tx,
    details,
    initialFulfillmentStatusId = null,
    type = MATERIAL_TYPES.MATERIAL,
    supplyImmediately = false,
    previousDetails = []
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

    const locked = await lockSupplierMaterialsForIssue({ tx, pairs, supplyImmediately });
    if (locked.length !== pairs.length) throw new MaterialNotFound();
    const supplierMaterials = await findSupplierMaterialsSnapshot({ tx, pairs });

    const spMap = new Map(
        supplierMaterials.map(sp => [
            buildStockKey(sp.material.id, sp.supplier.id),
            sp
        ])
    );
    const previousByPair = new Map(previousDetails.map(detail => [
        buildStockKey(detail.materialId, detail.supplierId), detail
    ]));

    return details.map(({ materialId, quantity, supplierId, presentationId }) => {

        const key = buildStockKey(materialId, supplierId);
        const sp = spMap.get(key);
        const previous = previousByPair.get(key);

        if (!sp || sp.material.type !== type) throw new MaterialNotFound();
        if (previous) assertMaterialDetailMatchesInventory(previous, sp.material);
        if (!sp.isActive) throw new MaterialInactiveConflict();
        if (!sp.supplier.isActive) throw new SupplierInactiveConflict();

        if (presentationId && sp.material.presentation?.id !== presentationId) throw new MaterialNotFound();

        assertPieceQuantity({ quantity, item: sp.material });

        const { name, base, height } = sp.material;
        const { maxUnitCost } = sp;
        const convertedQuantity = calculateConvertedQuantity({
            quantity,
            base,
            height
        });

        if (!(Number(maxUnitCost) > 0)) {
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
            materialName: previous?.materialName ?? name,
            supplierName: previous?.supplierName || sp.supplier.tradeName,
            ...(previous?.materialSpecification && {
                materialType: previous.materialType,
                materialSpecification: previous.materialSpecification
            }),
            ...(initialFulfillmentStatusId ? { fulfillmentStatusId: initialFulfillmentStatusId } : {})
        };
    });
}
