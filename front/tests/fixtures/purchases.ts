import { ids, material, user } from './inventory.js';
import { personData } from './records.js';

export const purchaseId = '99999999-9999-4999-8999-999999999999';
export const detailId = 'aaaaaaaa-1111-4111-8111-111111111111';
export const purchasePermissions = [
  ...user.permissions,
  'goods:receipts-page-view',
  'goods:receipts-manage',
  'persons:read',
  'suppliers:manage',
];
export const purchaseItem = {
  ...material,
  material: { ...material.material, type: 'MATERIAL' },
};
export const purchaseDetail = {
  id: detailId,
  materialId: ids.material,
  materialName: 'Lona',
  material: purchaseItem.material,
  quantity: '2',
  convertedQuantity: '200',
  costPerUnitType: '100',
  conversionUnitCost: '1',
  netPurchaseAmount: '200',
  grossPurchaseAmount: '232',
  status: 'ACTIVE',
};
export const purchase = {
  id: purchaseId,
  referenceNumber: 'COM-001',
  receptionDate: '2026-10-22T18:30:00.000Z',
  type: 'MATERIAL',
  supplierId: ids.supplier,
  supplierName: 'Proveedor Central',
  receivedById: personData.id,
  receivedByName: personData.fullName,
  isInvoiced: true,
  invoice: 'FAC-001',
  status: { name: 'Confirmada' },
  totalQuantity: '2',
  totalNetPurchaseAmount: '200',
  totalGrossPurchaseAmount: '232',
  observations: 'Conservar esta observación',
  details: [purchaseDetail],
};
