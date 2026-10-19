import { INVENTORY_RESOURCES } from '../../../constants/inventory.js';
import { createGoodsIssueApplication } from '../../../application/warehouse/goodsIssues/goodsIssues.js';

const contextElement = document.getElementById('goodsIssueContext');
const resource = contextElement?.dataset.resource ?? INVENTORY_RESOURCES.MATERIAL;

export const goodsIssueContext = Object.freeze({
    resource,
    ...createGoodsIssueApplication({ resource })
});
