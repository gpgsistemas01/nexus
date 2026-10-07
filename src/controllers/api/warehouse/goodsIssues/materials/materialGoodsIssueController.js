import {
    createMaterialGoodsIssue,
    findAllMaterialGoodsIssues,
    updateMaterialGoodsIssue,
    updateMaterialGoodsIssueDetails,
    updateMaterialGoodsIssueHeader,
    returnMaterialGoodsIssueDetail
} from '../../../../../services/warehouse/goodsIssues/materials/materialGoodsIssueService.js';
import { buildListHandler, buildRegisterHandler, buildEditHandler, buildHeaderHandler, buildDetailsHandler, buildReturnHandler } from '../shared/goodsIssueHandlers.js';

export const getAllMaterialGoodsIssues = buildListHandler(findAllMaterialGoodsIssues);
export const registerMaterialGoodsIssue = buildRegisterHandler(createMaterialGoodsIssue);
export const editMaterialGoodsIssue = buildEditHandler(updateMaterialGoodsIssue);
export const editMaterialGoodsIssueHeader = buildHeaderHandler(updateMaterialGoodsIssueHeader);
export const editMaterialGoodsIssueDetails = buildDetailsHandler({
    updateGoodsIssueDetails: updateMaterialGoodsIssueDetails,
    inventoryContext: 'material'
});
export const registerMaterialGoodsIssueDetailReturn = buildReturnHandler({
    returnGoodsIssueDetail: returnMaterialGoodsIssueDetail,
    inventoryContext: 'material'
});
