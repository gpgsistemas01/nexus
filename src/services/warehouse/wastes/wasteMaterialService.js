import { getDb } from '../../../repository/baseRepository.js';
import { getMaterialIdentityWidth } from '../../inventory/materialIdentity.js';
import { toNumber } from '../../../utils/formattersUtils.js';
import { isRollPresentation } from '../../../public/js/utils/warehouseInventoryUtils.js';

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
        const width = getMaterialIdentityWidth(material);
        const key = `${ material.name.trim().toLocaleLowerCase() }|${ width ?? 'no-width' }`;
        const cost = toNumber(material.supplierMaterials[0]?.maxUnitCost);
        const highest = familyCosts.get(key) ?? null;
        familyCosts.set(key, cost == null ? highest : Math.max(highest ?? cost, cost));

        const templateKey = isRollPresentation(material.presentation.name) ? material.id : key;
        if (!uniqueTemplates.has(templateKey)) uniqueTemplates.set(templateKey, { material, key });
    });

    const templates = Array.from(uniqueTemplates.values(), ({ material, key }) => ({
        ...material,
        maxUnitCost: familyCosts.get(key)
    }));
    const data = templates.slice(skip, skip + take);

    return {
        data,
        recordsTotal: templates.length,
        recordsFiltered: templates.length
    };
};
