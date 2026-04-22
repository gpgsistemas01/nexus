import { DepartmentNotFound } from "../../errors/admin/userError.js";
import { prisma } from "../../lib/prisma.js";

export const getDepartmentByProfileId = async (profileId) => {

    const user = await prisma.user.findFirst({
        where: {
            profiles: {
                some: {
                    id: profileId
                }
            }
        },
        select: {
            departmentId: true
        }
    });

    if (!user) throw new DepartmentNotFound();

    return user.departmentId;
}