import { onBeforeUnmount, ref } from 'vue';
import { ApiError } from '../http/apiError.js';

export const useFileExport = <Scope>(options: {
    canExport: () => boolean;
    request: (scope: Scope, signal: AbortSignal) => Promise<Blob>;
    filename: string;
    onDenied: (status: number) => void;
}) => {
    const isExporting = ref(false);
    const exportError = ref('');
    let controller: AbortController | undefined;
    let isDisposed = false;

    const exportReport = async (scope: Scope) => {
        if (!options.canExport() || isExporting.value || isDisposed) return;

        const current = new AbortController();
        controller = current;
        isExporting.value = true;
        exportError.value = '';

        try {
            const file = await options.request(scope, current.signal);
            if (current.signal.aborted) return;

            const url = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = url;
            link.download = options.filename;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (cause) {
            if (current.signal.aborted) return;

            exportError.value = cause instanceof Error ? cause.message : 'No se pudo exportar.';
            if (cause instanceof ApiError && [401, 403].includes(cause.status))
                options.onDenied(cause.status);
        } finally {
            isExporting.value = false;
        }
    };

    onBeforeUnmount(() => {
        isDisposed = true;
        controller?.abort();
    });
    return { isExporting, exportError, exportReport };
};
