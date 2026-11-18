// El registro del servidor determina los campos; el body nunca decide qué persistir.
export const createCatalogEntryDto = (catalog, input = {}) => Object.fromEntries(catalog.fields
    .filter(field => Object.hasOwn(input, field) && input[field] !== undefined)
    .map(field => [field, catalog.model === 'material' && ['base', 'height', 'minStock'].includes(field)
        ? (input[field] == null || input[field] === '' ? (field === 'minStock' ? 0 : null) : Number(input[field]))
        : typeof input[field] === 'string' ? (field === 'name' && ['presentation', 'unitMeasure'].includes(catalog.model)
        ? input[field].trim().toUpperCase() : input[field].trim()) : input[field]]));
