import express from 'express';
import {
    getAllMaterialGoodsIssues, getMaterialGoodsIssue,
    registerMaterialGoodsIssue,
    editMaterialGoodsIssue,
    editMaterialGoodsIssueHeader,
    editMaterialGoodsIssueDetails,
    registerMaterialGoodsIssueDetailReturn
} from '../../../../../controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueController.js';
import { goodsIssueRouteMiddleware } from '../shared/goodsIssueRouteMiddleware.js';

const router = express.Router();

router.get(
    '/:id',
    ...goodsIssueRouteMiddleware.list,
    getMaterialGoodsIssue
);

router.get(
    '/',
    ...goodsIssueRouteMiddleware.list,
    getAllMaterialGoodsIssues
);

router.post(
    '/',
    ...goodsIssueRouteMiddleware.register,
    registerMaterialGoodsIssue
);

router.patch(
    '/:id',
    ...goodsIssueRouteMiddleware.edit,
    editMaterialGoodsIssue
);

router.patch(
    '/:id/header',
    ...goodsIssueRouteMiddleware.editHeader,
    editMaterialGoodsIssueHeader
);

router.patch(
    '/:id/details',
    ...goodsIssueRouteMiddleware.editDetails,
    editMaterialGoodsIssueDetails
);

router.patch(
    '/:id/details/:detailId/returns',
    ...goodsIssueRouteMiddleware.returnDetail,
    registerMaterialGoodsIssueDetailReturn
);

export default router;
