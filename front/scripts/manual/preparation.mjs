import { isRollPresentation } from '../../../back/src/shared/inventory/wasteMeasurements.js';

const PAGE_LIMIT = 100;
export const MANUAL_LOOKUP_PAGE_SIZE = 20;
const validMeasure = (value) => Number.isFinite(Number(value)) && Number(value) > 0;

export const findPreparedDocument = async (rows, prepare) => {
    for (let start = 0; start < rows.length; start += 4) {
        const results = await Promise.allSettled(
            rows.slice(start, start + 4).map((row) => Promise.resolve().then(() => prepare(row))),
        );
        const match = results.find((result) => result.status === 'fulfilled' && result.value);
        if (match) return match.value;
        const failed = results.find((result) => result.status === 'rejected');
        if (failed) throw failed.reason;
    }
    return null;
};

export const lookupPages = async function* (lookup, resource, supplierId = '') {
    let start = 0;
    for (let page = 1; page <= PAGE_LIMIT; page++) {
        const result = await lookup({ resource, supplierId, page, start });
        if (
            !Array.isArray(result?.data) ||
            !Number.isSafeInteger(result.recordsFiltered) ||
            result.recordsFiltered < 0
        )
            throw new Error('La preparación recibió un catálogo incompleto.');

        yield result.data;
        start += result.data.length;
        if (!result.data.length || start >= result.recordsFiltered) return;
    }
    throw new Error('La preparación excedió el límite de páginas del catálogo.');
};

export const findWasteReference = async (lookup) => {
    const visited = new Set();
    for await (const suppliers of lookupPages(lookup, 'suppliers')) {
        for (const supplier of suppliers) {
            if (typeof supplier?.id !== 'string' || typeof supplier.tradeName !== 'string')
                throw new Error('La preparación recibió un proveedor incompleto.');
            if (supplier.isActive === false || visited.has(supplier.id)) continue;

            visited.add(supplier.id);
            for await (const materials of lookupPages(
                lookup,
                'wastes/material-templates',
                supplier.id,
            )) {
                const material = materials.find(
                    (item) =>
                        typeof item?.id === 'string' &&
                        typeof item.name === 'string' &&
                        isRollPresentation(item.presentation?.name) &&
                        validMeasure(item.base) &&
                        validMeasure(item.height),
                );
                if (material) return { supplier, material };
            }
        }
    }
    throw new Error(
        'Preparación pendiente: se necesita un proveedor activo con un material ROLLO de referencia y medidas válidas. No se crean registros para obtener la captura.',
    );
};
