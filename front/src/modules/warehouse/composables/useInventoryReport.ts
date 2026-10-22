import { useFileExport } from '../../../shared/composables/useFileExport.js';
import { inventoryReportService } from '../services/inventoryReportService.js';
import type { InventoryQuery, InventoryResource } from '../inventory.js';

export const useInventoryReport = (options: {
    resource: InventoryResource;
    query: InventoryQuery;
    canExport: boolean;
    onUnauthorized: () => void;
}) =>
    useFileExport<string>({
        canExport: () => options.canExport,
        filename: `inventario_${options.resource}.xlsx`,
        request: (scope, signal) =>
            inventoryReportService.export(options.resource, { ...options.query }, scope, signal),
        onDenied: (status) => {
            if (status === 401) options.onUnauthorized();
        },
    });
