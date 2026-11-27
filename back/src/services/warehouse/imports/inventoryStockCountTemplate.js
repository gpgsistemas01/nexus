import { createHmac, timingSafeEqual } from 'node:crypto';
import { INVENTORY_STOCK_COUNT_FORMAT } from '../../../constants/inventoryImport.js';
import { INVENTORY_IMPORT_LIMITS } from '../../../shared/constants/inventoryImport.js';
import { InventoryImportError } from '../../../errors/warehouse/inventoryImportError.js';

const maxAge = INVENTORY_IMPORT_LIMITS.stockCountTemplateHours * 60 * 60 * 1000;

// Este prefijo separa la firma de una plantilla de las firmas de tokens de acceso.
const sign = (resource, issuedAt) => createHmac('sha256', process.env.JWT_SECRET_ACCESS)
    .update(`nexus:inventory-stock-count:${INVENTORY_STOCK_COUNT_FORMAT}:${resource}:${issuedAt}`)
    .digest();

export const sealInventoryStockCountTemplate = (resource, issuedAt = Date.now()) =>
    `${issuedAt}.${sign(resource, issuedAt).toString('hex')}`;

export const assertInventoryStockCountTemplateIsCurrent = (resource, seal, receivedAt) => {
    const parts = typeof seal === 'string' && /^([1-9]\d{0,15})\.([a-f0-9]{64})$/.exec(seal);
    if (!parts) throw new InventoryImportError('TEMPLATE_EXPIRED');
    const issuedAt = Number(parts[1]);
    const age = receivedAt - issuedAt;
    if (!Number.isSafeInteger(issuedAt) || age < 0 || age >= maxAge
        || !timingSafeEqual(Buffer.from(parts[2], 'hex'), sign(resource, issuedAt))) {
        throw new InventoryImportError('TEMPLATE_EXPIRED');
    }
};
