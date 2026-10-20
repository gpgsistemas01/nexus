import { getGoodsIssueRequest } from '../../../services/warehouse/goodsIssues/goodsIssueService.js';
import * as materialApplication from './materials/materialGoodsIssues.js';
import * as consumableApplication from './consumables/consumableGoodsIssues.js';
import { exportMaterialGoodsIssueReportRequest } from '../../../services/warehouse/goodsIssues/materials/materialGoodsIssueService.js';
import { exportConsumableGoodsIssueReportRequest } from '../../../services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js';
import { INVENTORY_RESOURCES } from '../../../../../shared/constants/inventory.js';
import { createReportApplication } from '../../createReportApplication.js';

export const createGoodsIssueApplication = ({ resource }) => {
    const consumable = resource === INVENTORY_RESOURCES.CONSUMABLE;

    return Object.freeze({
        getAll: consumable ? consumableApplication.getAllConsumableGoodsIssues : materialApplication.getAllMaterialGoodsIssues,
        register: consumable ? consumableApplication.registerConsumableGoodsIssue : materialApplication.registerMaterialGoodsIssue,
        edit: consumable ? consumableApplication.editConsumableGoodsIssue : materialApplication.editMaterialGoodsIssue,
        editHeader: consumable ? consumableApplication.editConsumableGoodsIssueHeader : materialApplication.editMaterialGoodsIssueHeader,
        editDetails: consumable ? consumableApplication.editConsumableGoodsIssueDetails : materialApplication.editMaterialGoodsIssueDetails,
        returnDetail: consumable ? consumableApplication.returnConsumableGoodsIssueDetail : materialApplication.returnMaterialGoodsIssueDetail,
        get: async ({ id }) => (await getGoodsIssueRequest({ id, resource })).data.goodsIssue,
        exportReport: createReportApplication(consumable ? exportConsumableGoodsIssueReportRequest : exportMaterialGoodsIssueReportRequest)
    });
};
