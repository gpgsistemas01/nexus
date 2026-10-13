import { getDb } from '../../../repository/baseRepository.js';
import { getMaterialIdentityLength, getMaterialIdentityWidth } from '../../inventory/materialIdentity.js';
import { toNumber } from '../../../utils/formattersUtils.js';

const WASTE_MATERIAL_SNAPSHOT_SELECT = {
    id: true,
    name: true,
    type: true,
    base: true,
    height: true,
    presentation: true,
    unitMeasure: true
};

const getHighestUnitCost = (offers = []) => offers.reduce((highest, offer) => {
    const cost = toNumber(offer.maxUnitCost);

    return cost == null ? highest : Math.max(highest ?? cost, cost);
}, null);

export const resolveWasteMaterialSnapshot = async ({ tx = null, materialId, supplierId = null, requireActive = true }) => {
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
            supplierMaterials: {
                where: { isActive: true },
                select: { maxUnitCost: true }
            }
        }
    });
    const maxUnitCost = matchingMaterials.reduce((highest, candidate) => {
        if (getMaterialIdentityWidth(candidate) !== identityWidth) return highest;

        const candidateCost = getHighestUnitCost(candidate.supplierMaterials);

        return candidateCost == null
            ? highest
            : Math.max(highest ?? candidateCost, candidateCost);
    }, null);

    let rollReference = null;
    if (requireActive && supplierId) {
        const activeOffer = await db.supplierMaterial.findUnique({
            where: { supplierId_materialId: { supplierId, materialId } },
            select: { isActive: true, coneWeightMode: true, referenceConeWeightKg: true, referenceRollTotalWeightKg: true, referenceRollNetWeightKg: true }
        });

        if (!activeOffer?.isActive) return null;
        rollReference = { ...activeOffer, referenceLengthM: getMaterialIdentityLength(material), referenceWidthM: identityWidth };
    }

    return { ...material, maxUnitCost, rollReference };
};

export const findWasteMaterialTemplates = async ({ search = '', skip = 0, take = 20, supplierId = null } = {}) => {
    if (!supplierId) return {
        data: [],
        recordsTotal: 0,
        recordsFiltered: 0
    };

    const where = {
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
        supplierMaterials: { some: { supplierId, isActive: true } }
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
                where: { supplierId, isActive: true },
                select: { maxUnitCost: true, coneWeightMode: true, referenceConeWeightKg: true, referenceRollTotalWeightKg: true, referenceRollNetWeightKg: true }
            }
        }
    });
    const uniqueTemplates = new Map();
    const familyCosts = new Map();

    materials.forEach(material => {
        const identityWidth = getMaterialIdentityWidth(material);
        const isRoll = material.presentation.name.toUpperCase() === 'ROLLO';
        const suggestedWidth = isRoll ? identityWidth : null;
        const key = `${ material.name.trim().toLocaleLowerCase() }|${ identityWidth ?? 'no-width' }`;
        const maxUnitCost = getHighestUnitCost(material.supplierMaterials);
        familyCosts.set(key, maxUnitCost == null ? familyCosts.get(key) ?? null : Math.max(familyCosts.get(key) ?? maxUnitCost, maxUnitCost));
        const { supplierMaterials, ...template } = material;

        const templateKey = isRoll ? material.id : key;
        const current = uniqueTemplates.get(templateKey);
        if (!current) {
            uniqueTemplates.set(templateKey, { ...template, suggestedWidth, maxUnitCost, rollReference: { ...supplierMaterials[0], referenceLengthM: getMaterialIdentityLength(material), referenceWidthM: identityWidth } });
            return;
        }

        current.maxUnitCost = maxUnitCost == null
            ? current.maxUnitCost
            : Math.max(current.maxUnitCost ?? maxUnitCost, maxUnitCost);
    });

    const templates = [...uniqueTemplates.values()].map(template => ({
        ...template,
        maxUnitCost: familyCosts.get(`${ template.name.trim().toLocaleLowerCase() }|${ getMaterialIdentityWidth(template) ?? 'no-width' }`)
    }));
    const data = templates.slice(skip, skip + take);

    return {
        data,
        recordsTotal: templates.length,
        recordsFiltered: templates.length
    };
};
