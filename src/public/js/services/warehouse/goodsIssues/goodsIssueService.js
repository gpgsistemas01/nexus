import { apiRequest } from '../../axiosInstanceApi.js';
import { INVENTORY_RESOURCES } from '../../../constants/inventory.js';
import { MATERIAL_GOODS_ISSUES_API_ROUTE } from './materials/materialGoodsIssueService.js';
import { CONSUMABLE_GOODS_ISSUES_API_ROUTE } from './consumables/consumableGoodsIssueService.js';

export const getGoodsIssueRequest = ({ id, resource }) => apiRequest({
    method: 'get',
    url: `${ resource === INVENTORY_RESOURCES.CONSUMABLE ? CONSUMABLE_GOODS_ISSUES_API_ROUTE : MATERIAL_GOODS_ISSUES_API_ROUTE }/${ id }`
});
