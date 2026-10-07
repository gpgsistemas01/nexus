import { INVENTORY_RESOURCES } from '../../../constants/inventory.js';

const contextElement = document.getElementById('goodsIssueContext');

export const goodsIssueContext = Object.freeze({
    resource: contextElement?.dataset.resource ?? INVENTORY_RESOURCES.MATERIAL
});
