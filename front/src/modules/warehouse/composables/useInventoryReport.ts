import { onBeforeUnmount, ref } from 'vue';
import { ApiError } from '../../../shared/http/apiError.js';
import { inventoryReportService } from '../services/inventoryReportService.js';
import type { InventoryQuery, InventoryResource } from '../inventory.js';

export const useInventoryReport = (options: {
    resource: InventoryResource;
    query: InventoryQuery;
    canExport: boolean;
    onUnauthorized: () => void;
}) => {
    const { resource, query, canExport, onUnauthorized } = options;
    const isExporting = ref(false);
    const exportError = ref('');
    let controller: AbortController | null = null;

    const exportReport = async (scope: string) => {
        if (!canExport || isExporting.value) return;

        controller = new AbortController();
        isExporting.value = true;
        exportError.value = '';

        try {
            const file = await inventoryReportService.export(
                resource,
                { ...query },
                scope,
                controller.signal,
            );
            if (controller.signal.aborted) return;

            const url = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = url;
            link.download = `inventario_${resource}.xlsx`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (cause) {
            if (controller.signal.aborted) return;

            exportError.value = cause instanceof Error ? cause.message : 'No se pudo exportar.';
            if (cause instanceof ApiError && cause.status === 401) onUnauthorized();
        } finally {
            isExporting.value = false;
        }
    };

    onBeforeUnmount(() => controller?.abort());
    return { isExporting, exportError, exportReport };
};
