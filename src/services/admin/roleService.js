import { findPage } from '../../repository/paginationRepository.js';
import { getDb } from '../../repository/baseRepository.js';

export const findAllRoles = async ({
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
        model: getDb().role,
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
