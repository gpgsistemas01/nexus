import { DepartmentFindDatabaseError, DepartmentNotFound } from "../../errors/admin/departmentError.js";
import { prisma } from "../../lib/prisma.js";

export const findDepartmentById = async ({ tx, id }) => {

    const db = tx || prisma;
    let department;

    try {

        department = await db.department.findFirst({
            where: { id },
        });

    } catch (err) {

        throw new DepartmentFindDatabaseError();
    }

    if (!department) throw new DepartmentNotFound();

    return department || null;
}