import { findPage } from '../../repository/paginationRepository.js';
import { UserCreateDatabaseError, UserFindDatabaseError, UserNotFound, UserUpdateDatabaseError } from "../../errors/admin/userError.js";
import { getDb } from "../../repository/baseRepository.js";
import { verifyPassword, encryptPassword } from "../../utils/encryptionUtils.js";
import { createServiceLogger, logServiceError } from "../../utils/logger.js";
import { getGrantedPermissions, getOrganizationContext } from "../../constants/permissions.js";
import { hasSystemWideReadAccess } from "../../utils/authorizationUtils.js";
import { findPersonById } from "./person/personService.js";

const serviceLogger = createServiceLogger('admin.userService');


export const findAllUsers = async ({
    includeCounts = true,
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

    try {

        const db = getDb();

        const page = await findPage({
            model: db.user,
            includeCounts,
            query: {
                ...(take > 0 && { skip, take }),
                where,
                orderBy: {
                    [orderBy]: orderDir
                },
                select: {
                    id: true,
                    name: true,
                    personId: true,
                    person: { select: { fullName: true } },
                    accesses: {
                        select: {
                            roleId: true,
                            departmentId: true,
                            role: {
                                select: {
                                    name: true
                                }
                            },
                            department: {
                                select: {
                                    name: true
                                }
                            }
                        },
                        take: 1
                    }
                }
            }
        });

        const data = page.data.map((user) => ({
            ...user,
            roleId: user.accesses?.[0]?.roleId || null,
            roleName: user.accesses?.[0]?.role?.name || null,
            departmentId: user.accesses?.[0]?.departmentId || null,
            departmentName: user.accesses?.[0]?.department?.name || null
        }));

        return {
            ...page,
            data
        };

    } catch (err) {
        logServiceError(serviceLogger, err, { operation: 'admin.userService' });
        throw new UserFindDatabaseError();
    }
};

export const getUserIdByLogin = async (name, password) => {

    const user = await getDb().user.findUnique({
        where: {
            name: name,
        },
        select: {
            id: true,
            password: true,
            isActive: true,
            personId: true,
            person: {
                select: { isActive: true }
            },
            accesses: {
                where: {
                    role: { is: { isActive: true } },
                    department: { is: { isActive: true } }
                },
                select: { userId: true },
                take: 1
            }
        }
    });

    const hasInactiveHumanPerson = user?.personId && !user.person?.isActive;

    if (!user?.isActive || hasInactiveHumanPerson || !user.accesses.length) return null;

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) return null;

    return user.id;
}

export const getLoggedUser = async (userId) => {

    const accesses = await getDb().userRoleDepartment.findMany({
        where: {
            userId,
            user: {
                isActive: true,
                OR: [
                    { personId: null },
                    { person: { is: { isActive: true } } }
                ]
            },
            role: { is: { isActive: true } },
            department: { is: { isActive: true } }
        },
        select: {
            user: { select: { id: true, name: true } },
            role: { select: { id: true, key: true, name: true } },
            department: { select: { id: true, key: true, name: true } }
        }
    });

    if (!accesses.length) return null;

    const user = {
        id: accesses[0].user.id,
        name: accesses[0].user.name,
        accesses: accesses.map(a => ({
            roleId: a.role.id,
            roleKey: a.role.key,
            role: a.role.name,
            departmentId: a.department.id,
            departmentKey: a.department.key,
            department: a.department.name
        }))
    };
    return {
        ...user,
        permissions: getGrantedPermissions(user.accesses),
        scope: {
            canReadAll: hasSystemWideReadAccess(user),
            departmentIds: [...new Set(user.accesses.map(access => access.departmentId))]
        },
        organization: getOrganizationContext(user.accesses)
    };
}

export const createUser = async ({ userDto }) => {

    try {

        const db = getDb();

        const { password, personId, roleId, departmentId, ...userData } = userDto;
        const hashedPassword = await encryptPassword(password);

        if (personId) {
            const person = await findPersonById({ id: personId });

            if (!person) throw new UserCreateDatabaseError();
        }

        return await db.user.create({
            data: {
                ...userData,
                password: hashedPassword,
                ...(personId && {
                    person: {
                        connect: {
                            id: personId
                        }
                    }
                }),
                accesses: {
                    create: {
                        role: {
                            connect: {
                                id: roleId
                            }
                        },
                        department: {
                            connect: {
                                id: departmentId
                            }
                        }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                personId: true
            }
        });

    } catch (err) {
        logServiceError(serviceLogger, err, { operation: 'admin.userService' });

        throw new UserCreateDatabaseError();
    }
};

const assertUserExists = async ({ id }) => {

    const db = getDb();
    const user = await db.user.findUnique({
        where: { id },
        select: { id: true }
    });

    if (!user) throw new UserNotFound();
};

export const updateUser = async ({ id, userDto }) => {

    try {
        await assertUserExists({ id });

        const db = getDb();

        return await db.$transaction(async (tx) => {
            const { name, personId, roleId, departmentId } = userDto;

            if (personId) {
                const person = await findPersonById({ tx, id: personId });

                if (!person) throw new UserUpdateDatabaseError();
            }

            const updated = await tx.user.update({
                where: { id },
                data: {
                    name,
                    personId
                },
                select: {
                    id: true,
                    name: true,
                    personId: true
                }
            });

            await tx.userRoleDepartment.deleteMany({
                where: {
                    userId: id
                }
            });
            await tx.userRoleDepartment.create({
                data: {
                    userId: id,
                    roleId,
                    departmentId
                }
            });

            return updated;
        });

    } catch (err) {
        logServiceError(serviceLogger, err, { operation: 'admin.userService' });

        if (err instanceof UserNotFound) throw err;

        throw new UserUpdateDatabaseError();
    }
};

export const updateUserPassword = async ({ id, userDto }) => {

    try {
        await assertUserExists({ id });

        const db = getDb();

        const hashedPassword = await encryptPassword(userDto.password);

        return await db.user.update({
            where: { id },
            data: { password: hashedPassword },
            select: { id: true }
        });

    } catch (err) {
        logServiceError(serviceLogger, err, { operation: 'admin.userService' });

        if (err instanceof UserNotFound) throw err;

        throw new UserUpdateDatabaseError();
    }
};
