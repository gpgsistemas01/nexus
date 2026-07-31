import { PersonCreateDatabaseError, PersonUpdateDatabaseError } from "../../../errors/admin/personError.js";
import { getDb } from "../../../repository/baseRepository.js";
import { createServiceLogger, logServiceError } from "../../../utils/logger.js";

const serviceLogger = createServiceLogger('admin.personService');


export const findAllPersons = async ({
    departments = [],
    roles = [],
    includeAccesses = false,
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

    const [foundPersons, total, filtered] = await Promise.all([
        db.person.findMany({
            ...(take > 0 && { skip, take }),
            where,
            orderBy: {
                [orderBy]: orderDir
            },
            select: {
                id: true,
                fullName: true,
                ...(includeAccesses && {
                    accesses: {
                        select: {
                            department: true,
                            role: true
                        }
                    }
                })
            }
        }),
        db.person.count(),
        db.person.count({ where })
    ]);

    return {
        data: foundPersons,
        recordsTotal: total,
        recordsFiltered: filtered
    };
};

const DEFAULT_PERSON_SELECT = {
    id: true,
    fullName: true
};

const PERSON_WITH_ACCESSES_SELECT = {
    ...DEFAULT_PERSON_SELECT,
    accesses: {
        select: {
            department: true,
            role: true
        }
    }
};

const findActivePersonById = ({ tx, id, select }) => getDb(tx).person.findUnique({
    where: {
        id,
        isActive: true
    },
    select
});

export const findPersonById = ({ tx, id, includeAccesses = false }) => findActivePersonById({
    tx,
    id,
    select: includeAccesses ? PERSON_WITH_ACCESSES_SELECT : DEFAULT_PERSON_SELECT
});

const buildAccessData = ({ accesses = [] }) => accesses.map(({ departmentId, roleId }) => ({
    departmentId,
    roleId
}));

export const createPerson = async ({ personDto }) => {

    const db = getDb();

    try {

        const accesses = buildAccessData(personDto);

        return await db.person.create({
            data: {
                fullName: personDto.fullName,
                ...(accesses.length && {
                    accesses: {
                        createMany: { data: accesses }
                    }
                })
            },
            select: PERSON_WITH_ACCESSES_SELECT
        });

    } catch (err) {
        logServiceError(serviceLogger, err, { operation: 'admin.personService' });

        throw new PersonCreateDatabaseError();
    }
}

export const updatePerson = async ({ personDto, id }) => {

    const db = getDb();

    try {
        const accesses = buildAccessData(personDto);

        return await db.person.update({
            where: { id },
            data: {
                fullName: personDto.fullName,
                accesses: {
                    deleteMany: {},
                    ...(accesses.length && {
                        createMany: { data: accesses }
                    })
                }
            },
            select: PERSON_WITH_ACCESSES_SELECT
        });

    } catch (err) {
        logServiceError(serviceLogger, err, { operation: 'admin.personService' });

        throw new PersonUpdateDatabaseError();
    }
}
