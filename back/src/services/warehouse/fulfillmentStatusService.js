import { findPage } from "../../repository/paginationRepository.js";
import { getDb } from "../../repository/baseRepository.js";

export const findAllFulfillmentStatuses = async ({
    skip = 0,
    take = 10,
    search = '',
    orderBy = 'name',
    orderDir = 'asc'
}) => {
    const where = {
        isActive: true,
        ...(search && {
            name: {
                contains: search,
                mode: 'insensitive'
            }
        })
    };

    return findPage({
        model: getDb().fulfillmentStatus,
        query: {
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
        }
    });
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
