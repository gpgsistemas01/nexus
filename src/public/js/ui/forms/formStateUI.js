import { DOM_EVENT_NAMES, SELECT2_EVENT_NAMES } from '../../constants/events.js';
import { BUTTON_SELECTORS } from '../../constants/selectors.js';
import { FORM_MODES } from '../../constants/formModes.js';
import { setDateTimePickerValue } from '../../plugins/flatpickr/dateTimePicker.js';
import { toggleDisabledElement } from '../../utils/formUtils.js';

export const resetFormSubmitState = (form) => {
    if (!form) return;
    form.dataset.submitting = 'false';
    form.querySelector('button[type=DOM_EVENT_NAMES.SUBMIT]')?.removeAttribute('disabled');
};

export const initForm = ({ form, mode, id = '' }) => {
    form.reset();
    form.querySelectorAll('.js-flatpickr-datetime').forEach(input => setDateTimePickerValue(input, input.value));
    form.dataset.id = id;
    form.dataset.mode = mode;
    resetFormSubmitState(form);
};

export const setFormDisabled = ({ form, fields = 'all', isDisabled }) => {
    const elements = fields === 'all'
        ? form.querySelectorAll('input, select, textarea')
        : fields.map(field => form.querySelector(`[name='${ field }']`)).filter(Boolean);
    elements.forEach(element => toggleDisabledElement({ element, isDisabled }));
    if (fields === 'all') form.querySelector(BUTTON_SELECTORS.SUBMIT).classList.toggle('d-none', form.dataset.mode === FORM_MODES.VIEW);
};

export const setFormSectionVisibility = ({ form, selector, isVisible, fieldNames = [], clearValues = false }) => {
    form.querySelector(selector)?.classList.toggle('d-none', !isVisible);
    fieldNames.forEach(fieldName => {
        const field = form.elements[fieldName];
        if (!field) return;
        const container = field.closest('[class*="col-"]') || field.closest('.form-outline') || field.parentElement;
        container?.classList.toggle('d-none', !isVisible);
        if (clearValues && !isVisible) field.value = '';
        field.required = false;
        field.disabled = !isVisible;
        if (field.tagName === 'SELECT' && typeof window !== 'undefined' && window.$ && window.$(field).hasClass('select2-hidden-accessible')) {
            window.$(field).prop('disabled', !isVisible).trigger(SELECT2_EVENT_NAMES.CHANGE);
        }
    });
};
