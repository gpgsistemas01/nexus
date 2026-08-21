export const UI_PERMISSIONS = Object.freeze({
    PERSONS_WRITE: 'persons:write',
    MATERIALS_WRITE: 'materials:write',
    MATERIALS_ADJUST_STOCK: 'materials:adjust-stock',
    INVENTORY_COSTS_READ: 'inventory:costs-read',
    WASTES_WRITE: 'wastes:write',
    WASTES_ADJUST_STOCK: 'wastes:adjust-stock',
    GOODS_ISSUES_MANAGE: 'goods:issues-manage',
    GOODS_ISSUE_DETAILS_MANAGE: 'goods:issue-details-manage',
    WASTE_ISSUES_MANAGE: 'waste:issues-manage',
    WASTE_ISSUES_SUPPLY: 'waste:issues-supply'
});

export const hasPermission = (user, permission) => (
    Array.isArray(user?.permissions)
    && user.permissions.includes(permission)
);
