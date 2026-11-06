import { RecordVersionConflictError } from '../../../errors/concurrencyError.js';
import { IssueSupplyQuantityConflict } from '../../../errors/warehouse/issueSupplyError.js';
import { normalizeDecimal } from '../../../shared/utils/numberUtils.js';
import { assertPieceQuantity } from '../../inventory/stockHelpers.js';

const FLOAT_EPSILON = 0.000001;

export const resolveIssueSupplyChange = ({ current, requested }) => {
    const hasQuantity = requested.quantityToSupply !== undefined;
    const projectData = {
        projectConvertedQuantity: requested.projectConvertedQuantity,
        convertedQuantityDifference: normalizeDecimal(Number(current.convertedQuantity) - requested.projectConvertedQuantity)
    };
    if (!requested.isSupplied || (!hasQuantity && current.isSupplied)) {
        return hasQuantity ? null : { quantityToSupply: 0, data: projectData };
    }
    const suppliedQuantity = normalizeDecimal(current.suppliedQuantity ?? 0);
    const quantity = normalizeDecimal(current.quantity);
    const pendingQuantity = normalizeDecimal(quantity - suppliedQuantity);

    if (hasQuantity && (
        !Number.isFinite(requested.expectedSuppliedQuantity)
        || Math.abs(requested.expectedSuppliedQuantity - suppliedQuantity) > FLOAT_EPSILON
    )) throw new RecordVersionConflictError();

    const requestedQuantity = hasQuantity ? requested.quantityToSupply : pendingQuantity;
    assertPieceQuantity({ quantity: requestedQuantity, item: current.material ?? current.waste });
    const quantityToSupply = normalizeDecimal(requestedQuantity);
    if (!Number.isFinite(quantityToSupply) || quantityToSupply <= FLOAT_EPSILON
        || quantityToSupply > pendingQuantity + FLOAT_EPSILON) {
        throw new IssueSupplyQuantityConflict();
    }

    const newSuppliedQuantity = normalizeDecimal(suppliedQuantity + quantityToSupply);
    return {
        quantityToSupply,
        data: {
            suppliedQuantity: newSuppliedQuantity,
            isSupplied: newSuppliedQuantity >= quantity - FLOAT_EPSILON,
            ...projectData
        }
    };
};
