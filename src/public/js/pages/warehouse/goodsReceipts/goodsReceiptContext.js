import { INVENTORY_RESOURCES } from '../../../constants/inventory.js';

const contextElement = document.getElementById('goodsReceiptContext');

export const goodsReceiptContext = Object.freeze({
    resource: contextElement?.dataset.resource ?? INVENTORY_RESOURCES.MATERIAL
});
