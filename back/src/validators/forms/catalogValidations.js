import { findManagedCatalog } from '../../constants/catalogs.js';
import { validateRecordVersion } from '../fields/versionValidator.js';
import {
    validateBoolean,
    validateText
} from '../fields/fieldsValidator.js';

const isCatalog = catalogName => (_, { req }) => req.params.catalog === catalogName;
const catalogHasField = fieldName => (_, { req }) => findManagedCatalog(req.params.catalog)
    ?.fields.includes(fieldName);
const getCatalogMaxLength = fieldName => req => findManagedCatalog(req.params.catalog)?.maxLengths[fieldName];

export const catalogEntryValidation = [
    validateText({
        fieldName: 'name',
        maxLength: getCatalogMaxLength('name'),
        condition: (_, { req }) => Boolean(findManagedCatalog(req.params.catalog))
    }),
    validateText({
        fieldName: 'symbol',
        maxLength: getCatalogMaxLength('symbol'),
        condition: isCatalog('unit-measures')
    }),
    validateBoolean('isActive', { condition: catalogHasField('isActive') })
];

export const catalogEntryEditValidation = [
    ...catalogEntryValidation,
    validateRecordVersion()
];
