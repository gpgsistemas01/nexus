import { validateText } from "../fields/fieldsValidator.js";

export const clientValidation = [
    validateText({ fieldName: 'name', maxLength: 255 }),
];
