import { toNumber } from '../../utils/formattersUtils.js';

export const getMaterialIdentityWidth = ({ base = null, height = null } = {}) => {
    const dimensions = [base, height]
        .map(toNumber)
        .filter(dimension => dimension > 0);

    return dimensions.length ? Math.min(...dimensions) : null;
};

export const getMaterialIdentityLength = ({ base = null, height = null } = {}) => {
    const dimensions = [base, height].map(toNumber).filter(dimension => dimension > 0);
    return dimensions.length ? Math.max(...dimensions) : null;
};

export const getMaterialLengthField = ({ base, height } = {}) => {
    if (!(toNumber(base) > 0 && toNumber(height) > 0)) return null;

    return toNumber(base) > toNumber(height) ? 'base' : 'height';
};
