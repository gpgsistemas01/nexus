export const MEXICO_TIME_ZONE = 'America/Mexico_City';

export const sanitizeEmptyStrings = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      value === '' ? null : value
    ])
  );
};

export const formatDateLongWithTime = (dateTime) => {

    if (!dateTime) return '';

    const date = new Date(dateTime);
    return new Intl.DateTimeFormat('es-MX', {
        timeZone: MEXICO_TIME_ZONE,
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}


export const getMexicoMonthYearParts = (dateTime = new Date()) => {

    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: MEXICO_TIME_ZONE,
        month: '2-digit',
        year: 'numeric'
    }).formatToParts(dateTime).reduce((acc, part) => {
        if (part.type !== 'literal') acc[part.type] = part.value;
        return acc;
    }, {});

    return {
        month: parts.month,
        year: parts.year
    };
};


export const getMexicoMonthDateRange = (dateTime = new Date()) => {

    const { month, year } = getMexicoMonthYearParts(dateTime);
    const monthIndex = Number(month) - 1;
    const firstDay = new Date(Number(year), monthIndex, 1);
    const lastDay = new Date(Number(year), monthIndex + 1, 0);
    const formatDate = (date) => [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-');

    return {
        startDate: formatDate(firstDay),
        endDate: formatDate(lastDay),
        month,
        year
    };
};

export const cleanSearchTerm = (search) => {

  const cleaned = search.trim();
  let codeSearch = search;
  let nameSearch = search;

  if (cleaned.includes('-')) {

    const parts = cleaned.split('-').map(part => part.trim());
    codeSearch = parts[0];
    nameSearch = parts.slice(1).join('-');
  }

  return { codeSearch, nameSearch };
};

export const roundTo = (value, decimals = 2) => {

    const factor = 10 ** decimals;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const FLOAT_EPSILON = 0.000001;

export const round2 = (value) => roundTo(value);

export const normalizeDecimal = (value) => {

    const rounded = round2(value);

    return Math.abs(rounded) <= FLOAT_EPSILON
        ? 0
        : rounded;
};

export const hasProductDimensions = (product = {}) => (
    Number(product.base || 0) > 0 &&
    Number(product.height || 0) > 0
);

export const buildStockKey = (productId, supplierId) =>
    `${productId}:${supplierId}`;

export const parseStockKey = (key) => {
    const [productId, supplierId] = key.split(':');
    return { productId, supplierId };
};

export const toNumber = value => value == null || value === '' ? null : Number(value);

export const normalizeProductDimensions = ({ base, height } = {}) => {

    const parsedBase = toNumber(base);
    const parsedHeight = toNumber(height);

    if (parsedBase === 0 && parsedHeight === 0) {
        return {
            base: null,
            height: null
        };
    }

    return {
        base: parsedBase,
        height: parsedHeight
    };
};

export const normalizeText = (value = '') => value.trim().toUpperCase();
