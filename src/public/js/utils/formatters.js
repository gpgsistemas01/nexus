import { VERACRUZ_TIME_ZONE, formatDateTimeInputInTimeZone } from './timeZone.js';

export const formatShortDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString('es-MX', { ...options, timeZone: VERACRUZ_TIME_ZONE });
}

export const formatNotificationDate = (dateValue) => new Date(dateValue).toLocaleString('es-MX', {
    timeZone: VERACRUZ_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
});

export const formatDateLongWithTime = (dateTime) => {

    if (!dateTime) return '';

    return formatDateTimeInputInTimeZone(dateTime);
}


export const formatDateTimeDisplay = (dateTime) => {

    if (!dateTime) return '';

    return new Date(dateTime).toLocaleString('es-MX', {
        timeZone: VERACRUZ_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export const formatFileName = (filename) => {

    const now = new Date();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const year = now.getUTCFullYear();

    return `${ filename }_${ month }_${ year }`;
}

export const normalizeText = (value = '') => value.trim().toUpperCase();
