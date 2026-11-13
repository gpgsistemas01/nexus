import type { IssueResource } from './issue.js';

export interface HistoricalDeliveryCandidate {
    id: string;
    revision: string;
    referenceNumber: string;
    requestDate: string;
    departmentName: string;
    projectNumber: string;
    details: {
        id: string;
        name: string;
        quantity: number;
        suppliedQuantity: number;
        returnedQuantity: number;
        pendingQuantity: number;
    }[];
}
export interface HistoricalDeliveryPreview {
    resource: IssueResource;
    cutoffDate: string;
    page: number;
    total: number;
    hasMore: boolean;
    documents: HistoricalDeliveryCandidate[];
}
export interface HistoricalDeliveryCommand {
    operationId: string;
    cutoffDate: string;
    deliveredAt: string | null;
    reason: string;
    declaredDelivered: true;
    documents: { id: string; revision: string }[];
}
export interface HistoricalDeliveryReceipt {
    id: string;
    resource: IssueResource;
    documents: { id: string; referenceNumber: string }[];
}
export interface HistoricalDeliveryEvidence {
    id: string;
    reason: string;
    cutoffDate: string;
    deliveredAt: string | null;
    createdAt: string;
    user: { name: string } | null;
}
