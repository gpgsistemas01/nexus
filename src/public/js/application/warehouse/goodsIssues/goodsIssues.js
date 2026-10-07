import * as materialApplication from './materials/materialGoodsIssues.js';
import * as consumableApplication from './consumables/consumableGoodsIssues.js';
import { goodsIssueContext } from '../../../pages/warehouse/goodsIssues/goodsIssueContext.js';

const consumable = goodsIssueContext.resource === 'consumable';
export const getAllGoodsIssues = consumable ? consumableApplication.getAllConsumableGoodsIssues : materialApplication.getAllMaterialGoodsIssues;
export const registerGoodsIssue = consumable ? consumableApplication.registerConsumableGoodsIssue : materialApplication.registerMaterialGoodsIssue;
export const editGoodsIssue = consumable ? consumableApplication.editConsumableGoodsIssue : materialApplication.editMaterialGoodsIssue;
export const editGoodsIssueHeader = consumable ? consumableApplication.editConsumableGoodsIssueHeader : materialApplication.editMaterialGoodsIssueHeader;
export const editGoodsIssueDetails = consumable ? consumableApplication.editConsumableGoodsIssueDetails : materialApplication.editMaterialGoodsIssueDetails;
export const returnGoodsIssueDetail = consumable ? consumableApplication.returnConsumableGoodsIssueDetail : materialApplication.returnMaterialGoodsIssueDetail;
