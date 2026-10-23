import { material, waste, ids, user } from './inventory.js';
import { personData, clientData } from './records.js';
export const issueId = '99999999-9999-4999-8999-999999999999';
export const issueDetailId = 'aaaaaaaa-1111-4111-8111-111111111111';
export const departmentId = 'bbbbbbbb-1111-4111-8111-111111111111';
export const issuePermissions = [
  ...user.permissions,
  'goods:issues-page-view',
  'goods:issues-manage',
  'goods:issue-details-manage',
  'waste:issues-page-view',
  'waste:issues-manage',
  'waste:issues-supply',
  'clients:read',
  'clients:create',
  'persons:read',
  'departments:read',
  'fulfillment:statuses-read',
];
export const issueDetail = {
  id: issueDetailId,
  materialId: ids.material,
  supplierId: ids.supplier,
  materialName: 'Lona',
  material: { ...material.material, type: 'MATERIAL' },
  quantity: '2',
  convertedQuantity: '200',
  suppliedQuantity: '0',
  returnedQuantity: '0',
  projectConvertedQuantity: null as string | null,
  maxUnitCost: '100',
  isSupplied: false,
  fulfillmentStatus: { name: 'Pendiente' },
};
export const issue = {
  id: issueId,
  type: 'MATERIAL',
  referenceNumber: 'SAL-001',
  requestDate: '2026-10-22T18:30:00.000Z',
  requesterId: personData.id,
  requesterName: personData.fullName,
  advisorId: personData.id,
  advisorName: personData.fullName,
  clientId: clientData.id,
  clientName: clientData.name,
  departmentId,
  departmentName: 'SISTEMAS',
  projectNumber: '120010',
  observations: 'Captura de solicitud',
  status: { name: 'Aprobada' },
  fulfillmentStatus: { name: 'Pendiente' },
  details: [issueDetail],
};
export const issueFor = (resource: 'materials' | 'consumables' | 'wastes') => ({
  ...structuredClone(issue),
  type: resource === 'consumables' ? 'CONSUMABLE' : 'MATERIAL',
  details:
    resource === 'wastes'
      ? [
          {
            ...issueDetail,
            wasteId: waste.id,
            materialName: waste.name,
            waste,
            material: undefined,
          },
        ]
      : [
          {
            ...issueDetail,
            material: {
              ...issueDetail.material,
              type: resource === 'consumables' ? 'CONSUMABLE' : 'MATERIAL',
            },
          },
        ],
});
