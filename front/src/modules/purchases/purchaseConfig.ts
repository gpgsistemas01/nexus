export const PURCHASE_CONFIG = {
    materials: {
        title: 'Compras de Materiales',
        label: 'Materiales',
        item: 'Material',
        path: 'materiales',
        type: 'MATERIAL',
    },
    consumables: {
        title: 'Compras de Consumibles',
        label: 'Consumibles',
        item: 'Consumible',
        path: 'consumibles',
        type: 'CONSUMABLE',
    },
} as const;

export const PURCHASE_DETAIL_LABELS = { costPerPresentation: 'Costo por presentación' } as const;
