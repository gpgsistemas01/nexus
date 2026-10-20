import { createGoodsIssueRequests } from '../createGoodsIssueRequests.js';

export const CONSUMABLE_GOODS_ISSUES_API_ROUTE = '/api/warehouse/goods-issues/consumables';

const requests = createGoodsIssueRequests({
    apiRoute: CONSUMABLE_GOODS_ISSUES_API_ROUTE,
    reportRoute: '/api/warehouse/reports/goods-issues/consumables/excel'
});

export const getAllConsumableGoodsIssuesRequest = requests.getAllGoodsIssuesRequest;
export const registerConsumableGoodsIssueRequest = requests.registerGoodsIssueRequest;
export const editConsumableGoodsIssueRequest = requests.editGoodsIssueRequest;
export const editConsumableGoodsIssueHeaderRequest = requests.editGoodsIssueHeaderRequest;
export const editConsumableGoodsIssueDetailsRequest = requests.editGoodsIssueDetailsRequest;
export const returnConsumableGoodsIssueDetailRequest = requests.returnGoodsIssueDetailRequest;
export const exportConsumableGoodsIssueReportRequest = requests.exportReportRequest;
