import { getDb } from "../../repository/baseRepository.js";
import { ROLE_NAMES } from "../../constants/roles.js";
import { DEPARTMENT_NAMES } from "../../constants/departments.js";

const OBSOLETE_NOTIFICATION_ENTITY_TYPES = [
    'goods-receipt',
    'material-low-stock',
    'material-stock-restored'
];

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
            entityType: { notIn: OBSOLETE_NOTIFICATION_ENTITY_TYPES }
        };
    }

    return {
        departmentId: { in: departmentIds },
        entityType: { notIn: OBSOLETE_NOTIFICATION_ENTITY_TYPES }
    };
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

export const markAllNotificationsAsRead = async ({ departments, roles }) => {

    const where = await getNotificationWhereByUser(departments, roles);

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
