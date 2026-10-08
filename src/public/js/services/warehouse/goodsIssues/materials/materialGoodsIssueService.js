import { createGoodsIssueRequests } from '../createGoodsIssueRequests.js';

export const MATERIAL_GOODS_ISSUES_API_ROUTE = '/api/warehouse/goods-issues/materials';

const requests = createGoodsIssueRequests({
    apiRoute: MATERIAL_GOODS_ISSUES_API_ROUTE,
    reportRoute: '/api/warehouse/reports/goods-issues/materials/excel'
});

export const getAllMaterialGoodsIssuesRequest = requests.getAllGoodsIssuesRequest;
export const registerMaterialGoodsIssueRequest = requests.registerGoodsIssueRequest;
export const editMaterialGoodsIssueRequest = requests.editGoodsIssueRequest;
export const editMaterialGoodsIssueHeaderRequest = requests.editGoodsIssueHeaderRequest;
export const editMaterialGoodsIssueDetailsRequest = requests.editGoodsIssueDetailsRequest;
export const returnMaterialGoodsIssueDetailRequest = requests.returnGoodsIssueDetailRequest;
export const exportMaterialGoodsIssueReportRequest = requests.exportReportRequest;
