import {
    createConsumableGoodsIssue,
    findAllConsumableGoodsIssues,
    updateConsumableGoodsIssue,
    updateConsumableGoodsIssueDetails,
    updateConsumableGoodsIssueHeader,
    returnConsumableGoodsIssueDetail
} from '../../../../../services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js';
import { buildListHandler, buildRegisterHandler, buildEditHandler, buildHeaderHandler, buildDetailsHandler, buildReturnHandler } from '../shared/goodsIssueHandlers.js';

export const getAllConsumableGoodsIssues = buildListHandler(findAllConsumableGoodsIssues);
export const registerConsumableGoodsIssue = buildRegisterHandler(createConsumableGoodsIssue);
export const editConsumableGoodsIssue = buildEditHandler(updateConsumableGoodsIssue);
export const editConsumableGoodsIssueHeader = buildHeaderHandler(updateConsumableGoodsIssueHeader);
export const editConsumableGoodsIssueDetails = buildDetailsHandler({
    updateGoodsIssueDetails: updateConsumableGoodsIssueDetails,
    inventoryContext: 'consumable'
});
export const registerConsumableGoodsIssueDetailReturn = buildReturnHandler({
    returnGoodsIssueDetail: returnConsumableGoodsIssueDetail,
    inventoryContext: 'consumable'
});
