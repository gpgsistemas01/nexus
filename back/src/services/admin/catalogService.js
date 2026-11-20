import { materialCatalogValidation, materialCatalogEditValidation } from '../../shared/validation/validators.js';
import { findMaterialCatalogEntries, createMaterialCatalogEntry, updateMaterialCatalogEntry } from '../warehouse/materials/materialCatalogService.js';
import { assertRecordVersion, updateVersionedRecord } from '../../repository/versionRepository.js';
import { findPage } from '../../repository/paginationRepository.js';
import { findManagedCatalog } from '../../constants/catalogs.js';
import { PRISMA_ERROR_CODES } from '../../constants/prisma.js';
import {
    CatalogEntryNotFound,
    CatalogMeasurementInUse,
    CatalogNotFound,
    CatalogValidationError
} from '../../errors/admin/catalogError.js';
import { getDb } from '../../repository/baseRepository.js';
import { createCatalogEntryDto } from '../../dtos/catalogDTO.js';
import { normalizeDatabaseError, RecordIdentifierInvalid } from '../../errors/databaseError.js';

const getCatalog = (catalogName) => {
    const catalog = findManagedCatalog(catalogName);
    if (!catalog) throw new CatalogNotFound(catalogName);
    return catalog;
};

const removeInternalKey = (catalog, entry) => {
    if (!catalog.hasStableKey || !entry) return entry;

    const publicEntry = { ...entry };
    delete publicEntry.key;
    return publicEntry;
};

const validateCatalogData = (catalog, data, isEditing = false) => {
    if (catalog.model === 'material') {
        const rules = isEditing ? materialCatalogEditValidation : materialCatalogValidation;
        if (Object.entries(rules).some(([field, rule]) => rule(data[field], data))) throw new CatalogValidationError(catalog.label);
        return;
    }
    const hasInvalidName = typeof data.name !== 'string' || !data.name;
    const hasInvalidSymbol = catalog.fields.includes('symbol')
        && (typeof data.symbol !== 'string' || !data.symbol);
    const hasInvalidActiveState = catalog.fields.includes('isActive')
        && typeof data.isActive !== 'boolean';
    const hasInvalidLength = Object.entries(catalog.maxLengths)
        .some(([field, maxLength]) => typeof data[field] === 'string' && Array.from(data[field]).length > maxLength);

    if (hasInvalidName || hasInvalidSymbol || hasInvalidActiveState || hasInvalidLength) {
        throw new CatalogValidationError(catalog.label);
    }
};

export const findAllCatalogEntries = async (catalogName, { skip = 0, take = 10, search = '', filters } = {}) => {
    const catalog = getCatalog(catalogName);
    if (catalog.model === 'material') return findMaterialCatalogEntries({ skip, take, search, filters });
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
    const data = createCatalogEntryDto(catalog, input);
    validateCatalogData(catalog, data);
    if (catalog.model === 'material') return createMaterialCatalogEntry(data);
    const entry = await getDb()[catalog.model].create({ data });
    return removeInternalKey(catalog, entry);
};

export const updateCatalogEntry = async (catalogName, id, input) => {
    const catalog = getCatalog(catalogName);
    const data = createCatalogEntryDto(catalog, input);
    validateCatalogData(catalog, data, true);
    if (catalog.model === 'material') return updateMaterialCatalogEntry(id, { ...data, expectedVersion: input.expectedVersion });
    const modelName = catalog.model;
    const isMeasurement = modelName === 'presentation' || modelName === 'unitMeasure';
    try {
        const db = getDb();
        const updateEntry = model => updateVersionedRecord({
            model,
            where: { id },
            data,
            expectedVersion: input.expectedVersion
        });
        const entry = isMeasurement ? await db.$transaction(async tx => {
            const table = modelName === 'presentation'
                ? await tx.$queryRaw`SELECT "name", "version" FROM "Presentation" WHERE "id" = ${id}::uuid FOR UPDATE`
                : await tx.$queryRaw`SELECT "name", "symbol", "version" FROM "UnitMeasure" WHERE "id" = ${id}::uuid FOR UPDATE`;
            const [current] = table;
            if (!current) throw new CatalogEntryNotFound(catalog.label);
            assertRecordVersion(current, input.expectedVersion);

            if (data.name !== current.name || (data.symbol !== undefined && data.symbol !== current.symbol)) {
                const inUse = await tx[modelName].findFirst({
                    where: { id, OR: [{ materials: { some: {} } }, { wastes: { some: {} } }] },
                    select: { id: true }
                });
                if (inUse) throw new CatalogMeasurementInUse();
            }
            return updateEntry(tx[modelName]);
        }) : await updateEntry(db[modelName]);
        return removeInternalKey(catalog, entry);
    } catch (error) {
        if ([
            PRISMA_ERROR_CODES.RECORD_NOT_FOUND,
            PRISMA_ERROR_CODES.INCONSISTENT_COLUMN_DATA
        ].includes(error?.code) || (isMeasurement && normalizeDatabaseError(error) instanceof RecordIdentifierInvalid)) {
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
