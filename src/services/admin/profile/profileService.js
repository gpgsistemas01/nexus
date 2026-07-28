import { ProfileCreateDatabaseError, ProfileUpdateDatabaseError } from "../../../errors/admin/profileError.js";
import { getDb } from "../../../repository/baseRepository.js";
import { createServiceLogger, logServiceError } from "../../../utils/logger.js";

const serviceLogger = createServiceLogger('admin.profileService');


export const findAllProfiles = async ({
    departments = [],
    roles = [],
    includeDepartments = false,
    skip = 0,
    take = 10,
    search = '',
    orderBy = 'fullName',
    orderDir = 'asc'
}) => {

    const db = getDb();

    const where = {
        isActive: true,
        ...(search && {
            fullName: {
                contains: search,
                mode: 'insensitive'
            }
        }),
        ...((departments.length || roles.length) && {
            accesses: {
                some: {
                    ...(departments.length && {
                        department: {
                            name: {
                                in: departments
                            }
                        }
                    }),
                    ...(roles.length && {
                        role: {
                            name: {
                                in: roles
                            }
                        }
                    })
                }
            }
        })
    };

    const [foundProfiles, total, filtered] = await Promise.all([
        db.profile.findMany({
            ...(take > 0 && { skip, take }),
            where,
            orderBy: {
                [orderBy]: orderDir
            },
            select: {
                id: true,
                fullName: true,
                ...(includeDepartments && {
                    accesses: {
                        select: {
                            department: true,
                            role: true
                        }
                    }
                })
            }
        }),
        db.profile.count(),
        db.profile.count({ where })
    ]);

    const profiles = includeDepartments ? foundProfiles.map(({ accesses, ...profile }) => ({
        ...profile,
        departments: [...new Map(accesses.map(access => (
            [access.department.id, access.department]
        ))).values()],
        roleId: accesses[0]?.role?.id || null,
        roleName: accesses[0]?.role?.name || null
    })) : foundProfiles;

    return {
        data: profiles,
        recordsTotal: total,
        recordsFiltered: filtered
    };
};

const DEFAULT_PROFILE_SELECT = {
    id: true,
    fullName: true
};

const PROFILE_WITH_ACCESSES_SELECT = {
    ...DEFAULT_PROFILE_SELECT,
    accesses: {
        select: {
            department: true,
            role: true
        }
    }
};

const findActiveProfileById = ({ tx, id, select }) => getDb(tx).profile.findUnique({
    where: {
        id,
        isActive: true
    },
    select
});

export const findProfileById = ({ tx, id, includeAccesses = false }) => findActiveProfileById({
    tx,
    id,
    select: includeAccesses ? PROFILE_WITH_ACCESSES_SELECT : DEFAULT_PROFILE_SELECT
});

const buildAccessData = ({ departments = [], roleId }) => departments.map(departmentId => ({
    roleId,
    departmentId
}));

export const createProfile = async ({ profileDto }) => {

    const db = getDb();

    try {

        const accesses = buildAccessData(profileDto);

        return await db.profile.create({
            data: {
                fullName: profileDto.fullName,
                ...(accesses.length && {
                    accesses: {
                        createMany: { data: accesses }
                    }
                })
            },
            select: PROFILE_WITH_ACCESSES_SELECT
        });

    } catch (err) {
        logServiceError(serviceLogger, err, { operation: 'admin.profileService' });

        throw new ProfileCreateDatabaseError();
    }
}

export const updateProfile = async ({ profileDto, id }) => {

    const db = getDb();

    try {
        const accesses = buildAccessData(profileDto);

        return await db.profile.update({
            where: { id },
            data: {
                fullName: profileDto.fullName,
                accesses: {
                    deleteMany: {},
                    ...(accesses.length && {
                        createMany: { data: accesses }
                    })
                }
            },
            select: PROFILE_WITH_ACCESSES_SELECT
        });

    } catch (err) {
        logServiceError(serviceLogger, err, { operation: 'admin.profileService' });

        throw new ProfileUpdateDatabaseError();
    }
}
