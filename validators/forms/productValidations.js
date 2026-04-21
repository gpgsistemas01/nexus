import { validateIsActive, validateName, validateNumberOptional, validateUUID } from "../fields/fieldsValidator.js";

export const productValidation = [
    validateName(200),
    validateUUID('supplierId'),
    validateNumberOptional('minStock', { disableTooLong: true }),
    validateNumberOptional('base'),
    validateNumberOptional('height'),
    validateIsActive
]
