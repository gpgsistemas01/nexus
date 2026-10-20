import { FORM_FIELD_LIMITS, MIN_STOCK_INPUT_FORMAT } from '../../shared/constants/inputValidation.js';
import { validateBoolean, validateNumberOptional, validateTextOptional } from '../fields/fieldsValidator.js';

export const createInventoryStateValidation = () => [
    validateNumberOptional('minStock', { format: MIN_STOCK_INPUT_FORMAT }),
    validateBoolean('isActive')
];

export const createInventoryObservationsValidation = () => validateTextOptional({
    fieldName: 'observations',
    maxLength: FORM_FIELD_LIMITS.OBSERVATIONS
});
