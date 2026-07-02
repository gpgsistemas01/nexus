export const hasPermission = (user) => {

    const accesses = user.accesses || [];
    const departments = accesses.map(a => a.department);
    const roles = accesses.map(a => a.role);

    const hasDepartment = (dept) => departments.includes(dept);
    const hasRole = (role) => roles.includes(role);
    const isWarehouse = hasDepartment('ALMACÉN Y PROVEDURÍA');
    const isSystem = hasDepartment('SISTEMAS');
    const canManageWarehouseReturns = () => (isWarehouse || isSystem)
        && ['Almacenista', 'Auxiliar', 'Coordinador', 'Administrador del sistema'].some(hasRole);

    return {
        hasDepartment,
        hasRole,
        canManageWarehouseReturns,
        isAdmin: hasRole('Administrador del sistema'),
        isWarehouse,
        isSystem,
        isSales: hasDepartment('VENTAS Y PROYECTOS ESPECIALES'),
        isCoordinatorOfArea: (dept) => hasRole('Coordinador') && hasDepartment(dept)
    }
}
