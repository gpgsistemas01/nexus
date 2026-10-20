import { createBrowserDateFromTimeZone, zonedDateTimeToUtcIso } from "../../utils/timeZone.js";

const FLATPICKR_DATE_TIME_SELECTOR = '.js-flatpickr-datetime';
const FLATPICKR_DATE_SELECTOR = '.js-flatpickr-date';
const FLATPICKR_MONTH_SELECTOR = '.js-flatpickr-month';
const DISPLAY_DATE_TIME_REGEX = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/;

const getFlatpickrLocale = () => window.flatpickr?.l10ns?.es || 'es';

const syncFlatpickrAltInputDisabled = (flatpickrInstance) => {

    const altInput = flatpickrInstance?.altInput;
    const originalInput = flatpickrInstance?.input;

    if (!altInput || !originalInput) return;

    altInput.disabled = originalInput.disabled;
    altInput.classList.toggle('disabled', originalInput.disabled);
};

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

    return Array.from(root.querySelectorAll(FLATPICKR_DATE_TIME_SELECTOR)).map((input) => {

        if (input._flatpickr) {
            syncFlatpickrAltInputDisabled(input._flatpickr);
            return input._flatpickr;
        }

        const instance = window.flatpickr(input, {
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

        syncFlatpickrAltInputDisabled(instance);

        return instance;
    });
};

export const initDatePickers = (root = document) => {

    if (typeof window.flatpickr !== 'function') return [];

    return Array.from(root.querySelectorAll(FLATPICKR_DATE_SELECTOR))
        .filter(input => input.type === 'date' || input._flatpickr)
        .map((input) => {

            if (input._flatpickr) {
                syncFlatpickrAltInputDisabled(input._flatpickr);
                return input._flatpickr;
            }

            const instance = window.flatpickr(input, {
                altInput: true,
                altFormat: 'd/m/Y',
                allowInput: true,
                dateFormat: 'Y-m-d',
                enableTime: false,
                locale: getFlatpickrLocale()
            });

            syncFlatpickrAltInputDisabled(instance);

            return instance;
        });
};

export const initMonthPickers = (root = document) => {

    if (typeof window.flatpickr !== 'function' || typeof window.monthSelectPlugin !== 'function') return [];

    return Array.from(root.querySelectorAll(FLATPICKR_MONTH_SELECTOR)).map((input) => {

        if (input._flatpickr) {
            syncFlatpickrAltInputDisabled(input._flatpickr);
            return input._flatpickr;
        }

        const instance = window.flatpickr(input, {
            altInput: true,
            altFormat: 'F Y',
            allowInput: false,
            dateFormat: 'Y-m',
            locale: getFlatpickrLocale(),
            plugins: [window.monthSelectPlugin({
                altFormat: 'F Y',
                dateFormat: 'Y-m',
                shorthand: false
            })]
        });

        syncFlatpickrAltInputDisabled(instance);

        return instance;
    });
};

export const setMonthPickerDisabled = (input, disabled) => {

    if (!input) return;

    input.disabled = disabled;

    if (input._flatpickr) syncFlatpickrAltInputDisabled(input._flatpickr);
};

export const setDateTimePickerValue = (input, value) => {

    if (!input) return;

    if (input._flatpickr) {
        input._flatpickr.setDate(value ? parseMexicoDate(value) : '', false);
        return;
    }

    input.value = value || '';
};
