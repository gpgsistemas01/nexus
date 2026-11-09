import { issueId, issueDetailId } from './issues.js';
import { ids } from './inventory.js';
import type {
  HistoricalDeliveryPreview,
  HistoricalDeliveryCommand,
  HistoricalDeliveryReceipt,
} from '../../src/modules/issues/historicalDelivery.js';

export const historicalPreview = (): HistoricalDeliveryPreview => ({
  resource: 'materials',
  cutoffDate: '2026-10-31T18:00:00.000Z',
  page: 1,
  hasMore: false,
  documents: [
    {
      id: issueId,
      revision: 'a'.repeat(64),
      referenceNumber: 'SMA-HIST-001',
      requestDate: '2026-09-01T18:00:00Z',
      departmentName: 'SISTEMAS',
      projectNumber: '120010',
      details: [
        {
          id: issueDetailId,
          name: 'Lona',
          quantity: 5,
          suppliedQuantity: 2,
          returnedQuantity: 1,
          pendingQuantity: 3,
        },
      ],
    },
  ],
});
export const historicalCommand = (): HistoricalDeliveryCommand => ({
  operationId: ids.offer,
  cutoffDate: historicalPreview().cutoffDate,
  deliveredAt: null,
  reason: 'Entrega física comprobada',
  declaredDelivered: true,
  documents: historicalPreview().documents.map(({ id, revision }) => ({ id, revision })),
});
export const historicalReceipt = (): HistoricalDeliveryReceipt => ({
  id: ids.reason,
  resource: 'materials',
  documents: historicalPreview().documents.map(({ id, referenceNumber }) => ({
    id,
    referenceNumber,
  })),
});
