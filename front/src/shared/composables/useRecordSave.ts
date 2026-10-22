import { onBeforeUnmount, ref } from 'vue';
import { ApiError } from '../http/apiError.js';

export const useRecordSave = (options: {
    setErrors: (errors: Record<string, string>) => void;
    onSaved: () => void;
    onDenied: (status: number) => void;
}) => {
    const message = ref('');
    const isSubmitting = ref(false);
    const isConflicted = ref(false);
    const controller = new AbortController();

    const execute = async (operation: (signal: AbortSignal) => Promise<unknown>) => {
        if (isSubmitting.value || isConflicted.value || controller.signal.aborted) return;

        isSubmitting.value = true;
        message.value = '';

        try {
            await operation(controller.signal);
        } catch (cause) {
            if (controller.signal.aborted) return;

            message.value = cause instanceof Error ? cause.message : 'No se pudo guardar.';

            if (cause instanceof ApiError) {
                options.setErrors(cause.fieldErrors);
                isConflicted.value = cause.code === 'RECORD_VERSION_CONFLICT';
                if ([401, 403].includes(cause.status)) options.onDenied(cause.status);
            }

            return;
        } finally {
            isSubmitting.value = false;
        }

        if (!controller.signal.aborted) options.onSaved();
    };

    onBeforeUnmount(() => controller.abort());
    return {
        message,
        isSubmitting,
        isConflicted,
        execute,
        isDisposed: () => controller.signal.aborted,
    };
};
