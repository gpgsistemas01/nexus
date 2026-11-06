import type { PurchaseRow } from './purchase.js';

export const canEditPurchase = (row: PurchaseRow) =>
    row.status === 'Confirmada' || row.status === 'Abierta';
