import { validateBoolean, validateText } from '../fields/fieldsValidator.js';

export const namedCatalogValidation = maxLength => [
    validateText({ fieldName: 'name', maxLength })
];

export const unitMeasureValidation = [
    ...namedCatalogValidation(20),
    validateText({ fieldName: 'symbol', maxLength: 10 })
];

export const reasonValidation = [
    ...namedCatalogValidation(100),
    validateBoolean('isActive')
];
