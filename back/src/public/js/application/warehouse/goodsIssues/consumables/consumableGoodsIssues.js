import { editConsumableGoodsIssueHeaderRequest, editConsumableGoodsIssueDetailsRequest, editConsumableGoodsIssueRequest, getAllConsumableGoodsIssuesRequest, registerConsumableGoodsIssueRequest, returnConsumableGoodsIssueDetailRequest } from '../../../../services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js';
import { createIssueApplication } from '../../issues/createIssueApplication.js';

const goodsIssueApplication = createIssueApplication({
    requests: {
        getAll: getAllConsumableGoodsIssuesRequest,
        register: registerConsumableGoodsIssueRequest,
        edit: editConsumableGoodsIssueRequest,
        editHeader: editConsumableGoodsIssueHeaderRequest,
        editDetails: editConsumableGoodsIssueDetailsRequest,
        returnDetail: returnConsumableGoodsIssueDetailRequest
    },
    dataKeys: { issueReturn: 'goodsIssueReturn' }
});

export const getAllConsumableGoodsIssues = goodsIssueApplication.getAll;
export const registerConsumableGoodsIssue = goodsIssueApplication.register;
export const editConsumableGoodsIssue = goodsIssueApplication.edit;
export const editConsumableGoodsIssueHeader = goodsIssueApplication.editHeader;
export const editConsumableGoodsIssueDetails = goodsIssueApplication.editDetails;
export const returnConsumableGoodsIssueDetail = goodsIssueApplication.returnDetail;
