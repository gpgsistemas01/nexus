import {
    validateGoodsIssueDetailsArray,
    validateIssueProjectQuantityDetailsEdition
} from "../fields/fieldsValidator.js";
import { issueHeaderValidation, issueImmediateSupplyValidation } from './issueValidations.js';
export { issueReturnValidation as goodsIssueReturnValidation } from './issueReturnValidations.js';

export const goodsIssueValidation = [
    issueImmediateSupplyValidation,
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

export const goodsIssueHeaderValidation = [...issueHeaderValidation];
