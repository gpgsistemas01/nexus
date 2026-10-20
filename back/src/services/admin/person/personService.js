import { handleServiceError } from '../../serviceErrorHandler.js';
import { PRISMA_ERROR_CODES } from '../../../constants/prisma.js';
import { normalizeDatabaseError } from '../../../errors/databaseError.js';
import { isAppError } from '../../../errors/AppError.js';
import { updateVersionedRecord } from '../../../repository/versionRepository.js';
import { findPage } from '../../../repository/paginationRepository.js';
import {
    PersonCreateDatabaseError,
    PersonNotFound,
    PersonUpdateDatabaseError
} from "../../../errors/admin/personError.js";
import { getDb } from "../../../repository/baseRepository.js";
import { createServiceLogger, logServiceError } from "../../../utils/logger.js";

const serviceLogger = createServiceLogger('admin.personService');

export const findAllPersons = async ({
    cursor,
    departments = [],
    roles = [],
    includeAccesses = false,
    includeCounts = true,
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

    return findPage({
        model: db.person,
        includeCounts,
        query: {
            ...(take > 0 && { skip, take }),
            ...(cursor && { cursor }),
            where,
            orderBy: [{ [orderBy]: orderDir }, { id: 'asc' }],
            select: {
                id: true,
                version: true,
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
        }
    });
};

const DEFAULT_PERSON_SELECT = {
    id: true,
    version: true,
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
        handleServiceError({
            logger: serviceLogger,
            error: err,
            operation: 'admin.personService',
            fallbackError: new PersonCreateDatabaseError()
        });
    }
}

export const updatePerson = async ({ personDto, id }) => {

    const db = getDb();

    try {
        const accesses = buildAccessData(personDto);

        return await updateVersionedRecord({
            model: db.person, expectedVersion: personDto.expectedVersion,
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

        if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) throw new PersonNotFound();

        const normalizedError = normalizeDatabaseError(err);
        if (isAppError(normalizedError)) throw normalizedError;
        throw new PersonUpdateDatabaseError();
    }
}
