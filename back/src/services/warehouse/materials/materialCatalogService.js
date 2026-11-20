import { toNumber } from '../../../utils/formattersUtils.js';
import { CatalogFilterInvalid, CatalogValidationError } from '../../../errors/admin/catalogError.js';
import { PUBLIC_CATALOGS } from '../../../shared/constants/catalogs.js';
import { UUID_V4_PATTERN } from '../../../shared/constants/inputValidation.js';
import {
    MaterialAlreadyExists,
    MaterialCatalogDeleteConflict,
    MaterialCreateDatabaseError,
    MaterialIdentityLinkedConflict,
    MaterialNotFound,
    MaterialUpdateDatabaseError
} from '../../../errors/warehouse/materialError.js';
import { PRISMA_ERROR_CODES } from '../../../constants/prisma.js';
import { findPage } from '../../../repository/paginationRepository.js';
import { getDb } from '../../../repository/baseRepository.js';
import { assertRecordVersion, updateVersionedRecord } from '../../../repository/versionRepository.js';
import { preserveMaterialSpecifications } from '../../../repository/warehouse/materialDocumentRepository.js';
import { lockMaterialIdentity } from '../../../repository/warehouse/stockLockRepository.js';
import { MATERIAL_TYPES } from '../../../shared/constants/inventory.js';
import { materialCatalogValidation } from '../../../shared/validation/validators.js';
import { createMaterialSpecification, MATERIAL_SPECIFICATION_SELECT } from './materialDocumentSnapshot.js';
import {
    buildMaterialData,
    DEFAULT_MATERIAL_SNAPSHOT_SELECT,
    findMaterialByIdentity,
    prepareMaterialData,
    throwMaterialWriteError
} from './materialHelpers.js';
import { findMaterialsWithUsage } from './supplierMaterialService.js';

const MATERIAL_CATALOG_SELECT = Object.freeze({
    ...DEFAULT_MATERIAL_SNAPSHOT_SELECT,
    version: true,
    presentationId: true,
    _count: { select: { supplierMaterials: true } },
    unitMeasureId: true,
    unitMeasure: { select: { name: true, symbol: true } }
});

const materialFilterWhere = ({ type, presentationId, unitMeasureId }) => {
    const validId = value => value === undefined || (typeof value === 'string' && UUID_V4_PATTERN.test(value));
    if ((type !== undefined && !Object.values(MATERIAL_TYPES).includes(type))
        || !validId(presentationId) || !validId(unitMeasureId)) {
        throw new CatalogFilterInvalid();
    }
    return {
        ...(type && { type }),
        ...(presentationId && { presentationId }),
        ...(unitMeasureId && { unitMeasureId })
    };
};

export const findMaterialCatalogEntries = async ({
    skip = 0, take = 10, search = '', type = null, filters = {}, includeSupplierCount = true
} = {}) => {
    const totalWhere = type ? { type } : {};
    const where = {
        ...materialFilterWhere(filters),
        ...totalWhere,
        ...(search && { name: { contains: search, mode: 'insensitive' } })
    };
    const page = await findPage({
        model: getDb().material,
        totalWhere,
        query: {
            skip, take,
            where,
            select: { ...MATERIAL_CATALOG_SELECT, ...(!includeSupplierCount && { _count: false }) },
            orderBy: [{ name: 'asc' }, { id: 'asc' }]
        }
    });
    if (!includeSupplierCount) return page;

    // Un proveedor vinculado ya protege la identidad. Sólo consultamos historial para los demás.
    const withoutOffers = new Map();
    for (const article of page.data) {
        if (article._count.supplierMaterials === 0) withoutOffers.set(article.id, article);
    }
    if (withoutOffers.size) {
        const used = await findMaterialsWithUsage([...withoutOffers.keys()]);
        for (const { id } of used) withoutOffers.get(id).hasHistory = true;
    }
    return page;
};

export const createMaterialCatalogEntry = async data => {
    try {
        return await getDb().$transaction(async tx => {
            const { rest, relations } = await prepareMaterialData({ tx, materialDto: data, requireSupplier: false });
            if (await findMaterialByIdentity({ tx, rest, relations })) throw new MaterialAlreadyExists();
            return tx.material.create({ data: buildMaterialData({ rest, relations }), select: MATERIAL_CATALOG_SELECT });
        });
    } catch (err) { throwMaterialWriteError({ err, fallbackError: new MaterialCreateDatabaseError() }); }
};

export const materialCatalogIdentityChanged = (current, input) =>
    ['type', 'presentationId', 'unitMeasureId', 'base', 'height'].some(field =>
        input[field] !== undefined && String(input[field] ?? '') !== String(current[field] ?? ''));

export const updateMaterialCatalogEntry = async (id, input, { tx, context } = {}) => {
    try {
        const update = async db => {
            // Serializa la edición con los INSERT de relaciones que comprueban esta FK.
            await lockMaterialIdentity({ tx: db, id, forEditing: true });
            const current = await db.material.findUnique({
                where: { id },
                select: { ...MATERIAL_CATALOG_SELECT, ...MATERIAL_SPECIFICATION_SELECT }
            });
            if (!current) throw new MaterialNotFound();
            assertRecordVersion(current, input.expectedVersion);
            const identityChanged = materialCatalogIdentityChanged(current, input);
            let data = { name: input.name };
            let identity = { rest: { ...current, name: input.name }, relations: current };
            if (identityChanged) {
                if (current._count.supplierMaterials > 0) {
                    throw new MaterialIdentityLinkedConflict();
                }
                const capture = { ...current, base: toNumber(current.base),
                    height: toNumber(current.height), ...input };
                if (Object.entries(materialCatalogValidation).some(([field, rule]) => rule(capture[field], capture))) {
                    throw new CatalogValidationError(PUBLIC_CATALOGS.materials.label);
                }
                const { rest, relations } = await prepareMaterialData({ tx: db, context, requireSupplier: false,
                    materialDto: Object.fromEntries(Object.keys(materialCatalogValidation).map(field => [field, capture[field]])) });
                identity = { rest, relations };
                data = buildMaterialData({ rest, relations });
            }
            if ((identityChanged || input.name !== current.name) &&
                await findMaterialByIdentity({ tx: db, ...identity, excludeId: id })) {
                throw new MaterialAlreadyExists();
            }
            if (identityChanged) {
                await preserveMaterialSpecifications({
                    tx: db, materialId: id, type: current.type, specification: createMaterialSpecification(current)
                });
            }
            return updateVersionedRecord({ model: db.material, where: { id }, expectedVersion: input.expectedVersion,
                data, select: MATERIAL_CATALOG_SELECT });
        };
        return await (tx ? update(tx) : getDb().$transaction(update));
    } catch (err) { throwMaterialWriteError({ err, fallbackError: new MaterialUpdateDatabaseError() }); }
};

export const findMaterialCatalog = ({ skip = 0, take = 10, search = '', type = MATERIAL_TYPES.MATERIAL }) =>
    findMaterialCatalogEntries({ skip, take, search, type, includeSupplierCount: false });

export const deleteMaterialCatalogEntry = async id => {
    try {
        // PostgreSQL comprueba los vínculos y elimina el registro en la misma operación.
        return await getDb().material.delete({ where: { id }, select: { id: true } });
    } catch (error) {
        if (error.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) throw new MaterialNotFound();
        if (error.code === PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT) throw new MaterialCatalogDeleteConflict();
        throw error;
    }
};
