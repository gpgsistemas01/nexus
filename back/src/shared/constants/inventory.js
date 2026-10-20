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

export const SQUARE_METER_UNIT_SYMBOLS = Object.freeze(['M²', 'M2', 'M^2']);
export const SQUARE_METER_UNIT_NAMES = Object.freeze(['METRO CUADRADO', 'METROS CUADRADOS']);
export const WASTE_SAMPLE_FIELDS = Object.freeze(['sampleLengthM', 'sampleNetWeightKg']);

export const WASTE_ROLL_WEIGHT_FIELDS = Object.freeze([
    'coneWeightKg',
    'totalWeightKg',
    'referenceRollTotalWeightKg'
]);

export const WASTE_IMMUTABLE_FIELDS = Object.freeze([
    'weightKg',
    ...WASTE_ROLL_WEIGHT_FIELDS,
    ...WASTE_SAMPLE_FIELDS,
    'sourceMaterialId'
]);

export const WASTE_OPERATION_ACTIONS = Object.freeze({
    CREATE: 'create',
    ADD_STOCK: 'add-stock'
});
