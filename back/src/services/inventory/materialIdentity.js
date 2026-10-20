import { toNumber } from '../../utils/formattersUtils.js';

export const getMaterialIdentityWidth = ({ base = null, height = null } = {}) => {
    const dimensions = [base, height]
        .map(toNumber)
        .filter(dimension => dimension > 0);

    return dimensions.length ? Math.min(...dimensions) : null;
};
