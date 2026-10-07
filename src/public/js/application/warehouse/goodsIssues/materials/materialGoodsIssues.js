import { editMaterialGoodsIssueHeaderRequest, editMaterialGoodsIssueDetailsRequest, editMaterialGoodsIssueRequest, getAllMaterialGoodsIssuesRequest, registerMaterialGoodsIssueRequest, returnMaterialGoodsIssueDetailRequest } from '../../../../services/warehouse/goodsIssues/materials/materialGoodsIssueService.js';
import { createIssueApplication } from '../../issues/createIssueApplication.js';

const goodsIssueApplication = createIssueApplication({
    requests: {
        getAll: getAllMaterialGoodsIssuesRequest,
        register: registerMaterialGoodsIssueRequest,
        edit: editMaterialGoodsIssueRequest,
        editHeader: editMaterialGoodsIssueHeaderRequest,
        editDetails: editMaterialGoodsIssueDetailsRequest,
        returnDetail: returnMaterialGoodsIssueDetailRequest
    },
    dataKeys: { issueReturn: 'goodsIssueReturn' }
});

export const getAllMaterialGoodsIssues = goodsIssueApplication.getAll;
export const registerMaterialGoodsIssue = goodsIssueApplication.register;
export const editMaterialGoodsIssue = goodsIssueApplication.edit;
export const editMaterialGoodsIssueHeader = goodsIssueApplication.editHeader;
export const editMaterialGoodsIssueDetails = goodsIssueApplication.editDetails;
export const returnMaterialGoodsIssueDetail = goodsIssueApplication.returnDetail;
