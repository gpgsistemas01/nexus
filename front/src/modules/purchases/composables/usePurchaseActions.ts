import { onBeforeUnmount, ref, shallowRef } from 'vue';
import { useListEditor } from '../../../shared/composables/useListEditor.js';
import { confirmRemoval, showSuccess } from '../../../shared/ui/feedback.js';
import { usePurchaseDocument } from './usePurchaseDocument.js';
import { purchaseService } from '../services/purchaseService.js';
import { canEditPurchase } from '../purchase.js';
import type { PurchaseResource, PurchaseRow, PurchaseTarget, PurchaseDetail } from '../purchase.js';

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
        savedMessage: 'La compra se guardó correctamente.',
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

    const saved = () => {
        close();
        state.onSaved();
    };

    const detailSaved = async () => {
        correction.value = undefined;
        needsReload.value = true;
        void options.reload();
        void showSuccess('La partida se actualizó correctamente.');
        await reload();
    };

    const correct = (line: PurchaseDetail) => {
        const target = state.editor.value;
        if (
            target?.action === 'view' &&
            canEditPurchase(target.document) &&
            !line.isNew &&
            line.status === 'ACTIVE' &&
            !needsReload.value &&
            !isChanging.value &&
            !reader.isReading.value &&
            !controller.signal.aborted &&
            options.canManage()
        )
            correction.value = line;
    };

    const cancel = async (line: PurchaseDetail) => {
        const target = state.editor.value;
        if (
            target?.action !== 'view' ||
            !canEditPurchase(target.document) ||
            line.isNew ||
            line.status !== 'ACTIVE' ||
            needsReload.value ||
            isChanging.value ||
            !options.canManage() ||
            reader.isReading.value ||
            controller.signal.aborted
        )
            return;

        isChanging.value = true;

        try {
            const confirmed = await confirmRemoval({
                title: 'Cancelar partida',
                description: `${line.name}. Se revertirá la entrada correspondiente a esta partida.`,
                confirmLabel: 'Cancelar partida',
                failureMessage:
                    'La cancelación no se confirmó. Puedes reintentar o cerrar este aviso.',
                signal: controller.signal,
                submit: async () => {
                    try {
                        await purchaseService.changeDetail(
                            options.resource,
                            target.document.id,
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
            if (confirmed && !controller.signal.aborted) await detailSaved();
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
