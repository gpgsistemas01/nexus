import { ProductNotFound } from "../../../errors/warehouse/productError.js";
import { GoodsIssueMissingMaxUnitCost } from "../../../errors/inventory/stockError.js";
import { buildStockKey, normalizeText } from "../../../utils/formattersUtils.js";
import { calculateConvertedQuantity } from "../../inventory/stockHelpers.js";
import { profileHasRole } from "../../admin/profileService.js";
import { findSupplierProductsSnapshot } from "../products/supplierProductService.js";
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
                buildStockKey(detail.productId, detail.supplierId),
                {
                    productId: detail.productId,
                    supplierId: detail.supplierId
                }
            ])
        ).values()
    ];

    const supplierProducts = await findSupplierProductsSnapshot({ pairs });

    const spMap = new Map(
        supplierProducts.map(sp => [
            buildStockKey(sp.id, sp.supplier.id),
            sp
        ])
    );

    return details.map(({ productId, quantity, supplierId, presentationId }) => {

        const key = buildStockKey(productId, supplierId);
        const sp = spMap.get(key);

        if (!sp) throw new ProductNotFound();

        if (presentationId && sp.presentation?.id !== presentationId) throw new ProductNotFound();

        const { name, base, height, presentation, unitMeasure, maxUnitCost } = sp;
        const convertedQuantity = calculateConvertedQuantity({
            quantity,
            base,
            height
        });

        if (maxUnitCost === null || maxUnitCost === undefined) {
            throw new GoodsIssueMissingMaxUnitCost({
                productName: name,
                height,
                base,
                supplierName: sp.supplier.tradeName
            });
        }

        return {
            productId,
            supplierId,
            supplierName: sp.supplier.tradeName,
            quantity,
            convertedQuantity,
            maxUnitCost,
            productName: name,
            productBase: base,
            productHeight: height,
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
