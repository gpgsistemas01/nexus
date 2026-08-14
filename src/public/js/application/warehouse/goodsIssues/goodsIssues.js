import { editGoodsIssueDetailsRequest, editGoodsIssueHeaderRequest, editGoodsIssueRequest, getAllGoodsIssuesRequest, registerGoodsIssueRequest, returnGoodsIssueDetailRequest } from "../../../services/warehouse/goodsIssueService.js";
import { createIssueApplication } from '../issues/createIssueApplication.js';

const goodsIssueApplication = createIssueApplication({
    requests: {
        getAll: getAllGoodsIssuesRequest,
        register: registerGoodsIssueRequest,
        edit: editGoodsIssueRequest,
        editHeader: editGoodsIssueHeaderRequest,
        editDetails: editGoodsIssueDetailsRequest,
        returnDetail: returnGoodsIssueDetailRequest
    },
    dataKeys: { issueReturn: 'goodsIssueReturn' }
});

export const getAllGoodsIssues = goodsIssueApplication.getAll;
export const registerGoodsIssue = goodsIssueApplication.register;
export const editGoodsIssue = goodsIssueApplication.edit;
export const editGoodsIssueHeader = goodsIssueApplication.editHeader;
export const editGoodsIssueDetails = goodsIssueApplication.editDetails;
export const returnGoodsIssueDetail = goodsIssueApplication.returnDetail;
