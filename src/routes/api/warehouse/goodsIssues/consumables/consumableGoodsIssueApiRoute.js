import express from 'express';
import {
    getAllConsumableGoodsIssues,
    registerConsumableGoodsIssue,
    editConsumableGoodsIssue,
    editConsumableGoodsIssueHeader,
    editConsumableGoodsIssueDetails,
    registerConsumableGoodsIssueDetailReturn
} from '../../../../../controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueController.js';
import { goodsIssueRouteMiddleware } from '../shared/goodsIssueRouteMiddleware.js';

const router = express.Router();

router.get('/', ...goodsIssueRouteMiddleware.list, getAllConsumableGoodsIssues);
router.post('/', ...goodsIssueRouteMiddleware.register, registerConsumableGoodsIssue);
router.patch('/:id', ...goodsIssueRouteMiddleware.edit, editConsumableGoodsIssue);
router.patch('/:id/header', ...goodsIssueRouteMiddleware.editHeader, editConsumableGoodsIssueHeader);
router.patch('/:id/details', ...goodsIssueRouteMiddleware.editDetails, editConsumableGoodsIssueDetails);
router.patch('/:id/details/:detailId/returns', ...goodsIssueRouteMiddleware.returnDetail, registerConsumableGoodsIssueDetailReturn);

export default router;
