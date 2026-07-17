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

    if (toggleDisabledElement && disabledElement) {
        toggleDisabledElement({
            element: disabledElement,
            isDisabled: true
        });
    }

    toggleContainerElements({ selector: '.add-product-container', root: modalElement });

    if (observationsElement) {
        if (toggleDisabledElement) {
            toggleDisabledElement({
                element: observationsElement,
                isDisabled: true
            });
        } else {
            observationsElement.disabled = true;
        }
    }
};
