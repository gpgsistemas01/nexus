import type { Ref } from 'vue';

interface InteractiveForm<Field extends string, Value> {
    values: Record<Field, Value>;
    submitCount: Ref<number>;
    setFieldValue: (field: Field, value: Value, shouldValidate: boolean) => void;
    setFieldError: (field: Field, message: undefined) => void;
    validateField: (field: Field) => Promise<unknown>;
}

export const useFormInteraction = <Field extends string, Value>(
    form: InteractiveForm<Field, Value>,
    options: { isDisabled: () => boolean; onChange: () => void },
) => {
    const editedFields = new Set<Field>();

    const update = (field: Field, value: Value) => {
        if (options.isDisabled() || form.values[field] === value) return;

        editedFields.add(field);
        form.setFieldValue(field, value, false);
        form.setFieldError(field, undefined);
        options.onChange();
    };

    const blur = (field: Field) => {
        // El foco inicial y los valores cargados por código no son captura del usuario.
        if (editedFields.has(field) || form.submitCount.value > 0) {
            return form.validateField(field);
        }
    };

    return { update, blur };
};
