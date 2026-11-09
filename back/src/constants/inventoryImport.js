// Configuración del procesador XLSX; no forma parte de la captura ni del cliente Vue.
export const INVENTORY_IMPORT_PROCESSING_LIMITS = Object.freeze({
    maxUncompressedBytes: 16 * 1024 * 1024,
    maxZipEntries: 200,
    maxCatalogRows: 500,
    workerTimeoutMs: 10000
});

export const INVENTORY_IMPORT_FORMAT = 'NEXUS_INVENTORY_V2';
