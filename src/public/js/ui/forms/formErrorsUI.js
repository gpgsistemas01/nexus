import { FORM_MODES } from '../../constants/formModes.js';

const getFirstInvalidControl = (form) => {
    const invalidElement = form.querySelector('.is-invalid, [aria-invalid="true"]');

    if (invalidElement) return invalidElement;

    const visibleError = Array.from(form.querySelectorAll('[data-error-for]'))
        .find(feedback => feedback.textContent.trim() && !feedback.classList.contains('d-none'));

    if (!visibleError) return null;

    const fieldName = visibleError.dataset.errorFor;
    return (fieldName ? form.querySelector(`[name="${ fieldName }"]`) : null) || visibleError;
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

    scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    if (typeof invalidElement.focus === 'function' && !invalidElement.disabled) invalidElement.focus({ preventScroll: true });
};

export const toggleErrorMessages = (form, errors) => {
    Object.entries(errors).forEach(([field, message]) => {
        const input = form.querySelector(`[name='${ field }']`);
        const feedback = form.querySelector(`[data-error-for='${ field }']`);
        if (!input || !feedback) return;

        feedback.classList.toggle('d-none', !message);
        input.classList.toggle('is-invalid', !!message);
        feedback.textContent = message || '';
    });
};

const setInputSelectError = (form, key, message = null) => {
    const feedback = form.querySelector(`[data-error-for='${ key }']`);
    if (!feedback) return;
    feedback.classList.toggle('d-none', !message);
    feedback.classList.toggle('d-block', !!message);
    feedback.textContent = message || '';
};

const toggleInputSelectErrors = (form, errors, fields = null) => {
    const shouldUpdateField = field => !fields || fields.includes(field);

    form.querySelectorAll('select').forEach(input => {
        if (!shouldUpdateField(input.name)) return;
        const value = errors[input.name];
        setInputSelectError(form, input.name, value);
        if ($(input).hasClass('select2-hidden-accessible')) {
            $(input).next('.select2-container').toggleClass('is-invalid', !!value)
                .find('.select2-selection').toggleClass('is-invalid', !!value);
        }
        input.classList.toggle('is-invalid', !!value);
        input.toggleAttribute('aria-invalid', !!value);
    });

    form.querySelectorAll('input[type="checkbox"]').forEach(input => {
        if (!shouldUpdateField(input.name)) return;
        const value = errors[input.name];
        setInputSelectError(form, input.name, value);
        input.classList.toggle('is-invalid', !!value);
    });
};

const toggleTableErrors = (form, errors, fields = null) => {
    if (form.dataset.mode === FORM_MODES.EDIT_DETAIL) {
        form.querySelectorAll('#materialTable .is-invalid').forEach(input => input.classList.remove('is-invalid'));
        form.querySelectorAll('#materialTable [data-error-for]').forEach(feedback => {
            feedback.textContent = '';
            feedback.classList.add('d-none');
        });
        Object.entries(errors).forEach(([id, detailFields]) => {
            Object.entries(detailFields).forEach(([field, message]) => {
                const input = form.querySelector(`[data-detail-id="${ id }"][name="${ field }"]`);
                const feedback = form.querySelector(`[data-error-for="${ field }-${ id }"]`);
                if (!input || !feedback) return;
                input.classList.toggle('is-invalid', !!message);
                feedback.classList.toggle('d-none', !message);
                feedback.textContent = message || '';
            });
        });
        return;
    }

    const key = form.querySelector('.table-validation-message')?.dataset.errorFor || 'details';
    if (fields && !fields.includes(key)) return;
    const feedback = form.querySelector(`[data-error-for=${ key }]`);
    if (!feedback) return;
    feedback.classList.toggle('d-none', !errors[key]);
    feedback.textContent = errors[key] || '';
};

export const normalizeFormErrors = ({ form, errors, fields = Object.keys(errors) }) => {
    toggleErrorMessages(form, errors);
    toggleTableErrors(form, errors, fields);
    toggleInputSelectErrors(form, errors, fields);
    return errors;
};

export const clearFormErrors = (form) => {
    form.querySelectorAll('.is-invalid').forEach(input => {
        input.classList.remove('is-invalid');
        input.removeAttribute('title');
        input.removeAttribute('aria-invalid');
    });
    form.querySelectorAll('.was-validated').forEach(element => element.classList.remove('was-validated'));
    form.querySelectorAll('[data-error-for]').forEach(feedback => {
        feedback.textContent = '';
        feedback.classList.remove('d-block');
        feedback.classList.add('d-none');
    });
    form.querySelectorAll('select').forEach(input => {
        if ($(input).hasClass('select2-hidden-accessible')) {
            $(input).next('.select2-container').removeClass('is-invalid')
                .find('.select2-selection').removeClass('is-invalid');
        }
    });
};
