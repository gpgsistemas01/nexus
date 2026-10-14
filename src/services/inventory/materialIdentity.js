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

export { getMaterialLengthField } from '../../public/js/utils/warehouseInventoryUtils.js';
