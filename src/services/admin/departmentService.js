import { findPage } from "../../repository/paginationRepository.js";
import { DepartmentNotFound } from "../../errors/admin/departmentError.js";
import { getDb } from "../../repository/baseRepository.js";

export const findAllDepartments = async ({
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
        model: getDb().department,
        query: {
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
        }
    });
}

const DEFAULT_DEPARTMENT_SELECT = {
    id: true,
    name: true,
    isActive: true
};

export const findDepartmentById = async ({ tx, id }) => {

    const db = getDb(tx);
    const department = await db.department.findFirst({
        where: { id, isActive: true },
        select: DEFAULT_DEPARTMENT_SELECT
    });

    if (!department) throw new DepartmentNotFound();

    return department || null;
}
