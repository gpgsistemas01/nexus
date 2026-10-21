import { PERMISSIONS } from '@nexus/permissions';
import { computed, shallowRef } from 'vue';
import { showSuccess } from '../../../shared/ui/feedback.js';
import type { SessionUser } from '../../auth/session.js';
import { INVENTORY_CONFIG } from '../inventory.js';
import type { EditorTarget, InventoryResource } from '../inventory.js';
import { useInventoryList } from './useInventoryList.js';
import { useInventoryReport } from './useInventoryReport.js';
import { useInventoryRemoval } from './useInventoryRemoval.js';

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
    const editor = shallowRef<EditorTarget | null>(null);
    const removal = useInventoryRemoval({ resource, onSaved: () => onSaved(), onUnauthorized });
    const list = useInventoryList({
        resource,
        canRead: permissions.canRead,
        canReadSuppliers: permits(PERMISSIONS.SUPPLIERS_READ),
        isPaused: computed(() => editor.value !== null || removal.isConfirming.value),
        onUnauthorized,
    });
    const report = useInventoryReport({
        resource,
        query: list.query,
        canExport: permissions.canExport,
        onUnauthorized,
    });
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
        if (target.action === 'delete') void removal.remove(target.row!);
        else editor.value = target;
    };
    const onSaved = () => {
        editor.value = null;
        void showSuccess('La operación se guardó correctamente.');
        void list.load();
    };
    return { config, permissions, editor, ...list, ...report, openEditor, onSaved };
};
