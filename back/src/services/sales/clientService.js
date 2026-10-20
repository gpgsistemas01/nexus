import { handleServiceError } from '../serviceErrorHandler.js';
import { normalizeDatabaseError } from '../../errors/databaseError.js';
import { PRISMA_ERROR_CODES } from '../../constants/prisma.js';
import { isAppError } from '../../errors/AppError.js';
import { updateVersionedRecord } from '../../repository/versionRepository.js';
import { findPage } from "../../repository/paginationRepository.js";
import { ClientCreateDatabaseError, ClientFindDatabaseError, ClientNotFound } from "../../errors/sales/clientError.js";
import { getDb } from "../../repository/baseRepository.js";
import { createServiceLogger, logServiceError } from "../../utils/logger.js";

const serviceLogger = createServiceLogger('sales.clientService');

const CLIENT_SELECT = {
    id: true,
    version: true,
    name: true,
    isActive: true
};

export const findAllClients = async ({
    cursor,
    advisorId,
    includeCounts = true,
    onlyActive = false,
    skip = 0,
    take = 10,
    search = '',
    orderBy = 'name',
    orderDir = 'asc'
}) => {

    const where = {
        ...(advisorId && { advisorId: advisorId }),
        ...(onlyActive && { isActive: true }),
        ...(search && {
            name: {
                contains: search,
                mode: 'insensitive'
            }
        })
    };

    return findPage({
        model: getDb().client,
        includeCounts,
        hasFilters: Boolean(advisorId || onlyActive || search),
        query: {
            ...(take > 0 && { skip, take }),
            ...(cursor && { cursor }),
            where,
            orderBy: [{ [orderBy]: orderDir }, { id: 'asc' }],
            select: CLIENT_SELECT
        }
    });
}

export const findClientById = async ({ tx = null, id }) => {

    const db = getDb(tx);
    const client = await db.client.findFirst({
        where: { id },
        select: CLIENT_SELECT
    });

    if (!client) throw new ClientNotFound();

    return client || null;
}

export const createClient = async ({ 
    tx = null, 
    clientDto 
}) => {

    const db = getDb(tx);

    try {

        const createdClient = await db.client.create({
            data: { ...clientDto }
        });

        return createdClient;

    } catch (err) {
        handleServiceError({
            logger: serviceLogger,
            error: err,
            operation: 'sales.clientService',
            fallbackError: new ClientCreateDatabaseError()
        });
    }
};

export const updateClient = async ({ 
    tx = null, 
    id, 
    clientDto 
}) => {

    const db = getDb(tx);

    try {

        const { expectedVersion, ...data } = clientDto;
        return await updateVersionedRecord({ model: db.client, where: { id }, expectedVersion, data });

    } catch (err) {
        logServiceError(serviceLogger, err, { operation: 'sales.clientService' });

        const normalizedError = normalizeDatabaseError(err);
        if (isAppError(normalizedError)) throw normalizedError;
        if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) throw new ClientNotFound();
        throw new ClientFindDatabaseError();
    }
}
