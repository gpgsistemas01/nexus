import { createBrowserDateFromTimeZone, zonedDateTimeToUtcIso } from "../../utils/timeZone.js";

const DATE_TIME_SELECTOR = '.js-flatpickr-datetime';

const getFlatpickrLocale = () => window.flatpickr?.l10ns?.es || 'es';

const parseVeracruzDate = (value) => {

    if (!value) return null;

    return createBrowserDateFromTimeZone(value) || new Date(value);
};

export const initDateTimePickers = (root = document) => {

    if (typeof window.flatpickr !== 'function') return [];

    return Array.from(root.querySelectorAll(DATE_TIME_SELECTOR)).map((input) => {

        if (input._flatpickr) return input._flatpickr;

        return window.flatpickr(input, {
            altInput: true,
            altFormat: 'd/m/Y H:i',
            allowInput: true,
            dateFormat: 'Z',
            enableTime: true,
            formatDate: (date, format, locale) => (
                format === 'Z'
                    ? zonedDateTimeToUtcIso(date)
                    : window.flatpickr.formatDate(date, format, locale)
            ),
            locale: getFlatpickrLocale(),
            parseDate: parseVeracruzDate,
            time_24hr: true
        });
    });
};

export const setDateTimePickerValue = (input, value) => {

    if (!input) return;

    if (input._flatpickr) {
        input._flatpickr.setDate(value ? parseVeracruzDate(value) : '', false);
        return;
    }

    input.value = value || '';
};
