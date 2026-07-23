import { getDb } from "../../repository/baseRepository.js";

export const findAllFulfillmentStatuses = async ({
    skip = 0,
    take = 10,
    search = '',
    orderBy = 'name',
    orderDir = 'asc'
}) => {
    const db = getDb();

    const where = search
        ? {
            name: {
                contains: search,
                mode: 'insensitive'
            }
        }
        : {};

    const statuses = await db.fulfillmentStatus.findMany({
        skip,
        take,
        where,
        orderBy: {
            [orderBy]: orderDir
        },
        select: {
            id: true,
            name: true
        }
    });

    const total = await db.fulfillmentStatus.count();
    const filtered = await db.fulfillmentStatus.count({ where });

    return {
        data: statuses,
        recordsTotal: total,
        recordsFiltered: filtered
    };
};

export const findFulfillmentStatusIdsByName = async ({
    tx = getDb(),
    names = []
} = {}) => {
    const statuses = await tx.fulfillmentStatus.findMany({
        where: {
            name: {
                in: names
            }
        },
        select: { id: true, name: true }
    });

    return new Map(statuses.map(({ name, id }) => [name, id]));
};

export const findFulfillmentStatusIdByName = async ({
    tx = getDb(),
    name
} = {}) => {
    const status = await tx.fulfillmentStatus.findUnique({
        where: { name },
        select: { id: true }
    });

    return status?.id || null;
};
