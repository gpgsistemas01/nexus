export const roundTo = (value, decimals = 6) => {
    const factor = 10 ** decimals;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const FLOAT_EPSILON = 0.000001;

export const normalizeDecimal = (value) => {

    const rounded = roundTo(value);

    return Math.abs(rounded) <= FLOAT_EPSILON
        ? 0
        : rounded;
};
