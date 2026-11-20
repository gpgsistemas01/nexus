import { inventoryOfferSections } from './inventoryOfferSections.js';
import { purchaseArticleSections } from './purchaseArticleSections.js';
import { wasteFormSections } from './wasteFormSections.js';
import type { EditorTarget, InventoryResource } from './inventory.js';
import type { InventoryFormSection } from './inventoryFormTypes.js';
import type { previewWaste } from './formModel.js';
import type { LookupItem } from '../../shared/lookup.js';

export const inventorySections = (
    resource: InventoryResource,
    target: EditorTarget,
    preview: ReturnType<typeof previewWaste>,
    options: {
        template?: LookupItem;
        article?: LookupItem;
        initialStock?: string;
        presentationName?: string;
        usesMeasurements: boolean;
        isPerPiece?: boolean;
        hasSupplier: boolean;
        creationContext?: 'goodsReceipt';
        supplier?: LookupItem;
    },
): InventoryFormSection[] => {
    if (target.action === 'delete') return [];

    if (resource === 'wastes') return wasteFormSections(target, preview, options);

    if (target.action === 'create' && options.creationContext === 'goodsReceipt')
        return purchaseArticleSections(resource, options);

    if (target.action === 'create' || target.row)
        return inventoryOfferSections(resource, target, options);

    return [];
};
