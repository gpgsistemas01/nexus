import { getDb } from '../../../repository/baseRepository.js';
import { findWasteTemplatePage } from '../../../repository/warehouse/wasteTemplateRepository.js';
import { toNumber } from '../../../utils/formattersUtils.js';

export const findWasteMaterialTemplates = async ({ search = '', skip = 0, take = 20, supplierId = null } = {}) => {
    if (!supplierId) return { data: [], recordsTotal: 0, recordsFiltered: 0 };

    const page = await findWasteTemplatePage({ supplierId, search, skip, take });
    const ids = page.filter(row => row.id).map(row => row.id);
    const total = Number(page[0]?.total ?? 0);
    if (!ids.length) return { data: [], recordsTotal: total, recordsFiltered: total };

    // Sólo se hidratan las relaciones de la página; se conserva el objeto Material.
    const materials = await getDb().material.findMany({
        where: { id: { in: ids } },
        select: {
            id: true,
            name: true,
            base: true,
            height: true,
            presentation: { select: { id: true, name: true } },
            unitMeasure: { select: { id: true, name: true, symbol: true } },
            supplierMaterials: {
                where: { supplierId, isActive: true },
                select: { maxUnitCost: true }
            }
        }
    });
    const byId = new Map(materials.map(material => [material.id, material]));
    return {
        data: page.filter(row => byId.has(row.id)).map(row => ({
            ...byId.get(row.id), maxUnitCost: toNumber(row.maxUnitCost)
        })),
        recordsTotal: total,
        recordsFiltered: total
    };
};
