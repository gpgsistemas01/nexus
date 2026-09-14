import { param } from 'express-validator';

import { MANAGED_CATALOG_NAMES, MANAGED_CATALOGS } from '../../constants/catalogs.js';
import { errorMap } from '../../messages/codeMessages.js';
import {
    validateBooleanWhen,
    validateTextWithDynamicMaxLength
} from '../fields/fieldsValidator.js';

const isCatalog = catalogName => req => req.params.catalog === catalogName;
const getCatalogMaxLength = fieldName => req => MANAGED_CATALOGS[req.params.catalog]?.maxLengths[fieldName];
export const catalogNameValidation = param('catalog')
    .isIn(MANAGED_CATALOG_NAMES)
    .withMessage(value => ({
        code: errorMap.catalog.NOT_FOUND,
        meta: { catalogName: value }
    }));

export const catalogEntryValidation = [
    catalogNameValidation,
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
        predicate: isCatalog('reasons')
    })
];

export const catalogEntryEditValidation = [
    ...catalogEntryValidation
];
