import { getDb } from "../../repository/baseRepository.js";
import { ROLE_NAMES } from "../../constants/roles.js";
import { DEPARTMENT_NAMES } from "../../constants/departments.js";

const ENTITY_MATERIAL_LOW_STOCK = 'material-low-stock';
const ENTITY_MATERIAL_STOCK_RESTORED = 'material-stock-restored';
const ENTITY_GOODS_RECEIPT = 'goods-receipt';

const getNotificationWhereByUser = async (departments, roles) => {

    if (!departments?.length || !roles?.length) return {};

    const dbDepartments = await getDb().department.findMany({
        where: {
            name: { in: departments }
        }
    });

    if (!dbDepartments.length) return {};

    const departmentIds = dbDepartments.map(d => d.id);

   const canViewAllNotifications = roles.includes(ROLE_NAMES.SYSTEM_ADMIN) || departments.includes(DEPARTMENT_NAMES.WAREHOUSE);

    if (canViewAllNotifications) {
        return {
            entityType: {
                notIn: [ENTITY_GOODS_RECEIPT, ENTITY_MATERIAL_STOCK_RESTORED]
            }
        };
    }

    return {
        AND: [
            {
                entityType: {
                    not: ENTITY_MATERIAL_STOCK_RESTORED
                }
            },
            {
                OR: [
                    {
                        departmentId: { in: departmentIds }
                    },
                    {
                        entityType: ENTITY_MATERIAL_LOW_STOCK
                    }
                ]
            }
        ]
    };
};

export const createStockNotification = async ({
    title,
    message,
    type = 'warning',
    referenceNumber = null,
    entityId = null,
    entityType = null,
    userId = null,
    departmentId = null
}) => {

    return getDb().notification.create({
        data: {
            title,
            message,
            type,
            entityId,
            referenceNumber,
            entityType,
            userId,
            departmentId
        }
    });
};

export const createNotifications = async (notifications = []) => {

    if (!notifications.length) return [];

    await getDb().notification.createMany({
        data: notifications
    });

    return notifications;
};

export const notifyMaterialStockStatusChanges = async ({ materialIds = [], userId = null }) => {

    if (!materialIds.length) return [];

    const uniqueMaterialIds = [...new Set(materialIds)];
    const materials = await getDb().material.findMany({
        where: {
            id: {
                in: uniqueMaterialIds
            }
        },
        select: {
            id: true,
            name: true,
            currentStock: true,
            minStock: true
        }
    });

    const latestNotifications = await getDb().notification.findMany({
        where: {
            entityId: {
                in: uniqueMaterialIds
            },
            entityType: {
                in: [ENTITY_MATERIAL_LOW_STOCK, ENTITY_MATERIAL_STOCK_RESTORED]
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const latestNotificationByMaterial = new Map();

    for (const notification of latestNotifications) {
        if (!latestNotificationByMaterial.has(notification.entityId)) {
            latestNotificationByMaterial.set(notification.entityId, notification);
        }
    }

    const notificationsToCreate = [];

    for (const material of materials) {
        const latestStateNotification = latestNotificationByMaterial.get(material.id);

        const isLowStock = material.currentStock < material.minStock;
        const lastNotificationType = latestStateNotification?.entityType || null;

        if (isLowStock && lastNotificationType !== ENTITY_MATERIAL_LOW_STOCK) {
            notificationsToCreate.push({
                title: 'Stock mínimo',
                message: `El material ${material.name} se encuentra en stock mínimo.`,
                type: 'warning',
                entityId: material.id,
                entityType: ENTITY_MATERIAL_LOW_STOCK,
                referenceNumber: null,
                userId,
                departmentId: null
            });
        }

        if (!isLowStock && lastNotificationType === ENTITY_MATERIAL_LOW_STOCK) {
            notificationsToCreate.push({
                title: 'Stock restaurado',
                message: `El material ${material.name} restauró su nivel de stock.`,
                type: 'info',
                entityId: material.id,
                entityType: ENTITY_MATERIAL_STOCK_RESTORED,
                referenceNumber: null,
                userId,
                departmentId: null
            });
        }
    }

    if (!notificationsToCreate.length) return [];

    await createNotifications(notificationsToCreate);

    return await getDb().notification.findMany({
        where: {
            entityId: {
                in: notificationsToCreate.map(n => n.entityId)
            },
            entityType: {
                in: [ENTITY_MATERIAL_LOW_STOCK, ENTITY_MATERIAL_STOCK_RESTORED]
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: notificationsToCreate.length
    });
};

export const findLatestNotifications = async ({ take = 10, departments, roles } = {}) => {

    const where = await getNotificationWhereByUser(departments, roles);

    const items = await getDb().notification.findMany({
        where,
        take,
        orderBy: {
            createdAt: 'desc'
        }
    });

    const unreadCount = await getDb().notification.count({
        where: {
            ...where,
            isRead: false
        }
    });

    return {
        items,
        unreadCount
    };
};

export const markAllNotificationsAsRead = async ({ department, role }) => {

    const where = await getNotificationWhereByUser(department, role);

    await getDb().notification.updateMany({
        where: {
            ...where,
            isRead: false
        },
        data: {
            isRead: true
        }
    });
};
