import { MaterialNotFound } from "../../../errors/warehouse/materialError.js";
import { GoodsIssueMissingMaxUnitCost } from "../../../errors/inventory/stockError.js";
import { buildStockKey, normalizeText } from "../../../utils/formattersUtils.js";
import { calculateConvertedQuantity } from "../../inventory/stockHelpers.js";
import { profileHasRole } from "../../admin/profileService.js";
import { findSupplierMaterialsSnapshot } from "../materials/supplierMaterialService.js";
import { FULFILLMENT_STATUS_NAMES } from "../../../constants/warehouseStatuses.js";
import { ROLE_NAMES } from "../../../constants/roles.js";
import { INTERNAL_CLIENT_NAME, PROJECT_NUMBER_BY_DEPARTMENT } from "../../../constants/goodsIssueRules.js";

const FLOAT_EPSILON = 0.000001;
export const isInternalClient = (client) => (
    normalizeText(client?.name || '') === normalizeText(INTERNAL_CLIENT_NAME)
);

export const isValidInternalClientAdvisor = ({ client, advisor }) => {

    if (!isInternalClient(client)) return true;

    return profileHasRole({
        profile: advisor,
        roleName: ROLE_NAMES.COORDINATOR
    });
};

export const isValidInternalClientProjectNumberByDepartment = ({ client, department, projectNumber = '' }) => {

    if (!isInternalClient(client)) return true;

    const expectedProjectNumber = PROJECT_NUMBER_BY_DEPARTMENT.get(department?.name || '');

    return !!expectedProjectNumber && expectedProjectNumber === projectNumber;
};

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

        const { name, base, height, presentation, unitMeasure, maxUnitCost } = sp;
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
            supplierName: sp.supplier.tradeName,
            quantity,
            convertedQuantity,
            maxUnitCost,
            materialName: name,
            materialBase: base,
            materialHeight: height,
            presentationId: presentation.id,
            presentationName: presentation.name,
            unitMeasureId: unitMeasure.id,
            unitMeasureName: unitMeasure.name,
            unitMeasureSymbol: unitMeasure.symbol,
            ...(initialFulfillmentStatusId ? { fulfillmentStatusId: initialFulfillmentStatusId } : {})
        };
    });
}


export const resolveFulfillmentStatus = (details) => {
    const allSupplied = details.every((d) => d.isSupplied);

    const anySupplied = details.some(
        (d) => (d.suppliedQuantity ?? 0) > FLOAT_EPSILON
    );

    return allSupplied
        ? FULFILLMENT_STATUS_NAMES.COMPLETE
        : (anySupplied ? FULFILLMENT_STATUS_NAMES.PARTIAL : FULFILLMENT_STATUS_NAMES.PENDING);
};
