import { computed } from 'vue';
import type { Ref } from 'vue';
import { useFormInteraction } from './useFormInteraction.js';
import type { InteractiveForm } from './useFormInteraction.js';
import { useRecordSave } from './useRecordSave.js';

type RecordForm<Values extends object> = InteractiveForm<
    keyof Values & string,
    Values[keyof Values]
> & {
    values: Values;
    isSubmitting: Ref<boolean>;
    setErrors: (errors: Record<string, string>) => void;
    handleSubmit: (handler: (values: Values) => Promise<void>) => () => Promise<unknown>;
};

export const useRecordForm = <Values extends object, Result = unknown>(
    form: RecordForm<Values>,
    options: {
        onSaved: (result: Result) => void;
        onDenied: (status: number) => void;
        isReadOnly?: () => boolean;
        setErrors?: (errors: Record<string, string>) => void;
        errorMessage?: string;
    },
) => {
    const save = useRecordSave({
        fields: Object.keys(form.values),
        onSaved: options.onSaved,
        onDenied: options.onDenied,
        setErrors: options.setErrors ?? form.setErrors,
        errorMessage: options.errorMessage,
    });
    const isSubmitting = computed(() => form.isSubmitting.value || save.isSubmitting.value);

    const isDisabled = () =>
        options.isReadOnly?.() === true ||
        isSubmitting.value ||
        save.isConflicted.value ||
        save.isDisposed();

    const interaction = useFormInteraction<keyof Values & string, Values[keyof Values]>(form, {
        isDisabled,
        onChange: () => {
            save.message.value = '';
        },
    });

    const handleSubmit = (operation: (values: Values, signal: AbortSignal) => Promise<Result>) => {
        const validated = form.handleSubmit((values) =>
            save.execute((signal) => operation(values, signal)),
        );

        return () => {
            if (!isDisabled()) return validated();
        };
    };

    return { ...save, ...interaction, isSubmitting, isDisabled, handleSubmit };
};
