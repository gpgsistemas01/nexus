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

    return {
        hasDepartment,
        hasRole,
        hasAccess,
        isAdmin: hasRole('Administrador del sistema'),
        isWarehouse,
        isSystem,
        isSales: hasDepartment('VENTAS Y PROYECTOS ESPECIALES'),
        isCoordinatorOfArea: (dept) => hasRole('Coordinador') && hasDepartment(dept)
    }
}
