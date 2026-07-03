export const hasPermission = (user) => {

    const accesses = user.accesses || [];
    const departments = accesses.map(a => a.department);
    const roles = accesses.map(a => a.role);

    const hasDepartment = (dept) => departments.includes(dept);
    const hasRole = (role) => roles.includes(role);
    const hasAccess = ({ departments: allowedDepartments = [], roles: allowedRoles = [] }) => accesses.some(access => (
        allowedDepartments.includes(access.department)
        && allowedRoles.includes(access.role)
    ));
    const isWarehouse = hasDepartment('ALMACÉN Y PROVEDURÍA');
    const isSystem = hasDepartment('SISTEMAS');
    const canManageWarehouseReturns = () => hasAccess({
        departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS'],
        roles: ['Almacenista', 'Auxiliar', 'Coordinador', 'Administrador del sistema']
    });

    return {
        hasDepartment,
        hasRole,
        hasAccess,
        canManageWarehouseReturns,
        isAdmin: hasRole('Administrador del sistema'),
        isWarehouse,
        isSystem,
        isSales: hasDepartment('VENTAS Y PROYECTOS ESPECIALES'),
        isCoordinatorOfArea: (dept) => hasRole('Coordinador') && hasDepartment(dept)
    }
}
