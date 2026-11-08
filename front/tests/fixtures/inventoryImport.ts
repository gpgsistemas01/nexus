import type { InventoryImportBatch } from '../../src/modules/warehouse/inventoryImport.js';
import { ids } from './inventory.js';

export const inventoryImportDraft = (): InventoryImportBatch => ({
  id: ids.material,
  version: 0,
  resource: 'materials',
  mode: 'create',
  status: 'DRAFT',
  filename: 'materiales.xlsx',
  expiresAt: '2026-11-07T23:00:00Z',
  result: null,
  preview: {
    summary: { total: 1, creates: 1, updates: 0, unchanged: 0, errors: 0 },
    rows: [
      {
        row: 2,
        id: null,
        name: 'Lona',
        action: 'create',
        before: null,
        after: { name: 'Lona', minStock: 1, maxUnitCost: 10, isActive: true },
        details: { supplier: 'Proveedor Central', initialQuantity: 2 },
        errors: [],
        warnings: [],
      },
    ],
  },
});
