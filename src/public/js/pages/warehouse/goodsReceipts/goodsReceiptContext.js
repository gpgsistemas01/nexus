import { INVENTORY_RESOURCES } from '../../../constants/inventory.js';

const isConsumableRoute = window.location.pathname.split('/').includes('consumibles');

export const goodsReceiptContext = Object.freeze({
    resource: isConsumableRoute
        ? INVENTORY_RESOURCES.CONSUMABLE
        : INVENTORY_RESOURCES.MATERIAL
});
