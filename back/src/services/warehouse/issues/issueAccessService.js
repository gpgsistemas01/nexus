import { AppError } from '../../../errors/AppError.js';
import { DATA_SCOPES, getGrantedPermissions, hasDataScope } from '../../../constants/permissions.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

// Los IDs y las claves proceden de la sesión, nunca del body o de la query.
export const buildIssueDepartmentWhere = ({ accesses = [], departmentId = '' } = {}) => {
    if (hasDataScope(accesses, DATA_SCOPES.ISSUES_ALL_DEPARTMENTS)) {
        return departmentId ? { departmentId } : {};
    }

    const departmentIds = [...new Set(accesses
        .filter(access => getGrantedPermissions([access]).includes(PERMISSIONS.GOODS_ISSUES_MANAGE))
        .map(access => access.departmentId)
        .filter(id => id && (!departmentId || id === departmentId)))];

    return { departmentId: { in: departmentIds } };
};

export const assertIssueDepartmentAccess = ({ accesses = [], departmentId }) => {
    const where = buildIssueDepartmentWhere({ accesses, departmentId });
    if (!departmentId || (typeof where.departmentId === 'object' && !where.departmentId.in.length)) {
        throw new AppError('Sólo puede registrar salidas para sus áreas autorizadas.', 'FORBIDDEN', 403);
    }
};
