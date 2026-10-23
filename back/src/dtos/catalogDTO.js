// El registro del servidor determina los campos; el body nunca decide qué persistir.
export const createCatalogEntryDto = (catalog, input = {}) => Object.fromEntries(catalog.fields
    .filter(field => Object.hasOwn(input, field) && input[field] !== undefined)
    .map(field => [field, typeof input[field] === 'string' ? input[field].trim() : input[field]]));
