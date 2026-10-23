import { onBeforeUnmount, ref, shallowRef } from 'vue';

export const useDocumentRead = <Document>(options: {
    request: (id: string, signal: AbortSignal) => Promise<Document>;
    onError: (cause: unknown) => void;
    errorMessage: string;
}) => {
    const document = shallowRef<Document>();
    const isReading = ref(false);
    const readError = ref('');
    let controller: AbortController | undefined;
    let requestedId = '';
    let sequence = 0;
    let isDisposed = false;

    const load = async (id = requestedId) => {
        if (isDisposed || !id) return;

        requestedId = id;
        const attempt = ++sequence;
        controller?.abort();
        const current = new AbortController();
        controller = current;
        isReading.value = true;
        readError.value = '';

        try {
            const result = await options.request(id, current.signal);
            if (attempt !== sequence || current.signal.aborted) return;

            document.value = result;
            return result;
        } catch (cause) {
            if (attempt !== sequence || current.signal.aborted) return;

            readError.value = cause instanceof Error ? cause.message : options.errorMessage;
            options.onError(cause);
        } finally {
            if (attempt === sequence) isReading.value = false;
        }
    };

    const close = () => {
        ++sequence;
        controller?.abort();
        isReading.value = false;
        document.value = undefined;
        readError.value = '';
    };

    onBeforeUnmount(() => {
        isDisposed = true;
        close();
    });
    return { document, isReading, readError, load, close };
};
