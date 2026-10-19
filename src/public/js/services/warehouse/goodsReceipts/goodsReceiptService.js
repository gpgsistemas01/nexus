import { apiRequest } from '../../axiosInstanceApi.js';
import { INVENTORY_RESOURCES } from '../../../constants/inventory.js';
import { MATERIAL_GOODS_RECEIPTS_API_ROUTE } from './materials/materialGoodsReceiptService.js';
import { CONSUMABLE_GOODS_RECEIPTS_API_ROUTE } from './consumables/consumableGoodsReceiptService.js';

export const getGoodsReceiptRequest = ({ id, resource }) => apiRequest({
    method: 'get',
    url: `${ resource === INVENTORY_RESOURCES.CONSUMABLE ? CONSUMABLE_GOODS_RECEIPTS_API_ROUTE : MATERIAL_GOODS_RECEIPTS_API_ROUTE }/${ id }`
});
