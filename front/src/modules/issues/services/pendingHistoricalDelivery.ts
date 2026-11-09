import { readHistoricalDeliveryCommand } from './historicalDeliveryService.js';
import type { IssueResource } from '../issue.js';
import type { HistoricalDeliveryCommand } from '../historicalDelivery.js';

export const pendingHistoricalDelivery = (
    userId: string,
    resource: IssueResource,
    storage: Storage = localStorage,
) => {
    const key = `nexus:historical-delivery:${userId}:${resource}`;

    const read = (): HistoricalDeliveryCommand | null => {
        const raw = storage.getItem(key);
        return raw ? readHistoricalDeliveryCommand(JSON.parse(raw)) : null;
    };

    const save = (value: HistoricalDeliveryCommand) => {
        const command = readHistoricalDeliveryCommand(value);
        storage.setItem(
            key,
            JSON.stringify({
                operationId: command.operationId,
                cutoffDate: command.cutoffDate,
                deliveredAt: command.deliveredAt,
                reason: command.reason,
                declaredDelivered: command.declaredDelivered,
                documents: command.documents.map(({ id, revision }) => ({ id, revision })),
            }),
        );
    };

    return { read, save, clear: () => storage.removeItem(key) };
};
