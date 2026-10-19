import { INVENTORY_RESOURCES } from '../../../constants/inventory.js';
import { createGoodsReceiptApplication } from '../../../application/warehouse/goodsReceipts/goodsReceipts.js';

const contextElement = document.getElementById('goodsReceiptContext');
const resource = contextElement?.dataset.resource ?? INVENTORY_RESOURCES.MATERIAL;

export const goodsReceiptContext = Object.freeze({
    resource,
    ...createGoodsReceiptApplication({ resource })
});
