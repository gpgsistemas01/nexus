import * as materialRequests from './materials/materialGoodsIssueService.js';
import * as consumableRequests from './consumables/consumableGoodsIssueService.js';
import { goodsIssueContext } from '../../../pages/warehouse/goodsIssues/goodsIssueContext.js';
import { INVENTORY_RESOURCES } from '../../../constants/inventory.js';

const isConsumable = goodsIssueContext.resource === INVENTORY_RESOURCES.CONSUMABLE;

export const GOODS_ISSUES_API_ROUTE = isConsumable ? consumableRequests.CONSUMABLE_GOODS_ISSUES_API_ROUTE : materialRequests.MATERIAL_GOODS_ISSUES_API_ROUTE;
export const getAllGoodsIssuesRequest = isConsumable ? consumableRequests.getAllConsumableGoodsIssuesRequest : materialRequests.getAllMaterialGoodsIssuesRequest;
export const registerGoodsIssueRequest = isConsumable ? consumableRequests.registerConsumableGoodsIssueRequest : materialRequests.registerMaterialGoodsIssueRequest;
export const editGoodsIssueRequest = isConsumable ? consumableRequests.editConsumableGoodsIssueRequest : materialRequests.editMaterialGoodsIssueRequest;
export const editGoodsIssueHeaderRequest = isConsumable ? consumableRequests.editConsumableGoodsIssueHeaderRequest : materialRequests.editMaterialGoodsIssueHeaderRequest;
export const editGoodsIssueDetailsRequest = isConsumable ? consumableRequests.editConsumableGoodsIssueDetailsRequest : materialRequests.editMaterialGoodsIssueDetailsRequest;
export const returnGoodsIssueDetailRequest = isConsumable ? consumableRequests.returnConsumableGoodsIssueDetailRequest : materialRequests.returnMaterialGoodsIssueDetailRequest;
export const exportGoodsIssueReportRequest = isConsumable ? consumableRequests.exportConsumableGoodsIssueReportRequest : materialRequests.exportMaterialGoodsIssueReportRequest;
