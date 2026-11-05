import { useReportScope } from '../../../shared/composables/useReportScope.js';
import { inventoryReportService } from '../services/inventoryReportService.js';
import type { InventoryQuery, InventoryResource } from '../inventory.js';

export const useInventoryReport = (options: {
    resource: InventoryResource;
    query: InventoryQuery;
    canExport: boolean;
    onUnauthorized: () => void;
}) =>
    useReportScope({
        kind: 'inventory',
        canExport: () => options.canExport,
        filename:
            options.resource === 'wastes'
                ? 'reporte_mermas'
                : `reporte_inventario_${options.resource === 'consumables' ? 'consumibles' : 'materiales'}`,
        request: (scope, signal) =>
            inventoryReportService.export(
                options.resource,
                { ...options.query },
                scope.inventoryScope ?? 'activeOrStock',
                signal,
            ),
        onDenied: (status) => {
            if (status === 401) options.onUnauthorized();
        },
    });
