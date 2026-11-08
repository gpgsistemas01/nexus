export const INVENTORY_IMPORT_LIMITS = Object.freeze({
    maxBytes: 2 * 1024 * 1024,
    maxRows: 100,
    maxCellLength: 600,
    maxUncompressedBytes: 16 * 1024 * 1024,
    maxZipEntries: 200,
    maxCatalogRows: 500,
    workerTimeoutMs: 10000,
    draftHours: 24
});

export const INVENTORY_IMPORT_FORMAT = 'NEXUS_INVENTORY_V1';
