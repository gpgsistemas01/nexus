import { validateGoodsIssueDetailsArray, validateIssueProjectQuantityDetailsEdition } from "../fields/fieldsValidator.js";
import { issueHeaderValidation } from './issueValidations.js';
export { issueReturnValidation as goodsIssueReturnValidation } from './issueReturnValidations.js';

export const goodsIssueValidation = [
    ...issueHeaderValidation,
    validateGoodsIssueDetailsArray()
];

export const goodsIssueUpdateValidation = [
    ...issueHeaderValidation,
    validateGoodsIssueDetailsArray({ allowDetailId: true })
];

export const goodsIssueDetailsValidation = [
    validateIssueProjectQuantityDetailsEdition
];

export const goodsIssueHeaderValidation = issueHeaderValidation;
