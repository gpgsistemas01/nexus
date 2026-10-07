import { MATERIAL_TYPES } from '../../../../constants/inventory.js';
import { createGoodsIssue, findAllGoodsIssues, updateGoodsIssue, updateGoodsIssueDetails, updateGoodsIssueHeader } from '../goodsIssueService.js';
import { returnGoodsIssueDetail } from '../detailReturns/goodsIssueReturnService.js';
import { findGoodsIssueReportRows } from '../../reportService.js';

const type = MATERIAL_TYPES.MATERIAL;

export const findAllMaterialGoodsIssues = options => findAllGoodsIssues({ ...options, type });
export const createMaterialGoodsIssue = options => createGoodsIssue({ ...options, type });
export const updateMaterialGoodsIssue = options => updateGoodsIssue({ ...options, type });
export const updateMaterialGoodsIssueHeader = options => updateGoodsIssueHeader({ ...options, type });
export const updateMaterialGoodsIssueDetails = options => updateGoodsIssueDetails({ ...options, type });
export const returnMaterialGoodsIssueDetail = options => returnGoodsIssueDetail({ ...options, type });
export const findMaterialGoodsIssueReportRows = options => findGoodsIssueReportRows({ ...options, type });
