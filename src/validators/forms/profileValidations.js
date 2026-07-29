import { body } from "express-validator";
import { validateName } from "../fields/fieldsValidator.js";

export const profileValidation = [
    validateName({ fieldName: 'fullName', maxLength: 255 }),
    body('accesses')
        .isArray({ min: 1 }).withMessage('Seleccione un área y un rol, y agréguelos a la tabla antes de guardar.'),
    body('accesses.*.departmentId')
        .isUUID('4').withMessage('Revise los accesos agregados y vuelva a seleccionar el área que ya no sea válida.'),
    body('accesses.*.roleId')
        .isUUID('4').withMessage('Revise los accesos agregados y vuelva a seleccionar el rol que ya no sea válido.'),
    body('accesses')
        .custom(accesses => new Set(accesses.map(access => access.departmentId)).size === accesses.length)
        .withMessage('Elimine el área repetida de la tabla; cada área solo puede tener un rol dentro del perfil.')
]
