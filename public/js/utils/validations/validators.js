import { isEmptyOrNull } from "./baseValidations.js";
import { validateName, validateNumberphone, validatePassword, validateNumber, validateUsername, validateTextOptional, validateMeasure, validateDateOptional, validateDetailsArray, validateDate, validateText, validateNumberOptional } from "./fieldValidations.js";

export const supplierValidators = {
    legalName: (value) => validateText(value, 200, 'La razón social'),
    tradeName: (value) => validateText(value, 100, 'El nombre comercial'),
    numberphone: validateNumberphone,
}

export const productValidators = {
    name: (value) => validateName(value, 200),
    supplierId: (value) => isEmptyOrNull(value, 'El proveedor'),
    minStock: (value) => validateNumberOptional(value, 'El stock mínimo'),
    base: (value) => validateNumberOptional(value, 'La base'),
    height: (value) => validateNumberOptional(value, 'La altura'),
}

export const loginValidators = {
    name: validateUsername,
    password: validatePassword,
}

export const validateGoodsReceiptValidators = {
    receivedById: (value) => isEmptyOrNull(value, 'El recibidor'),
    supplierId: (value) => isEmptyOrNull(value, 'El proveedor'),
    observations: (value) => validateTextOptional(value, 'Las observaciones'),
    receptionDate: (value) => validateDate(value, 'La fecha de recepción'),
    details: validateDetailsArray
}

export const validateGoodsIssueValidators = {
    requesterId: (value) => isEmptyOrNull(value, 'El solicitante'),
    projectId: (value) => isEmptyOrNull(value, 'El proyecto'),
    observations: (value) => validateTextOptional(value, 'Las observaciones'),
    requestDate: (value) => validateDate(value, 'La fecha de solicitud'),
    details: validateDetailsArray
}

export const validatePurchaseRequisitionValidators = {
    projectId: (value) => isEmptyOrNull(value, 'El proyecto'),
    observations: (value) => validateTextOptional(value, 'Las observaciones'),
    requestDate: (value) => validateDate(value, 'La fecha de solicitud'),
    details: validateDetailsArray
};
