import { ref } from 'vue';
import { useDocumentRead } from '../../../shared/composables/useDocumentRead.js';
import { useListEditor } from '../../../shared/composables/useListEditor.js';
import { showSuccess } from '../../../shared/ui/feedback.js';
import { issueService } from '../services/issueService.js';
import { canSupplyIssue, canReturnIssue, resolveIssueEditMode } from '../issueRules.js';
import type { IssueResource, IssueOpenMode, IssueRow, IssueTarget } from '../issue.js';
import type { MutationConfirmation } from '../../../shared/http/recordContract.js';

export const useIssueActions = (options: {
    resource: IssueResource;
    canManage: () => boolean;
    canSupply: () => boolean;
    canRead: () => boolean;
    reload: () => unknown;
    onError: (cause: unknown) => void;
}) => {
    const reader = useDocumentRead({
        request: (id, signal) => issueService.get(options.resource, id, signal),
        onError: options.onError,
        errorMessage: 'No se pudo abrir la salida.',
    });
    const editorKey = ref(0);
    const editorState = useListEditor<IssueTarget>({
        canOpen: () => options.canRead(),
        reload: options.reload,
    });
    type ReadTarget = { row: IssueRow; mode: IssueOpenMode; afterReturn?: boolean };
    let lastRequestedEditor: ReadTarget | undefined;

    const close = () => {
        reader.close();
        editorState.closeEditor();
        lastRequestedEditor = undefined;
    };

    const loadEditor = async (target: ReadTarget) => {
        if (!options.canRead()) return;

        const { row, mode, afterReturn } = target;
        lastRequestedEditor = target;
        const document = await reader.load(row.id);
        if (!document) return;

        const resolved =
            afterReturn && (!canReturnIssue(document) || !options.canSupply())
                ? 'view'
                : mode === 'edit'
                  ? options.canManage()
                      ? resolveIssueEditMode(document)
                      : 'view'
                  : mode;

        if (
            (resolved === 'supply' && (!options.canSupply() || !canSupplyIssue(document))) ||
            (resolved === 'return' && (!options.canSupply() || !canReturnIssue(document)))
        ) {
            reader.readError.value = 'La salida cambió de estado. Actualiza el listado.';
            reader.canRetry.value = false;
            return;
        }

        ++editorKey.value;
        editorState.openEditor({ mode: resolved, document });
    };

    const open = (row: IssueRow, mode: IssueOpenMode) => loadEditor({ row, mode });

    const create = () => {
        if (!options.canManage()) return;

        close();
        ++editorKey.value;
        editorState.openEditor({ mode: 'create' });
    };

    const retry = () => (lastRequestedEditor ? loadEditor(lastRequestedEditor) : undefined);

    const handleSaved = (result: MutationConfirmation) => {
        close();
        void options.reload();
        void showSuccess(result.message);
    };

    const handleDetailSaved = async (result: MutationConfirmation) => {
        const document = editorState.editor.value?.document;
        if (!document) return;

        editorState.closeEditor();
        void options.reload();
        void showSuccess(result.message);
        await loadEditor({ row: document, mode: 'return', afterReturn: true });
    };

    return {
        ...reader,
        editor: editorState.editor,
        editorKey,
        open,
        create,
        close,
        cancelRead: reader.close,
        retry,
        handleSaved,
        handleDetailSaved,
    };
};
