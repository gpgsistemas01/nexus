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
