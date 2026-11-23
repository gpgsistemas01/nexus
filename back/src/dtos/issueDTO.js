import { PERMISSIONS } from '../shared/constants/permissions.js';

const canReadCosts = user => user?.permissions?.includes(PERMISSIONS.INVENTORY_COSTS_READ);

const omitCost = ({ maxUnitCost, ...fields }) => fields;

const omitDetailCosts = detail => ({
    ...omitCost(detail),
    ...(detail.waste && { waste: omitCost(detail.waste) })
});

export const presentIssueDocument = (issue, user) => !issue?.details || canReadCosts(user)
    ? issue
    : { ...issue, details: issue.details.map(omitDetailCosts) };

export const presentIssueReturn = (result, user) => !result?.detail || canReadCosts(user)
    ? result
    : { ...result, detail: omitDetailCosts(result.detail) };

export const createIssueHeaderDto = (body = {}) => ({
    requesterId: body.requesterId.trim(),
    advisorId: body.advisorId.trim(),
    clientId: body.clientId.trim(),
    departmentId: body.departmentId.trim(),
    projectNumber: body.projectNumber.trim(),
    requestDate: body.requestDate,
    ...(Object.prototype.hasOwnProperty.call(body, 'observations') && {
        observations: typeof body.observations === 'string'
            ? body.observations.trim()
            : null
    })
});

export const createIssueDetailsDto = (
    details = [],
    { itemIdField, mapAdditionalFields = () => ({}) }
) => details.map(detail => ({
    [itemIdField]: detail[itemIdField].trim(),
    quantity: detail.quantity,
    ...mapAdditionalFields(detail)
}));

export const createIssueSupplyDetailsDto = (details = []) => details.map(detail => ({
    id: detail.id,
    isSupplied: detail.isSupplied,
    projectConvertedQuantity: detail.projectConvertedQuantity,
    ...(detail.quantityToSupply !== undefined && {
        quantityToSupply: detail.quantityToSupply,
        expectedSuppliedQuantity: detail.expectedSuppliedQuantity
    })
}));
