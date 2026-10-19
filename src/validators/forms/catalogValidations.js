import { MANAGED_CATALOGS } from '../../constants/catalogs.js';
import { validateRecordVersion } from '../fields/versionValidator.js';
import {
    validateBooleanWhen,
    validateTextWithDynamicMaxLength
} from '../fields/fieldsValidator.js';

const isCatalog = catalogName => req => req.params.catalog === catalogName;
const catalogHasField = fieldName => req => MANAGED_CATALOGS[req.params.catalog]
    ?.fields.includes(fieldName);
const getCatalogMaxLength = fieldName => req => MANAGED_CATALOGS[req.params.catalog]?.maxLengths[fieldName];

export const catalogEntryValidation = [
    validateTextWithDynamicMaxLength({
        fieldName: 'name',
        getMaxLength: getCatalogMaxLength('name'),
        predicate: req => Boolean(MANAGED_CATALOGS[req.params.catalog])
    }),
    validateTextWithDynamicMaxLength({
        fieldName: 'symbol',
        getMaxLength: getCatalogMaxLength('symbol'),
        predicate: isCatalog('unit-measures')
    }),
    validateBooleanWhen({
        fieldName: 'isActive',
        predicate: catalogHasField('isActive')
    })
];

export const catalogEntryEditValidation = [
    ...catalogEntryValidation,
    validateRecordVersion()
];
