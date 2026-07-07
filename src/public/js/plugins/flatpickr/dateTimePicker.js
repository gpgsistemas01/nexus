import { createBrowserDateFromTimeZone, zonedDateTimeToUtcIso } from "../../utils/timeZone.js";

const DATE_TIME_SELECTOR = '.js-flatpickr-datetime';
const DISPLAY_DATE_TIME_REGEX = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/;

const getFlatpickrLocale = () => window.flatpickr?.l10ns?.es || 'es';

const parseDisplayDateTime = (value) => {

    const match = String(value).trim().match(DISPLAY_DATE_TIME_REGEX);

    if (!match) return null;

    const [, day, month, year, hour = '0', minute = '0'] = match;
    const dateParts = {
        year: Number(year),
        month: Number(month),
        day: Number(day),
        hour: Number(hour),
        minute: Number(minute)
    };
    const date = new Date(
        dateParts.year,
        dateParts.month - 1,
        dateParts.day,
        dateParts.hour,
        dateParts.minute
    );

    if (date.getFullYear() !== dateParts.year
        || date.getMonth() !== dateParts.month - 1
        || date.getDate() !== dateParts.day
        || date.getHours() !== dateParts.hour
        || date.getMinutes() !== dateParts.minute
    ) {
        return null;
    }

    return date;
};

export const parseMexicoDate = (value) => {

    if (!value) return null;

    return parseDisplayDateTime(value) || createBrowserDateFromTimeZone(value) || new Date(value);
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
            parseDate: parseMexicoDate,
            time_24hr: true
        });
    });
};

export const setDateTimePickerValue = (input, value) => {

    if (!input) return;

    if (input._flatpickr) {
        input._flatpickr.setDate(value ? parseMexicoDate(value) : '', false);
        return;
    }

    input.value = value || '';
};
