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
    let lastRequestedEditor: { row: IssueRow; mode: IssueOpenMode } | undefined;

    const close = () => {
        reader.close();
        editorState.closeEditor();
        lastRequestedEditor = undefined;
    };

    const open = async (row: IssueRow, mode: IssueOpenMode) => {
        if (!options.canRead()) return;

        lastRequestedEditor = { row, mode };
        const document = await reader.load(row.id);
        if (!document) return;

        const resolved =
            mode === 'edit'
                ? options.canManage()
                    ? resolveIssueEditMode(document)
                    : 'view'
                : mode;

        if (
            (resolved === 'supply' && (!options.canSupply() || !canSupplyIssue(document))) ||
            (resolved === 'return' && (!options.canSupply() || !canReturnIssue(document)))
        ) {
            reader.readError.value = 'La salida cambió de estado. Actualiza el listado.';
            return;
        }

        ++editorKey.value;
        editorState.openEditor({ mode: resolved, document });
    };

    const create = () => {
        if (!options.canManage()) return;

        close();
        ++editorKey.value;
        editorState.openEditor({ mode: 'create' });
    };

    const retry = () =>
        lastRequestedEditor ? open(lastRequestedEditor.row, lastRequestedEditor.mode) : undefined;

    const handleSaved = (result: MutationConfirmation) => {
        close();
        void options.reload();
        void showSuccess(result.message);
    };

    return {
        ...reader,
        editor: editorState.editor,
        editorKey,
        open,
        create,
        close,
        retry,
        handleSaved,
    };
};
