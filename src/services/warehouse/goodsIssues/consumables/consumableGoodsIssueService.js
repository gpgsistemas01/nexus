import { MATERIAL_TYPES } from '../../../../constants/inventory.js';
import { createGoodsIssue, findAllGoodsIssues, updateGoodsIssue, updateGoodsIssueDetails, updateGoodsIssueHeader } from '../goodsIssueService.js';
import { returnGoodsIssueDetail } from '../detailReturns/goodsIssueReturnService.js';
import { findGoodsIssueReportRows } from '../../reportService.js';

const type = MATERIAL_TYPES.CONSUMABLE;

export const findAllConsumableGoodsIssues = options => findAllGoodsIssues({ ...options, type });
export const createConsumableGoodsIssue = options => createGoodsIssue({ ...options, type });
export const updateConsumableGoodsIssue = options => updateGoodsIssue({ ...options, type });
export const updateConsumableGoodsIssueHeader = options => updateGoodsIssueHeader({ ...options, type });
export const updateConsumableGoodsIssueDetails = options => updateGoodsIssueDetails({ ...options, type });
export const returnConsumableGoodsIssueDetail = options => returnGoodsIssueDetail({ ...options, type });
export const findConsumableGoodsIssueReportRows = options => findGoodsIssueReportRows({ ...options, type });
