export const configureReturnModal = ({
    modalElement,
    form,
    buildModalTitle,
    referenceNumber,
    entityName,
    action = 'Registrar devolución de',
    submitText = 'Devolver',
    toggleContainerElements,
    setFormReadOnly = null,
    readOnlyFields = [],
    toggleDisabledElement = null,
    disabledElement = null,
    observationsElement = null
}) => {
    modalElement.querySelector('#modalTitle').textContent = buildModalTitle({
        action,
        entityName,
        referenceNumber
    });
    form.querySelector('#submitBtn').textContent = submitText;

    setFormReadOnly?.({ form, isReadOnly: false });

    if (readOnlyFields.length) {
        setFormReadOnly?.({
            form,
            fields: readOnlyFields,
            isReadOnly: true
        });
    }

    if (toggleDisabledElement && disabledElement) {
        toggleDisabledElement({
            element: disabledElement,
            isDisabled: true
        });
    }

    toggleContainerElements({ selector: '.add-product-container', root: modalElement });

    if (observationsElement) observationsElement.disabled = true;
};
