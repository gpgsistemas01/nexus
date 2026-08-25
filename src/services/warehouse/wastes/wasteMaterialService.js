import { getDb } from '../../../repository/baseRepository.js';
import { getMaterialIdentityWidth } from '../../inventory/materialIdentity.js';

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
            unitMeasure: { select: { id: true, name: true, symbol: true } }
        }
    });
    const uniqueTemplates = new Map();

    materials.forEach(material => {
        const identityWidth = getMaterialIdentityWidth(material);
        const isRoll = material.presentation.name.toUpperCase() === 'ROLLO';
        const suggestedWidth = isRoll ? identityWidth : null;
        const key = `${ material.name.trim().toLocaleLowerCase() }|${ identityWidth ?? 'no-width' }`;

        if (!uniqueTemplates.has(key)) uniqueTemplates.set(key, {
            ...material,
            suggestedWidth
        });
    });

    const data = [...uniqueTemplates.values()].slice(0, take);

    return {
        data,
        recordsTotal: data.length,
        recordsFiltered: data.length
    };
};
