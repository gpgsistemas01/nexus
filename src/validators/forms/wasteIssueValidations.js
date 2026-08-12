import { issueHeaderValidation } from './issueValidations.js';
import { validateIssueDetailsArray, validateIssueDetailsEdition } from '../fields/fieldsValidator.js';

const validateWasteIssueDetails = () => validateIssueDetailsArray({
    itemIdField: 'wasteId',
    minimumQuantity: 0
});

export const wasteIssueValidation = [
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
    validateIssueDetailsEdition
];
