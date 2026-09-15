export const MANAGED_CATALOGS = Object.freeze({
    departments: {
        model: 'department',
        fields: ['name', 'isActive'],
        maxLengths: { name: 50 },
        label: 'Áreas',
        entityLabel: 'área',
        createButtonLabel: 'Nueva área'
    },
    roles: {
        model: 'role',
        fields: ['name', 'isActive'],
        maxLengths: { name: 50 },
        label: 'Roles',
        entityLabel: 'rol',
        createButtonLabel: 'Nuevo rol'
    },
    presentations: {
        model: 'presentation',
        fields: ['name', 'isActive'],
        maxLengths: { name: 50 },
        label: 'Presentaciones',
        entityLabel: 'presentación',
        createButtonLabel: 'Nueva presentación'
    },
    'unit-measures': {
        model: 'unitMeasure',
        fields: ['name', 'symbol', 'isActive'],
        maxLengths: { name: 20, symbol: 10 },
        label: 'Unidades de medida',
        entityLabel: 'unidad de medida',
        createButtonLabel: 'Nueva unidad de medida'
    },
    reasons: {
        model: 'stockAdjustmentReason',
        fields: ['name', 'isActive'],
        maxLengths: { name: 100 },
        label: 'Motivos de ajuste',
        entityLabel: 'motivo de ajuste',
        createButtonLabel: 'Nuevo motivo de ajuste'
    },
    'fulfillment-statuses': {
        model: 'fulfillmentStatus',
        fields: ['name', 'isActive'],
        maxLengths: { name: 50 },
        label: 'Estados de cumplimiento',
        entityLabel: 'estado de cumplimiento',
        createButtonLabel: 'Nuevo estado de cumplimiento'
    }
});

export const MANAGED_CATALOG_NAMES = Object.freeze(Object.keys(MANAGED_CATALOGS));
