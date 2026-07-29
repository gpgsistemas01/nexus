import { validateArrayOfUUIDs, validateName, validateUUID } from "../fields/fieldsValidator.js";

export const profileValidation = [
    validateName({ fieldName: 'fullName', maxLength: 255 }),
    validateUUID('roleId'),
    validateArrayOfUUIDs({ fieldName: 'departments' })
]
