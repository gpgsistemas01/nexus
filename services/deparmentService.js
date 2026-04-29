import { prisma } from "../lib/prisma.js";

export const findAllDepartments = async ({
    skip = 0,
    take = 10,
    search = '',
    orderBy = 'name',
    orderDir = 'asc'
}) => {

    const where = {
        ...(search && {
            name: {
                contains: search,
                mode: 'insensitive'
            }
        })
    };

    const departments = await prisma.department.findMany({
        skip,
        take,
        where,
        orderBy: {
            [orderBy]: orderDir
        }
    });

    const total = await prisma.department.count();
    const filtered = await prisma.department.count({ where });

    return {
        data: departments,
        recordsTotal: total,
        recordsFiltered: filtered
    };
}