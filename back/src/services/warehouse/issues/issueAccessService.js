import { ForbiddenError } from '../../../errors/authError.js';
import { DATA_SCOPES, getOrganizationContext, hasGrantedPermission, hasDataScope } from '../../../constants/permissions.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

// Los IDs y las claves proceden de la sesión, nunca del body o de la query.
export const buildIssueDepartmentWhere = ({ accesses = [], departmentId = '' } = {}) => {
    if (hasDataScope(accesses, DATA_SCOPES.ISSUES_ALL_DEPARTMENTS)) {
        return departmentId ? { departmentId } : {};
    }

    const departmentIds = [...new Set(accesses
        .filter(access => hasGrantedPermission([access], PERMISSIONS.GOODS_ISSUES_MANAGE))
        .map(access => access.departmentId)
        .filter(id => id && (!departmentId || id === departmentId)))];

    return { departmentId: { in: departmentIds } };
};

export const assertIssueDepartmentAccess = ({ accesses = [], departmentId, currentDepartmentId }) => {
    const where = buildIssueDepartmentWhere({ accesses, departmentId });
    if (!departmentId || (typeof where.departmentId === 'object' && !where.departmentId.in.length)) {
        throw new ForbiddenError('Sólo puede registrar salidas para sus áreas autorizadas.');
    }

    if (currentDepartmentId && departmentId !== currentDepartmentId) {
        const { isWarehouse, isSystem } = getOrganizationContext(accesses);
        if (!isWarehouse && !isSystem) throw new ForbiddenError('El área de esta salida no se puede cambiar desde su cuenta.');
    }
};

export const resolveIssueImmediateSupply = ({ accesses, permission, requested }) => {
    const canSupply = hasGrantedPermission(accesses, permission);
    if (requested && !canSupply) {
        throw new ForbiddenError('No tiene permiso para surtir salidas al registrarlas.');
    }

    return canSupply && (requested === true || hasGrantedPermission(accesses, PERMISSIONS.ISSUES_AUTO_SUPPLY));
};
