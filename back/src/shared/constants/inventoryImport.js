export const INVENTORY_IMPORT_LIMITS = Object.freeze({
    maxBytes: 2 * 1024 * 1024,
    maxRows: 100,
    maxCellLength: 600,
    maxUncompressedBytes: 16 * 1024 * 1024,
    maxZipEntries: 200,
    maxCatalogRows: 500,
    workerTimeoutMs: 10000,
    draftHours: 24,
    maxSearchLength: 200,
    maxTemplatePage: 999
});

export const INVENTORY_IMPORT_FORMAT = 'NEXUS_INVENTORY_V2';

export const INVENTORY_IMPORT_MODES = Object.freeze({
    CREATE: 'create',
    UPDATE: 'update',
    ADJUST: 'adjust'
});

export const INVENTORY_IMPORT_MODE_LABELS = Object.freeze({
    [INVENTORY_IMPORT_MODES.CREATE]: 'Alta',
    [INVENTORY_IMPORT_MODES.UPDATE]: 'Editar datos',
    [INVENTORY_IMPORT_MODES.ADJUST]: 'Ajustar existencias'
});

// Sólo para consultar y recuperar comprobantes anteriores; no admite nuevas escrituras.
export const LEGACY_INVENTORY_IMPORT_MODE = 'mixed';

export const INVENTORY_IMPORT_STATUSES = Object.freeze({
    DRAFT: 'DRAFT',
    COMPLETED: 'COMPLETED',
    CANCELED: 'CANCELED',
    EXPIRED: 'EXPIRED'
});

export const INVENTORY_IMPORT_ROW_ACTIONS = Object.freeze({
    CREATE: 'create',
    UPDATE: 'update',
    UNCHANGED: 'unchanged',
    ERROR: 'error'
});
