import { CatalogEntryConflict, CatalogEntryNotFound } from '../errors/catalogError.js';
import { getDb } from '../repository/baseRepository.js';

export const CATALOG_MODELS = Object.freeze({
    departments: 'department',
    roles: 'role',
    statuses: 'status',
    presentations: 'presentation',
    'unit-measures': 'unitMeasure',
    reasons: 'stockAdjustmentReason',
    'fulfillment-statuses': 'fulfillmentStatus'
});

const getCatalogModel = ({ catalog, tx }) => getDb(tx)[CATALOG_MODELS[catalog]];

const handleWriteError = error => {
    if (error?.code === 'P2002') throw new CatalogEntryConflict();
    if (error?.code === 'P2003') throw new CatalogEntryConflict('CATALOG_ENTRY_IN_USE');
    if (error?.code === 'P2025') throw new CatalogEntryNotFound();
    throw error;
};

export const findAllCatalogEntries = async ({
    catalog,
    skip = 0,
    take = 10,
    search = '',
    orderBy = 'name',
    orderDir = 'asc'
}) => {
    const model = getCatalogModel({ catalog });
    const where = search ? {
        name: { contains: search, mode: 'insensitive' }
    } : {};
    const select = {
        id: true,
        name: true,
        ...(catalog === 'unit-measures' && { symbol: true }),
        ...(catalog === 'reasons' && { isActive: true })
    };

    const [data, recordsTotal, recordsFiltered] = await Promise.all([
        model.findMany({ skip, take, where, orderBy: { [orderBy]: orderDir }, select }),
        model.count(),
        model.count({ where })
    ]);

    return { data, recordsTotal, recordsFiltered };
};

export const createCatalogEntry = async ({ catalog, data, tx }) => {
    try {
        return await getCatalogModel({ catalog, tx }).create({ data });
    } catch (error) {
        return handleWriteError(error);
    }
};

export const updateCatalogEntry = async ({ catalog, id, data, tx }) => {
    try {
        return await getCatalogModel({ catalog, tx }).update({ where: { id }, data });
    } catch (error) {
        return handleWriteError(error);
    }
};

export const deleteCatalogEntry = async ({ catalog, id, tx }) => {
    try {
        return await getCatalogModel({ catalog, tx }).delete({ where: { id } });
    } catch (error) {
        return handleWriteError(error);
    }
};
