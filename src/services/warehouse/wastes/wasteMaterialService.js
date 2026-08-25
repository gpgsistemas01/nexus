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
        select: { id: true, base: true, height: true }
    });
    const materialIds = matchingMaterials
        .filter(candidate => getMaterialIdentityWidth(candidate) === identityWidth)
        .map(candidate => candidate.id);
    const cost = await db.supplierMaterial.aggregate({
        where: { materialId: { in: materialIds } },
        _max: { maxUnitCost: true }
    });

    return { ...material, maxUnitCost: cost._max.maxUnitCost };
};

export const findWasteMaterialTemplates = async ({ search = '', take = 20 } = {}) => {
    const where = search ? {
        name: { contains: search, mode: 'insensitive' }
    } : {};
    const materials = await getDb().material.findMany({
        where,
        take: take * 5,
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            base: true,
            height: true,
            presentation: { select: { id: true, name: true } },
            unitMeasure: { select: { id: true, name: true, symbol: true } },
            supplierMaterials: { select: { maxUnitCost: true } }
        }
    });
    const uniqueTemplates = new Map();

    materials.forEach(material => {
        const identityWidth = getMaterialIdentityWidth(material);
        const isRoll = material.presentation.name.toUpperCase() === 'ROLLO';
        const suggestedWidth = isRoll ? identityWidth : null;
        const key = `${ material.name.trim().toLocaleLowerCase() }|${ identityWidth ?? 'no-width' }`;
        const maxUnitCost = (material.supplierMaterials ?? []).reduce((highest, offer) => {
            const cost = toNumber(offer.maxUnitCost);

            return cost == null ? highest : Math.max(highest ?? cost, cost);
        }, null);
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

    const data = [...uniqueTemplates.values()].slice(0, take);

    return {
        data,
        recordsTotal: data.length,
        recordsFiltered: data.length
    };
};
