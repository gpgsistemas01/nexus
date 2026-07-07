const DATE_TIME_SELECTOR = '.js-flatpickr-datetime';

const getFlatpickrLocale = () => window.flatpickr?.l10ns?.es || 'es';

export const initDateTimePickers = (root = document) => {

    if (typeof window.flatpickr !== 'function') return [];

    return Array.from(root.querySelectorAll(DATE_TIME_SELECTOR)).map((input) => {

        if (input._flatpickr) return input._flatpickr;

        return window.flatpickr(input, {
            altInput: true,
            altFormat: 'd/m/Y H:i',
            allowInput: true,
            dateFormat: 'Y-m-d\\TH:i',
            enableTime: true,
            locale: getFlatpickrLocale(),
            time_24hr: true
        });
    });
};

export const setDateTimePickerValue = (input, value) => {

    if (!input) return;

    if (input._flatpickr) {
        input._flatpickr.setDate(value || '', false, 'Y-m-d\\TH:i');
        return;
    }

    input.value = value || '';
};
