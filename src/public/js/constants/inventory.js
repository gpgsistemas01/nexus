export const WASTE_WEIGHT_LIMITS = Object.freeze({
    MIN: 0.01,
    MAX: 999.99,
    INTEGER_DIGITS: 3,
    DECIMAL_DIGITS: 2
});

export const INVENTORY_RESOURCES = Object.freeze({
    MATERIAL: 'material',
    CONSUMABLE: 'consumable'
});

export const MATERIAL_TYPES = Object.freeze({
    MATERIAL: 'MATERIAL',
    CONSUMABLE: 'CONSUMABLE'
});

export const MATERIAL_ROLL_REFERENCE_FIELDS = Object.freeze(['referenceConeWeightKg', 'referenceRollTotalWeightKg']);
