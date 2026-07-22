import { setDateTimePickerValue } from "../plugins/flatpickr/dateTimePicker.js";
import { toggleContainerElements, toggleDisabledElement } from "../utils/formUtils.js";
import { FORM_MODES } from "../constants/formModes.js";

export { setTotals, updateTotals } from "./totalsSummaryUI.js";

const getFirstInvalidControl = (form) => {

    const invalidElement = form.querySelector('.is-invalid, [aria-invalid="true"]');

    if (invalidElement) return invalidElement;

    const visibleError = Array.from(form.querySelectorAll('[data-error-for]'))
        .find(feedback => feedback.textContent.trim() && !feedback.classList.contains('d-none'));

    if (!visibleError) return null;

    const fieldName = visibleError.dataset.errorFor;
    const field = fieldName ? form.querySelector(`[name="${ fieldName }"]`) : null;

    return field || visibleError;
};

const getScrollTarget = (element) => {

    if (!element) return null;

    if (element.tagName === 'SELECT' && typeof window !== 'undefined' && window.jQuery && window.jQuery(element).hasClass('select2-hidden-accessible')) {

        const select2Container = window.jQuery(element).next('.select2-container').get(0);

        if (select2Container) return select2Container;
    }

    return element.closest('[class*="col-"]') || element.closest('.form-outline') || element;
};

export const scrollToFirstFormError = (form) => {

    const invalidElement = getFirstInvalidControl(form);
    const scrollTarget = getScrollTarget(invalidElement);

    if (!scrollTarget) return;

    scrollTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
    });

    if (typeof invalidElement.focus === 'function' && !invalidElement.disabled) {

        invalidElement.focus({ preventScroll: true });
    }
};

export const resetFormSubmitState = (form) => {

    if (!form) return;

    form.dataset.submitting = 'false';
    form.querySelector('button[type="submit"]')?.removeAttribute('disabled');
};

export const initForm = ({
    form, 
    mode, 
    id = ''
}) => {

    form.reset();
    form.querySelectorAll('.js-flatpickr-datetime').forEach(input => setDateTimePickerValue(input, input.value));
    form.dataset.id = id;
    form.dataset.mode = mode;
    resetFormSubmitState(form);
}

export const toggleErrorMessages = (form, errors) => {

    Object.entries(errors).forEach(([field, message]) => {

        const input = form.querySelector(`[name='${ field }']`);
        const feedback = form.querySelector(`[data-error-for='${ field }']`);

        if (!input || !feedback) return;

        feedback.classList.toggle('d-none', !message);
        input.classList.toggle('is-invalid', !!message);

        if (message) feedback.textContent = message;
        else feedback.textContent = null;
    });
}

const setInputSelectError = (form, key, message = null) => {

    const feedback = form.querySelector(`[data-error-for='${ key }']`);

    if (!feedback) return;

    feedback.classList.toggle('d-none', !message);
    feedback.classList.toggle('d-block', !!message);

    if (message) feedback.textContent = message;
    else feedback.textContent = null;
}

export const toggleInputSelectErrors = (form, errors, fields = null) => {

    const shouldUpdateField = (field) => !fields || fields.includes(field);

    form.querySelectorAll('select').forEach(input => {

        if (!shouldUpdateField(input.name)) return;

        const key = input.name;
        const value = errors[key];
        
        setInputSelectError(form, key, value);

        if ($(input).hasClass('select2-hidden-accessible')) {

            $(input)
                .next('.select2-container')
                .toggleClass('is-invalid', !!value)
                .find('.select2-selection')
                .toggleClass('is-invalid', !!value);
        }

        input.classList.toggle('is-invalid', !!value);
        input.toggleAttribute('aria-invalid', !!value);
    });

    form.querySelectorAll('input[type="checkbox"]').forEach(input => {

        if (!shouldUpdateField(input.name)) return;

        const key = input.name;
        const value = errors[key];

        setInputSelectError(form, key, value);

        input.classList.toggle('is-invalid', !!value);
    });
}

const setTableError = (form, key, message = null) => {

    const feedback = form.querySelector(`[data-error-for=${ key }]`);

    if (!feedback) return;

    feedback.classList.toggle('d-none', !message);

    if (message) feedback.textContent = message;
    else feedback.textContent = null;
}

export const toggleTableErrors = (form, errors, fields = null) => {

    const { mode } = form.dataset;

    if (mode === FORM_MODES.EDIT_DETAIL) {

        form.querySelectorAll('#productTable .is-invalid').forEach(input => {
            input.classList.remove('is-invalid');
        });

        form.querySelectorAll('#productTable [data-error-for]').forEach(feedback => {
            feedback.textContent = '';
            feedback.classList.add('d-none');
        });

        Object.keys(errors).forEach(id => {

            const fields = errors[id];

            Object.keys(fields).forEach(field => {

                const input = form.querySelector(`[data-detail-id="${ id }"][name="${ field }"]`);
                const feedback = form.querySelector(`[data-error-for="${ field }-${ id }"]`);

                if (!input || !feedback) return;

                const message = fields[field];
                input.classList.toggle('is-invalid', !!message);
                feedback.classList.toggle('d-none', !message);

                if (message) feedback.textContent = message;
                else feedback.textContent = null;
            });
        });

    } else {

        const key = 'details';

        if (fields && !fields.includes(key)) return;

        const value = errors[key];
        setTableError(form, key, value);
    }
}

export const normalizeFormErrors = ({ form, errors, fields = Object.keys(errors) }) => {

    toggleErrorMessages(form, errors);
    toggleTableErrors(form, errors, fields);
    toggleInputSelectErrors(form, errors, fields);

    return errors;
}

export const clearFormErrors = (form) => {

    form.querySelectorAll('.is-invalid').forEach(input => {
        input.classList.remove('is-invalid');
        input.removeAttribute('title');
        input.removeAttribute('aria-invalid');
    });

    form.querySelectorAll('.was-validated').forEach(el => {
        el.classList.remove('was-validated');
    });

    form.querySelectorAll('[data-error-for]').forEach(feedback => {
        feedback.textContent = '';
        feedback.classList.remove('d-block');
        feedback.classList.add('d-none');
    });

    form.querySelectorAll('select').forEach(input => {

        if ($(input).hasClass('select2-hidden-accessible')) {

            $(input)
                .next('.select2-container')
                .removeClass('is-invalid')
                .find('.select2-selection')
                .removeClass('is-invalid');
        }
    });

    const tableError = form.querySelector('[data-error-for="details"]');

    if (tableError) {
        tableError.textContent = '';
        tableError.classList.add('d-none');
    }
};

const getFormFieldContainer = (form, fieldName) => {

    const field = form.elements[fieldName];

    if (!field) return null;

    return field.closest('[class*="col-"]') || field.closest('.form-outline') || field.parentElement;
};

export const setFormFieldVisibility = ({
    form,
    fieldName,
    isVisible,
    clearWhenHidden = false,
    requiredWhenVisible = false,
    enableWhenVisible = true,
    labelContent = null
}) => {

    const field = form.elements[fieldName];

    if (!field) return;

    const container = getFormFieldContainer(form, fieldName);
    const label = field.id ? form.querySelector(`label[for="${ field.id }"]`) : null;

    if (container) container.classList.toggle('d-none', !isVisible);

    field.required = isVisible && requiredWhenVisible;

    if (!isVisible) {

        if (clearWhenHidden) field.value = '';

        toggleDisabledElement({
            element: field,
            isDisabled: true
        });
    } else {
        toggleDisabledElement({
            element: field,
            isDisabled: enableWhenVisible ? field.defaultDisabled : true
        });
    }

    if (label && labelContent !== null) label.textContent = labelContent;
};

export const toggleFormFields = ({
    form,
    fields,
    isVisible
}) => {

    fields.forEach((fieldName) => {

        setFormFieldVisibility({
            form,
            fieldName,
            isVisible
        });
    });
};

const toggleReadOnlyElement = ({ element, isReadOnly }) => {

    if (isReadOnly) {
        if (!element.disabled) element.dataset.readOnlyDisabled = 'true';
        toggleDisabledElement({
            element,
            isDisabled: true
        });
        return;
    }

    if (element.dataset.readOnlyDisabled !== 'true') return;

    toggleDisabledElement({
        element,
        isDisabled: false
    });
    delete element.dataset.readOnlyDisabled;
};

export const setFormReadOnly = ({
    form,
    fields = 'all',
    isReadOnly
}) => {
    
    const elements = fields === 'all'
        ? form.querySelectorAll('input, select, textarea')
        : fields
            .map(field => form.querySelector(`[name='${ field }']`))
            .filter(Boolean);

    elements.forEach(element => toggleReadOnlyElement({ element, isReadOnly }));

    if (fields !== 'all') return;
    
    const { mode } = form.dataset;

    form.querySelector('#submitBtn').classList.toggle('d-none', mode === FORM_MODES.VIEW);
};

export const toggleButtons = ({
    mode,
    status = 'Cerrada',
    showActions = true,
    withTotal = true,
    showAddProduct = null
}) => {

    const isView = mode === 'view' || mode === 'edit-detail';
    const addProductContainer = document.querySelector('.add-product-container');
    const shouldShowAddProduct = showAddProduct ?? !isView;

    addProductContainer?.classList.toggle('d-none', !shouldShowAddProduct);

    if (showAddProduct !== null) {
        toggleContainerElements({
            selector: '.add-product-container',
            isDisabled: !shouldShowAddProduct
        });
    }

    document.querySelector('.total-container').classList.toggle('d-none', !withTotal);
    const approveContainer = document.querySelector('.approve-container');

    if (approveContainer) {
        
        const canApprove = !showActions || !(isView && status === 'Abierta');
        approveContainer.classList.toggle('d-none', canApprove);
    }
}

export const clearAddedProductInput = () => {

    $('#productInput').empty().trigger('change');
    document.querySelector('#quantityInput').value = '';
    document.querySelector('#presentationDisplayInput').value = '';
    const costInput = document.querySelector('#costPerUnitInput');

    if (costInput) costInput.value = '';
}

export const toggleInvoiceInput = ({ value, mode, form }) => {

    const invoiceContainer = document.getElementById('invoiceContainer');

    if (value === 'invoice') invoiceContainer.style.display = '';
    else invoiceContainer.style.display = 'none';
}
