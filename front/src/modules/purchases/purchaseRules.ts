import { GOODS_RECEIPT_STATUS_NAMES } from '@nexus/purchase-statuses';
import type { PurchaseRow } from './purchase.js';

const LEGACY_OPEN_STATUS = 'Abierta';

export const canEditPurchase = (row: PurchaseRow) =>
    row.status === GOODS_RECEIPT_STATUS_NAMES.CONFIRMED || row.status === LEGACY_OPEN_STATUS;
