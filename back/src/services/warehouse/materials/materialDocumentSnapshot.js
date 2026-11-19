import { MaterialSpecificationChangedConflict } from '../../../errors/warehouse/materialError.js';

export const materialDetailTypeWhere = type => ({
    OR: [{ materialType: type }, { materialType: null, material: { type } }]
});

export const materialDocumentDetailsWhere = type => ({
    some: {},
    none: {
        OR: [
            { materialType: { not: type } },
            { materialType: null, material: { type: { not: type } } }
        ]
    }
});

export const MATERIAL_SPECIFICATION_SELECT = {
    type: true,
    base: true,
    height: true,
    presentation: { select: { id: true, name: true } },
    unitMeasure: { select: { id: true, name: true, symbol: true } }
};

const measurement = value => value == null ? null : String(value);

export const createMaterialSpecification = material => ({
    type: material.type,
    base: measurement(material.base),
    height: measurement(material.height),
    presentation: material.presentation,
    unitMeasure: material.unitMeasure
});

export const getMaterialDetailSpecification = detail => detail.materialSpecification ?? detail.material;

export const assertMaterialDetailMatchesInventory = (detail, material) => {
    const stored = detail.materialSpecification;
    if (!stored) return;
    if (stored.type !== material.type ||
        stored.base !== measurement(material.base) || stored.height !== measurement(material.height) ||
        stored.presentation.id !== material.presentation.id || stored.presentation.name !== material.presentation.name ||
        stored.unitMeasure.id !== material.unitMeasure.id || stored.unitMeasure.name !== material.unitMeasure.name ||
        stored.unitMeasure.symbol !== material.unitMeasure.symbol) {
        throw new MaterialSpecificationChangedConflict();
    }
};
