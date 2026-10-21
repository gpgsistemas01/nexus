import { PERMISSIONS } from '@nexus/permissions';
import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef } from 'vue';
import type { SessionUser } from '../../auth/session.js';
import { ApiError } from '../../../shared/services/apiClient.js';
import { INVENTORY_CONFIG } from '../inventory.js';
import type {
    EditorTarget,
    InventoryQuery,
    InventoryResource,
    InventoryRow,
} from '../inventory.js';
import { inventoryService } from '../services/inventoryService.js';
import { useRemoteOptions } from './useRemoteOptions.js';

export const useInventory = (
    resource: InventoryResource,
    user: SessionUser,
    onUnauthorized: () => void,
) => {
    const config = INVENTORY_CONFIG[resource];
    const permits = (permission: string) => user.permissions.includes(permission);
    const permissions = {
        canRead: permits(config.read),
        canWrite: permits(config.write),
        canAdjust: permits(config.adjust),
        canAdd: resource === 'wastes' && permits(PERMISSIONS.WASTES_ADD_STOCK),
        canReadCosts: permits(PERMISSIONS.INVENTORY_COSTS_READ),
        canReadState: permits(PERMISSIONS.CATALOGS_MANAGE),
        canExport: permits(PERMISSIONS.WAREHOUSE_REPORTS_READ),
    };
    const query = reactive<InventoryQuery>({
        search: '',
        supplierId: '',
        page: 1,
        length: 10,
        direction: 'asc',
    });
    const rows = ref<InventoryRow[]>([]);
    const total = ref(0);
    const isLoading = ref(false);
    const isExporting = ref(false);
    const error = ref('');
    const notice = ref('');
    const editor = shallowRef<EditorTarget | null>(null);
    const suppliers = useRemoteOptions(
        'suppliers',
        computed(() => permits(PERMISSIONS.SUPPLIERS_READ)),
    );
    let controller: AbortController | null = null;
    let exportController: AbortController | null = null;
    let sequence = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const load = async () => {
        if (!permissions.canRead) return;
        const requestId = ++sequence;
        controller?.abort();
        controller = new AbortController();
        isLoading.value = true;
        error.value = '';
        try {
            const result = await inventoryService.list(resource, { ...query }, controller.signal);
            if (requestId !== sequence) return;
            rows.value = result.data;
            total.value = result.recordsFiltered;
            if (query.page > 1 && !result.data.length) {
                query.page = Math.max(1, query.page - 1);
                await load();
            }
        } catch (cause) {
            if (requestId !== sequence || controller.signal.aborted) return;
            error.value =
                cause instanceof Error ? cause.message : 'No se pudo cargar el inventario.';
            if (cause instanceof ApiError && cause.status === 401) onUnauthorized();
        } finally {
            if (requestId === sequence) isLoading.value = false;
        }
    };
    const applyQuery = (changes: Partial<InventoryQuery>) => {
        Object.assign(query, changes, { page: changes.page ?? 1 });
        void load();
    };
    const openEditor = (target: EditorTarget) => {
        const allowed =
            target.action === 'stock'
                ? permissions.canAdjust
                : target.action === 'add-stock'
                  ? permissions.canAdd
                  : permissions.canWrite;
        if (
            !allowed ||
            (target.action === 'delete' && (!target.row?.canDelete || resource === 'wastes'))
        )
            return;
        editor.value = target;
    };
    const onSaved = () => {
        editor.value = null;
        notice.value = 'La operación se guardó correctamente.';
        void load();
    };
    const exportReport = async (scope: string) => {
        if (!permissions.canExport || isExporting.value) return;
        exportController = new AbortController();
        isExporting.value = true;
        try {
            const blob = await inventoryService.export(
                resource,
                { ...query },
                scope,
                exportController.signal,
            );
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `inventario_${resource}.xlsx`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (cause) {
            if (!exportController.signal.aborted)
                error.value = cause instanceof Error ? cause.message : 'No se pudo exportar.';
        } finally {
            isExporting.value = false;
        }
    };
    const refreshVisible = () => {
        if (document.visibilityState === 'visible' && !editor.value && !isLoading.value)
            void load();
    };
    onMounted(() => {
        void load();
        window.addEventListener('focus', refreshVisible);
        interval = setInterval(refreshVisible, 30_000);
    });
    onBeforeUnmount(() => {
        ++sequence;
        controller?.abort();
        exportController?.abort();
        clearInterval(interval);
        window.removeEventListener('focus', refreshVisible);
    });
    return {
        config,
        permissions,
        query,
        rows,
        total,
        isLoading,
        isExporting,
        error,
        notice,
        editor,
        suppliers,
        load,
        applyQuery,
        openEditor,
        onSaved,
        exportReport,
    };
};
