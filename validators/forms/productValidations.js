import { validateIsActive, validateName, validateNumberOptional } from "../fields/fieldsValidator.js";

export const productValidation = [
    validateName(200),
    validateNumberOptional('minStock', { disableTooLong: true }),
    validateNumberOptional('base'),
    validateNumberOptional('height'),
    validateIsActive
]
