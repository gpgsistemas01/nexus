import { getDb } from '../../../repository/baseRepository.js';
import { getMaterialIdentityWidth } from '../../inventory/materialIdentity.js';
import { toNumber } from '../../../utils/formattersUtils.js';

const WASTE_MATERIAL_SNAPSHOT_SELECT = {
    id: true,
    name: true,
    base: true,
    height: true,
    presentation: true,
    unitMeasure: true
};

const getHighestUnitCost = (offers = []) => offers.reduce((highest, offer) => {
    const cost = toNumber(offer.maxUnitCost);

    return cost == null ? highest : Math.max(highest ?? cost, cost);
}, null);

export const resolveWasteMaterialSnapshot = async ({ tx = null, materialId }) => {
    const db = getDb(tx);
    const material = await db.material.findUnique({
        where: { id: materialId },
        select: WASTE_MATERIAL_SNAPSHOT_SELECT
    });

    if (!material) return null;

    const identityWidth = getMaterialIdentityWidth(material);
    const matchingMaterials = await db.material.findMany({
        where: { name: { equals: material.name, mode: 'insensitive' } },
        select: {
            base: true,
            height: true,
            supplierMaterials: { select: { maxUnitCost: true } }
        }
    });
    const maxUnitCost = matchingMaterials.reduce((highest, candidate) => {
        if (getMaterialIdentityWidth(candidate) !== identityWidth) return highest;

        const candidateCost = getHighestUnitCost(candidate.supplierMaterials);

        return candidateCost == null
            ? highest
            : Math.max(highest ?? candidateCost, candidateCost);
    }, null);

    return { ...material, maxUnitCost };
};

export const findWasteMaterialTemplates = async ({ search = '', skip = 0, take = 20, supplierId = null } = {}) => {
    if (!supplierId) return {
        data: [],
        recordsTotal: 0,
        recordsFiltered: 0
    };

    const where = {
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
        supplierMaterials: { some: { supplierId } }
    };
    const materials = await getDb().material.findMany({
        where,
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            base: true,
            height: true,
            presentation: { select: { id: true, name: true } },
            unitMeasure: { select: { id: true, name: true, symbol: true } },
            supplierMaterials: {
                where: { supplierId },
                select: { maxUnitCost: true }
            }
        }
    });
    const uniqueTemplates = new Map();

    materials.forEach(material => {
        const identityWidth = getMaterialIdentityWidth(material);
        const isRoll = material.presentation.name.toUpperCase() === 'ROLLO';
        const suggestedWidth = isRoll ? identityWidth : null;
        const key = `${ material.name.trim().toLocaleLowerCase() }|${ identityWidth ?? 'no-width' }`;
        const maxUnitCost = getHighestUnitCost(material.supplierMaterials);
        const { supplierMaterials, ...template } = material;

        const current = uniqueTemplates.get(key);
        if (!current) {
            uniqueTemplates.set(key, { ...template, suggestedWidth, maxUnitCost });
            return;
        }

        current.maxUnitCost = maxUnitCost == null
            ? current.maxUnitCost
            : Math.max(current.maxUnitCost ?? maxUnitCost, maxUnitCost);
    });

    const templates = [...uniqueTemplates.values()];
    const data = templates.slice(skip, skip + take);

    return {
        data,
        recordsTotal: templates.length,
        recordsFiltered: templates.length
    };
};
