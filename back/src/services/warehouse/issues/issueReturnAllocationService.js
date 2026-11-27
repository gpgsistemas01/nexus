import { Prisma } from '../../../../generated/prisma/client.ts';
import { AppError } from '../../../errors/AppError.js';
import { UNVERIFIED_ISSUE_RETURN_SOURCE } from '../../../constants/inventory.js';
import { getErrorMessage } from '../../../shared/messages/apiMessages.js';

const sourceConflict = sources => {
    const code = 'ISSUE_RETURN_COST_SOURCE_REQUIRED';
    const error = new AppError(getErrorMessage({ code }), code, 409);
    error.meta = {
        sources: sources.map(({ id, date, quantity }) => ({ id, date, quantity: quantity.toNumber() }))
    };
    return error;
};

export const resolveIssueReturnAllocations = ({ pricedSources, availableQuantity, returnQuantity, sourceMovementDetailId }) => {
    const unverifiedQuantity = pricedSources.reduce((balance, source) => balance.minus(source.quantity), new Prisma.Decimal(availableQuantity));
    const sources = unverifiedQuantity.gt(0)
        ? [...pricedSources, { id: UNVERIFIED_ISSUE_RETURN_SOURCE, date: null, quantity: unverifiedQuantity }]
        : pricedSources;
    let selectedSources = pricedSources;
    if (sourceMovementDetailId) {
        const selected = sources.find(({ id }) => id === sourceMovementDetailId);
        if (!selected || selected.quantity.lt(returnQuantity)) throw sourceConflict(sources);
        if (selected.id === UNVERIFIED_ISSUE_RETURN_SOURCE) return [];
        selectedSources = [selected];
    } else {
        if (!pricedSources.length) return [];
        const unitCosts = new Set(pricedSources.map(({ unitCost }) => unitCost.toString()));
        if (unverifiedQuantity.gt(0) || unitCosts.size > 1) {
            throw sourceConflict(sources);
        }
    }

    let remaining = new Prisma.Decimal(returnQuantity);
    const allocations = [];
    for (const source of selectedSources) {
        const quantity = Prisma.Decimal.min(source.quantity, remaining);
        allocations.push({ sourceMovementDetailId: source.id, quantity });
        remaining = remaining.minus(quantity);
        if (remaining.isZero()) return allocations;
    }
    throw sourceConflict(sources);
};
