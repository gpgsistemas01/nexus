import { onBeforeUnmount, ref, shallowRef } from 'vue';
import { useListEditor } from '../../../shared/composables/useListEditor.js';
import { confirmAction, showSuccess } from '../../../shared/ui/feedback.js';
import { usePurchaseDocument } from './usePurchaseDocument.js';
import { purchaseService } from '../services/purchaseService.js';
import { canEditPurchase } from '../purchase.js';
import type { PurchaseResource, PurchaseRow, PurchaseTarget, PurchaseDetail } from '../purchase.js';
import type { MutationConfirmation } from '../../../shared/http/recordContract.js';

export const usePurchaseActions = (options: {
    resource: PurchaseResource;
    canManage: () => boolean;
    reload: () => unknown;
    onError: (cause: unknown) => void;
}) => {
    const reader = usePurchaseDocument(options.resource, options.onError);
    const editorKey = ref(0);
    const correction = shallowRef<PurchaseDetail>();
    const isChanging = ref(false);
    const needsReload = ref(false);
    const controller = new AbortController();
    let lastOpen: { row: PurchaseRow; action: 'view' | 'edit' } | undefined;
    const state = useListEditor<PurchaseTarget>({
        canOpen: () => options.canManage(),
        reload: options.reload,
    });

    const close = () => {
        if (isChanging.value) return;

        reader.close();
        lastOpen = undefined;
        state.closeEditor();
        correction.value = undefined;
        needsReload.value = false;
    };

    const create = () => {
        if (!options.canManage() || controller.signal.aborted || isChanging.value) return;

        reader.close();
        lastOpen = undefined;
        ++editorKey.value;
        state.openEditor({ action: 'create' });
    };

    const open = async (row: PurchaseRow, action: 'view' | 'edit') => {
        if (!options.canManage() || controller.signal.aborted || isChanging.value) return;

        lastOpen = { row, action };
        const document = await reader.load(row.id);
        if (!document) return;

        ++editorKey.value;
        state.openEditor({
            action: action === 'edit' && canEditPurchase(document) ? 'edit' : 'view',
            document,
        });
        needsReload.value = false;
    };

    const reload = () => {
        const target = state.editor.value;
        if (target && target.action !== 'create') return open(target.document, target.action);
    };

    const saved = (confirmation: MutationConfirmation) => {
        close();
        state.onSaved();
        void showSuccess(confirmation.message);
    };

    const detailSaved = async (confirmation: MutationConfirmation) => {
        correction.value = undefined;
        needsReload.value = true;
        void options.reload();
        void showSuccess(confirmation.message);
        await reload();
    };

    const editableDetailDocument = (line: PurchaseDetail) => {
        const target = state.editor.value;
        if (
            target?.action !== 'view' ||
            !canEditPurchase(target.document) ||
            line.isNew ||
            line.status !== 'ACTIVE' ||
            needsReload.value ||
            isChanging.value ||
            reader.isReading.value ||
            controller.signal.aborted ||
            !options.canManage()
        )
            return;

        return target.document;
    };

    const correct = (line: PurchaseDetail) => {
        if (editableDetailDocument(line)) correction.value = line;
    };

    const cancel = async (line: PurchaseDetail) => {
        const document = editableDetailDocument(line);
        if (!document) return;

        isChanging.value = true;
        let confirmation: MutationConfirmation | undefined;

        try {
            const confirmed = await confirmAction({
                title: '¿Cancelar detalle de compra?',
                description:
                    'Se marcará el detalle como cancelado, se descontará de los totales y se generará el ajuste de inventario correspondiente.',
                confirmLabel: 'Cancelar detalle',
                failureMessage:
                    'La cancelación no se confirmó. Puedes reintentar o cerrar este aviso.',
                signal: controller.signal,
                submit: async () => {
                    try {
                        confirmation = await purchaseService.changeDetail(
                            options.resource,
                            document.id,
                            line.id,
                            'cancel',
                            controller.signal,
                        );
                    } catch (cause) {
                        options.onError(cause);
                        throw cause;
                    }
                },
            });
            isChanging.value = false;
            if (confirmed && confirmation && !controller.signal.aborted)
                await detailSaved(confirmation);
        } finally {
            isChanging.value = false;
        }
    };

    onBeforeUnmount(() => controller.abort());

    const retry = () => (lastOpen ? open(lastOpen.row, lastOpen.action) : undefined);

    return {
        ...reader,
        editor: state.editor,
        editorKey,
        correction,
        isChanging,
        needsReload,
        open,
        create,
        close,
        reload,
        retry,
        saved,
        correct,
        cancel,
        detailSaved,
    };
};
