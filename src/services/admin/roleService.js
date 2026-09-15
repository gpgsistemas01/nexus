import { getDb } from '../../repository/baseRepository.js';

export const findAllRoles = async ({
    skip = 0,
    take = 10,
    search = '',
    orderBy = 'name',
    orderDir = 'asc'
}) => {

    const db = getDb();

    const where = {
        isActive: true,
        ...(search && {
            name: {
                contains: search,
                mode: 'insensitive'
            }
        })
    };

    const roles = await db.role.findMany({
        skip,
        take,
        where,
        orderBy: {
            [orderBy]: orderDir
        },
        select: {
            id: true,
            name: true,
            isActive: true
        }
    });

    const total = await db.role.count();
    const filtered = await db.role.count({ where });

    return {
        data: roles,
        recordsTotal: total,
        recordsFiltered: filtered
    };
};
