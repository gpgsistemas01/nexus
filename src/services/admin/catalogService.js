import { updateVersionedRecord } from '../../repository/versionRepository.js';
import { findPage } from '../../repository/paginationRepository.js';
import { MANAGED_CATALOGS } from '../../constants/catalogs.js';
import { PRISMA_ERROR_CODES } from '../../constants/prisma.js';
import {
    CatalogEntryNotFound,
    CatalogNotFound,
    CatalogValidationError
} from '../../errors/admin/catalogError.js';
import { getDb } from '../../repository/baseRepository.js';

const getCatalog = (catalogName) => {
    const catalog = MANAGED_CATALOGS[catalogName];
    if (!catalog) throw new CatalogNotFound(catalogName);
    return catalog;
};

const removeInternalKey = (catalog, entry) => {
    if (!catalog.hasStableKey || !entry) return entry;

    const publicEntry = { ...entry };
    delete publicEntry.key;
    return publicEntry;
};

const normalizeCatalogData = (catalog, input = {}) => Object.fromEntries(catalog.fields
    .filter(field => input[field] !== undefined)
    .map(field => [field, typeof input[field] === 'string' ? input[field].trim() : input[field]]));

const validateCatalogData = (catalog, data) => {
    const hasInvalidName = typeof data.name !== 'string' || !data.name;
    const hasInvalidSymbol = catalog.fields.includes('symbol')
        && (typeof data.symbol !== 'string' || !data.symbol);
    const hasInvalidActiveState = catalog.fields.includes('isActive')
        && typeof data.isActive !== 'boolean';
    const hasInvalidLength = Object.entries(catalog.maxLengths)
        .some(([field, maxLength]) => data[field]?.length > maxLength);

    if (hasInvalidName || hasInvalidSymbol || hasInvalidActiveState || hasInvalidLength) {
        throw new CatalogValidationError(catalog.label);
    }
};

export const findAllCatalogEntries = async (catalogName, { skip = 0, take = 10, search = '' } = {}) => {
    const catalog = getCatalog(catalogName);
    const model = getDb()[catalog.model];
    const where = search ? { name: { contains: search, mode: 'insensitive' } } : {};
    const page = await findPage({
        model: model,
        hasFilters: Boolean(search),
        query: {
            where,
            skip,
            take,
            orderBy: { name: 'asc' }
        }
    });

    return {
        ...page,
        data: page.data.map(entry => removeInternalKey(catalog, entry))
    };
};

export const createCatalogEntry = async (catalogName, input) => {
    const catalog = getCatalog(catalogName);
    const data = normalizeCatalogData(catalog, input);
    validateCatalogData(catalog, data);
    const entry = await getDb()[catalog.model].create({ data });
    return removeInternalKey(catalog, entry);
};

export const updateCatalogEntry = async (catalogName, id, input) => {
    const catalog = getCatalog(catalogName);
    const data = normalizeCatalogData(catalog, input);
    validateCatalogData(catalog, data);
    try {
        const entry = await updateVersionedRecord({
            model: getDb()[catalog.model],
            where: { id },
            data,
            expectedVersion: input.expectedVersion
        });
        return removeInternalKey(catalog, entry);
    } catch (error) {
        if ([
            PRISMA_ERROR_CODES.RECORD_NOT_FOUND,
            PRISMA_ERROR_CODES.INCONSISTENT_COLUMN_DATA
        ].includes(error?.code)) {
            throw new CatalogEntryNotFound(catalog.label);
        }
        throw error;
    }
};

export const getManagedCatalog = (catalogName) => {
    const catalog = getCatalog(catalogName);
    return {
        name: catalogName,
        fields: [...catalog.fields],
        maxLengths: { ...catalog.maxLengths },
        label: catalog.label,
        entityLabel: catalog.entityLabel,
        createButtonLabel: catalog.createButtonLabel
    };
};
