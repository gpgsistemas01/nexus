import { UUID_V4_PATTERN } from '@nexus/input-validation';
import { successCodeMessages } from '@nexus/api-success-codes';
import {
    HISTORICAL_DELIVERY_LIMITS as limits,
    HISTORICAL_DELIVERY_REVISION_PATTERN,
} from '@nexus/historical-deliveries';
import { apiClient } from '../../../shared/http/apiClient.js';
import { API_PATHS } from '../../../shared/http/apiPaths.js';
import { isRecord } from '../../../shared/utils/isRecord.js';
import type { IssueResource } from '../issue.js';
import type {
    HistoricalDeliveryCommand,
    HistoricalDeliveryPreview,
    HistoricalDeliveryReceipt,
} from '../historicalDelivery.js';

const invalid = () =>
    new Error(
        'La respuesta de regularización está incompleta. Revisa el estado antes de continuar.',
    );

const isText = (value: unknown) => typeof value === 'string';

const isNumber = (value: unknown) =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0;

export const readHistoricalDeliveryCommand = (value: unknown): HistoricalDeliveryCommand => {
    if (
        !isRecord(value) ||
        !UUID_V4_PATTERN.test(String(value.operationId)) ||
        value.declaredDelivered !== true ||
        !isText(value.reason) ||
        !value.reason.trim() ||
        Array.from(value.reason).length > limits.maxReasonLength ||
        !isText(value.cutoffDate) ||
        !Number.isFinite(Date.parse(value.cutoffDate)) ||
        (value.deliveredAt !== null &&
            (!isText(value.deliveredAt) || !Number.isFinite(Date.parse(value.deliveredAt)))) ||
        !Array.isArray(value.documents) ||
        !value.documents.length ||
        value.documents.length > limits.maxDocuments ||
        value.documents.some(
            (item) =>
                !isRecord(item) ||
                !UUID_V4_PATTERN.test(String(item.id)) ||
                !HISTORICAL_DELIVERY_REVISION_PATTERN.test(String(item.revision)),
        ) ||
        new Set(value.documents.map((item) => item.id)).size !== value.documents.length
    )
        throw invalid();

    return value as unknown as HistoricalDeliveryCommand;
};

export const historicalDeliveryService = {
    async preview(
        resource: IssueResource,
        query: { cutoffDate: string; search: string; page: number },
        signal: AbortSignal,
    ): Promise<HistoricalDeliveryPreview> {
        const params = new URLSearchParams({ ...query, page: String(query.page) });
        const data = await apiClient.request<Record<string, unknown>>(
            `${API_PATHS.historicalDeliveries}/${resource}/preview?${params}`,
            { signal },
        );
        const value = data.preview;
        if (
            !isRecord(value) ||
            value.resource !== resource ||
            value.page !== query.page ||
            !isText(value.cutoffDate) ||
            Date.parse(value.cutoffDate) !== Date.parse(query.cutoffDate) ||
            typeof value.hasMore !== 'boolean' ||
            !Array.isArray(value.documents) ||
            value.documents.length > limits.maxDocuments ||
            new Set(value.documents.map((item) => (isRecord(item) ? item.id : null))).size !==
                value.documents.length ||
            value.documents.some(
                (item) =>
                    !isRecord(item) ||
                    !UUID_V4_PATTERN.test(String(item.id)) ||
                    !HISTORICAL_DELIVERY_REVISION_PATTERN.test(String(item.revision)) ||
                    !['referenceNumber', 'requestDate', 'departmentName', 'projectNumber'].every(
                        (key) => isText(item[key]),
                    ) ||
                    !Array.isArray(item.details) ||
                    !item.details.length ||
                    item.details.some(
                        (detail) =>
                            !isRecord(detail) ||
                            !isText(detail.name) ||
                            !UUID_V4_PATTERN.test(String(detail.id)) ||
                            ![
                                'quantity',
                                'suppliedQuantity',
                                'returnedQuantity',
                                'pendingQuantity',
                            ].every((key) => isNumber(detail[key])),
                    ),
            )
        )
            throw invalid();

        return value as unknown as HistoricalDeliveryPreview;
    },
    async confirm(
        resource: IssueResource,
        command: HistoricalDeliveryCommand,
        signal: AbortSignal,
    ): Promise<HistoricalDeliveryReceipt> {
        const data = await apiClient.request<Record<string, unknown>>(
            `${API_PATHS.historicalDeliveries}/${resource}/confirm`,
            { method: 'POST', data: command, signal },
        );
        const receipt = data.receipt;
        if (
            data.code !== successCodeMessages.HISTORICAL_DELIVERY_COMPLETED ||
            !isRecord(receipt) ||
            receipt.resource !== resource ||
            !UUID_V4_PATTERN.test(String(receipt.id)) ||
            !Array.isArray(receipt.documents) ||
            receipt.documents.length !== command.documents.length ||
            new Set(receipt.documents.map((item) => (isRecord(item) ? item.id : null))).size !==
                receipt.documents.length ||
            receipt.documents.some(
                (item) =>
                    !isRecord(item) ||
                    !isText(item.referenceNumber) ||
                    !command.documents.some((document) => document.id === item.id),
            )
        )
            throw invalid();

        return receipt as unknown as HistoricalDeliveryReceipt;
    },
};
