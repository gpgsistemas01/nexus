import { validateBoolean, validateNumberOptional, validateTextOptional } from '../fields/fieldsValidator.js';

export const createInventoryStateValidation = () => [
    validateNumberOptional('minStock', { disableTooLong: true }),
    validateBoolean('isActive')
];

export const createInventoryObservationsValidation = () => validateTextOptional({
    fieldName: 'observations',
    maxLength: 500
});
