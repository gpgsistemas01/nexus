export const getReadOnlyFieldProps = (readOnly = false) => ({
    readonly: readOnly,
    tabindex: readOnly ? -1 : undefined,
});
