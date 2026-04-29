import { ProfileFindDatabaseError } from "../../errors/admin/profileError.js";
import { prisma } from "../../lib/prisma.js";

export const findAllProfiles = async ({
    department = '',
    skip = 0,
    take = 10,
    search = '',
    orderBy = 'fullName',
    orderDir = 'asc'
}) => {

    const where = {
        isActive: true,
        ...(search && {
            name: {
                contains: search,
                mode: 'insensitive'
            }
        }),
        ...(department && {
            departments: {
                some: {
                    department: {
                        name: department
                    }
                }
            }
        })
    };
    
    const profiles = await prisma.profile.findMany({
        skip,
        take,
        where,
        orderBy: {
            [orderBy]: orderDir
        }
    });

    const total = await prisma.profile.count();
    const filtered = await prisma.profile.count({ where });

    return {
        data: profiles,
        recordsTotal: total,
        recordsFiltered: filtered
    };
};

export const findProfileById = async ({ tx, id }) => {

    const db = tx || prisma;
    let profile;

    try {

        profile = await db.profile.findUnique({
            where: { 
                id,
                isActive: true
            },
            select: {
                id: true,
            }
        });

    } catch (err) {

        throw new ProfileFindDatabaseError();
    }

    return profile?.id || null;
};

export const findProfileByUserId = async ({ tx, userId }) => {

    const db = tx || prisma;
    let profile;

    try {

        profile = await db.profile.findFirst({
            where: { 
                isActive: true,
                users: {
                    some: {
                        id: userId
                    }
                }
            },
            select: {
                id: true,
            }
        });

    } catch (err) {

        throw new ProfileFindDatabaseError();
    }

    return profile?.id || null;
}