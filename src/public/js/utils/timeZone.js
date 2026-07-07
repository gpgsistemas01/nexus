export const VERACRUZ_TIME_ZONE = 'America/Mexico_City';

const pad = (value) => String(value).padStart(2, '0');

export const getTimeZoneDateTimeParts = (dateValue, timeZone = VERACRUZ_TIME_ZONE) => {

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return null;

    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).formatToParts(date).reduce((acc, part) => {
        if (part.type !== 'literal') acc[part.type] = part.value;
        return acc;
    }, {});

    return {
        year: Number(parts.year),
        month: Number(parts.month),
        day: Number(parts.day),
        hour: Number(parts.hour),
        minute: Number(parts.minute),
        second: Number(parts.second)
    };
};

export const formatDateTimeInputInTimeZone = (dateValue, timeZone = VERACRUZ_TIME_ZONE) => {

    const parts = getTimeZoneDateTimeParts(dateValue, timeZone);

    if (!parts) return '';

    return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
};

export const createBrowserDateFromTimeZone = (dateValue, timeZone = VERACRUZ_TIME_ZONE) => {

    const parts = getTimeZoneDateTimeParts(dateValue, timeZone);

    if (!parts) return null;

    return new Date(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second
    );
};

export const zonedDateTimeToUtcIso = (date, timeZone = VERACRUZ_TIME_ZONE) => {

    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';

    const wallTime = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds()
    };

    const utcGuess = Date.UTC(
        wallTime.year,
        wallTime.month - 1,
        wallTime.day,
        wallTime.hour,
        wallTime.minute,
        wallTime.second
    );
    const timeZoneParts = getTimeZoneDateTimeParts(new Date(utcGuess), timeZone);
    const timeZoneWallTimeAsUtc = Date.UTC(
        timeZoneParts.year,
        timeZoneParts.month - 1,
        timeZoneParts.day,
        timeZoneParts.hour,
        timeZoneParts.minute,
        timeZoneParts.second
    );

    return new Date(utcGuess - (timeZoneWallTimeAsUtc - utcGuess)).toISOString();
};
