import { issueHeaderValidation, issueImmediateSupplyValidation } from './issueValidations.js';
import { validateIssueDetailsArray, validateIssueProjectQuantityDetailsEdition } from '../fields/fieldsValidator.js';

const validateWasteIssueDetails = () => validateIssueDetailsArray({
    itemIdField: 'wasteId',
    minimumQuantity: 0
});

export const wasteIssueValidation = [
    issueImmediateSupplyValidation,
    ...issueHeaderValidation,
    validateWasteIssueDetails()
];

export const wasteIssueUpdateValidation = [
    ...issueHeaderValidation,
    validateWasteIssueDetails()
];

export const wasteIssueHeaderValidation = [
    ...issueHeaderValidation
];

export const wasteIssueDetailsValidation = [
    validateIssueProjectQuantityDetailsEdition
];
