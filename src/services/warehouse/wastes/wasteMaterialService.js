import { getDb } from '../../../repository/baseRepository.js';
import { getMaterialIdentityWidth } from '../../inventory/materialIdentity.js';
import { toNumber } from '../../../utils/formattersUtils.js';
import { isRollPresentation } from '../../../public/js/utils/warehouseInventoryUtils.js';

const getHighestUnitCost = (offers = []) => offers.reduce((highest, offer) => {
    const cost = toNumber(offer.maxUnitCost);

    return cost == null ? highest : Math.max(highest ?? cost, cost);
}, null);

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
                select: { maxUnitCost: true, referenceConeWeightKg: true, referenceRollTotalWeightKg: true }
            }
        }
    });
    const uniqueTemplates = new Map();
    const familyCosts = new Map();

    materials.forEach(material => {
        const identityWidth = getMaterialIdentityWidth(material);
        const isRoll = isRollPresentation(material.presentation.name);
        const key = `${ material.name.trim().toLocaleLowerCase() }|${ identityWidth ?? 'no-width' }`;
        const maxUnitCost = getHighestUnitCost(material.supplierMaterials);
        familyCosts.set(key, maxUnitCost == null ? familyCosts.get(key) ?? null : Math.max(familyCosts.get(key) ?? maxUnitCost, maxUnitCost));
        const { supplierMaterials, ...template } = material;

        const templateKey = isRoll ? material.id : key;
        const current = uniqueTemplates.get(templateKey);
        if (!current) {
            const offer = supplierMaterials[0];
            uniqueTemplates.set(templateKey, {
                ...template,
                maxUnitCost,
                referenceConeWeightKg: isRoll ? offer?.referenceConeWeightKg ?? null : null,
                referenceRollTotalWeightKg: isRoll ? offer?.referenceRollTotalWeightKg ?? null : null
            });
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
