// Contrato público de captura; modelos y claves internas permanecen en el servidor.
export const PUBLIC_CATALOGS = Object.freeze({
    departments: {
        fields: ['name', 'isActive'],
        maxLengths: { name: 50 },
        label: 'Áreas',
        entityLabel: 'área',
        createButtonLabel: 'Nueva área'
    },
    roles: {
        fields: ['name', 'isActive'],
        maxLengths: { name: 50 },
        label: 'Roles',
        entityLabel: 'rol',
        createButtonLabel: 'Nuevo rol'
    },
    presentations: {
        fields: ['name', 'isActive'],
        maxLengths: { name: 50 },
        label: 'Presentaciones',
        entityLabel: 'presentación',
        createButtonLabel: 'Nueva presentación'
    },
    'unit-measures': {
        fields: ['name', 'symbol', 'isActive'],
        maxLengths: { name: 20, symbol: 10 },
        label: 'Unidades de medida',
        entityLabel: 'unidad de medida',
        createButtonLabel: 'Nueva unidad de medida'
    },
    reasons: {
        fields: ['name', 'isActive'],
        maxLengths: { name: 100 },
        label: 'Motivos de ajuste',
        entityLabel: 'motivo de ajuste',
        createButtonLabel: 'Nuevo motivo de ajuste'
    },
    'fulfillment-statuses': {
        fields: ['name', 'isActive'],
        maxLengths: { name: 50 },
        label: 'Estados de cumplimiento',
        entityLabel: 'estado de cumplimiento',
        createButtonLabel: 'Nuevo estado de cumplimiento'
    }
});
