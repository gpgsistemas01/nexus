import { FORM_FIELD_LIMITS, MIN_STOCK_INPUT_FORMAT, MONEY_INPUT_FORMAT, PERSON_NAME_PATTERN } from '../../constants/inputValidation.js';
import { AUTH_FIELD_LIMITS } from '../../constants/auth.js';
import { isEmptyOrNull, isString, isLengthInRangeMax } from "./baseValidations.js";
import { isRollPresentation } from '../warehouseInventoryUtils.js';
import { validateUUID, validateBoolean, validateWasteWeightCapture, validateName, validatePassword, validateNumber, validateUsername, validateTextOptional, validateGoodsReceiptDetailsArray, validateDate, validateText, validateNumberOptional, validateGoodsIssueDetailsArray, validatePairedOptionalNumber, validatePositiveNumber, validatePersonAccessesArray, validateWasteIssueDetailsArray, validateInvoice } from "./fieldValidations.js";

const inventoryStateValidation = {
    minStock: (value) => validateNumberOptional(value, 'El stock mínimo', { format: MIN_STOCK_INPUT_FORMAT }),
    isActive: (value) => validateBoolean(value, 'El estado del inventario')
};

const createInventoryStockValidation = ({ validateStock, stockFieldName }) => ({
    newStock: value => validateStock(value, stockFieldName),
    reasonId: value => validateUUID(value, 'La razón de ajuste'),
    observations: value => validateTextOptional(value, FORM_FIELD_LIMITS.OBSERVATIONS, 'Las observaciones')
});

export const supplierValidation = {
    legalName: (value) => validateText({
        name: value,
        length: FORM_FIELD_LIMITS.SUPPLIER_LEGAL_NAME,
        fieldName: 'La razón social'
    }),
    tradeName: (value) => validateText({
        name: value,
        length: FORM_FIELD_LIMITS.SUPPLIER_TRADE_NAME,
        fieldName: 'El nombre comercial'
    }),
    isActive: value => validateBoolean(value, 'El estado del proveedor')
}

export const materialEditValidation = {
    name: (value) => validateName(value, FORM_FIELD_LIMITS.MATERIAL_NAME),
    supplierId: (value) => validateUUID(value, 'El proveedor'),
    ...inventoryStateValidation,
    maxUnitCost: (value) => validateNumber(value, 'El costo máximo', { format: MONEY_INPUT_FORMAT }),
}

export const materialValidation = {
    ...materialEditValidation,
    presentationId: (value) => validateUUID(value, 'La presentación'),
    unitMeasureId: (value) => validateUUID(value, 'La unidad'),
    base: (_, { base, height }) => validatePairedOptionalNumber({
        value: base,
        pairedValue: height,
        fieldName: 'La base',
        allowZero: false
    }),
    height: (_, { base, height }) => validatePairedOptionalNumber({
        value: height,
        pairedValue: base,
        fieldName: 'La altura',
        allowZero: false
    }),
}

export const materialStockValidation = {
    supplierId: materialEditValidation.supplierId,
    ...createInventoryStockValidation({
        validateStock: validateNumber,
        stockFieldName: 'El nuevo stock'
    })
};

export const materialCreateValidation = {
    ...materialValidation,
    newStock: materialStockValidation.newStock,
    observations: materialStockValidation.observations
}

export const goodsReceiptMaterialCreateValidation = {
    ...materialValidation,
    maxUnitCost: value => validateNumberOptional(value, 'El costo máximo', { format: MONEY_INPUT_FORMAT })
}

const wasteSecondaryDataValidation = {
    ...inventoryStateValidation,
    maxUnitCost: value => validateNumber(value, 'El costo máximo de la merma', { format: MONEY_INPUT_FORMAT })
};

export const wasteEditValidation = {
    name: value => validateName(value, FORM_FIELD_LIMITS.MATERIAL_NAME),
    ...wasteSecondaryDataValidation
};

export const wasteStockAdjustmentValidation = createInventoryStockValidation({
    validateStock: validateNumber,
    stockFieldName: 'El nuevo stock de merma'
});

export const wasteStockAdditionValidation = {
    quantity: value => validatePositiveNumber(value, 'La cantidad a agregar'),
    observations: value => validateTextOptional(value, FORM_FIELD_LIMITS.OBSERVATIONS, 'Las observaciones')
};

export const wasteValidation = {
    referenceRollTotalWeightKg: (value, data) => isRollPresentation(data.presentationName)
        ? isEmptyOrNull(value, 'El peso del rollo completo con cono') || validateWasteWeightCapture(value, data, 'referenceRollTotalWeightKg', {
            totalFieldName: 'referenceRollTotalWeightKg',
            requiredCode: 'REFERENCE_ROLL_TOTAL_WEIGHT_REQUIRED',
            notGreaterCode: 'REFERENCE_ROLL_TOTAL_WEIGHT_NOT_GREATER'
        })
        : null,
    coneWeightKg: (value, data) => validateWasteWeightCapture(value, data, 'coneWeightKg'),
    totalWeightKg: (value, data) => validateWasteWeightCapture(value, data, 'totalWeightKg'),
    name: value => validateName(value, FORM_FIELD_LIMITS.MATERIAL_NAME),
    materialId: (value) => validateUUID(value, 'El material'),
    supplierId: (value) => validateUUID(value, 'El proveedor'),
    base: value => validatePositiveNumber(value, 'La base de la merma'),
    height: value => validatePositiveNumber(value, 'La altura de la merma'),
    ...wasteSecondaryDataValidation,
    initialQuantity: value => validateNumber(value, 'La cantidad inicial de merma'),
    observations: wasteStockAdjustmentValidation.observations,
}

export const loginValidation = {
    name: value => isEmptyOrNull(value, 'El nombre de usuario')
        || isString(value, 'El nombre de usuario')
        || isLengthInRangeMax(value.trim(), AUTH_FIELD_LIMITS.USERNAME_MAX_LENGTH, 'El nombre de usuario'),
    password: value => isEmptyOrNull(value, 'La contraseña')
        || isString(value, 'La contraseña')
        || isLengthInRangeMax(value, AUTH_FIELD_LIMITS.PASSWORD_MAX_LENGTH, 'La contraseña')
}

export const addGoodsReceiptMaterialValidation = {
    materialId: (value) => validateUUID(value, 'El material'),
    quantity: (value) => validateNumber(value, 'La cantidad', { minimum: 1 }),
    costPerUnitType: (value) => validatePositiveNumber(value, 'El costo por presentación', { format: MONEY_INPUT_FORMAT }),
}

export const addMaterialValidation = {
    materialId: (value) => validateUUID(value, 'El material'),
    quantity: (value) => validateNumber(value, 'La cantidad', { minimum: 1 }),
}

export const addGoodsIssueMaterialValidation = {
    materialId: (value) => validateUUID(value, 'El material'),
    supplierId: (value) => validateUUID(value, 'El proveedor'),
    quantity: (value) => validateNumber(value, 'La cantidad', { minimum: 1 }),
}

const goodsReceiptHeaderValidation = {
    receivedById: (value) => validateUUID(value, 'El recibidor'),
    observations: (value) => validateTextOptional(value, FORM_FIELD_LIMITS.OBSERVATIONS, 'Las observaciones'),
    receptionDate: (value) => validateDate(value, 'La fecha de recepción'),
    invoice: validateInvoice
}

export const goodsReceiptEditValidation = {
    ...goodsReceiptHeaderValidation,
    details: value => value === undefined || (Array.isArray(value) && !value.length) ? null : validateGoodsReceiptDetailsArray(value)
}

export const goodsReceiptValidation = {
    supplierId: (value) => validateUUID(value, 'El proveedor'),
    ...goodsReceiptHeaderValidation,
    details: validateGoodsReceiptDetailsArray
}

export const goodsReceiptCorrectionValidation = {
    quantity: (value) => validatePositiveNumber(value, 'La cantidad correcta'),
    costPerUnitType: (value) => validatePositiveNumber(value, 'El costo por presentación correcto', { format: MONEY_INPUT_FORMAT })
};


export const issueHeaderValidation = {
    projectNumber: (value) => validateText({
        name: value,
        length: FORM_FIELD_LIMITS.PROJECT_NUMBER,
        fieldName: 'El número de proyecto',
        regex: /^[\s\S]+$/u
    }),
    advisorId: (value) => validateUUID(value, 'El asesor'),
    clientId: (value) => validateUUID(value, 'El cliente'),
    departmentId: (value) => validateUUID(value, 'El área'),
    requesterId: (value) => validateUUID(value, 'El solicitante'),
    observations: (value) => validateTextOptional(value, FORM_FIELD_LIMITS.OBSERVATIONS, 'Las observaciones'),
    requestDate: (value) => validateDate(value, 'La fecha de solicitud')
};

export const goodsIssueValidation = {
    ...issueHeaderValidation,
    details: validateGoodsIssueDetailsArray
}

export const wasteIssueValidation = {
    ...issueHeaderValidation,
    details: validateWasteIssueDetailsArray
};

export const addWasteIssueDetailValidation = {
    wasteId: value => validateUUID(value, 'La merma'),
    quantity: value => validatePositiveNumber(value, 'La cantidad')
};

export const issueProjectQuantityDetailsValidation = {
    projectConvertedQuantity: (value) => validatePositiveNumber(value, 'La cantidad'),
    isSupplied: value => isEmptyOrNull(value, 'El estado de surtido')
        || (typeof value === 'boolean' || value === 'true' || value === 'false' ? null : 'El estado de surtido debe ser verdadero o falso')
}


export const issueReturnValidation = {
    returnQuantity: (value) => validatePositiveNumber(value, 'La cantidad a devolver'),
    observations: (value) => validateTextOptional(value, FORM_FIELD_LIMITS.OBSERVATIONS, 'Las observaciones')
};

export const goodsIssueReturnValidation = issueReturnValidation;

export const clientValidation = {
    name: (value) => validateText({
        name: value,
        length: FORM_FIELD_LIMITS.CLIENT_NAME,
        fieldName: 'El nombre'
    }),
    isActive: value => validateBoolean(value, 'El estado del cliente')
}

export const createCatalogValidation = ({ entityLabel, nameMaxLength, symbolMaxLength }) => ({
    name: value => validateText({
        name: value,
        length: nameMaxLength,
        fieldName: `El nombre de ${ entityLabel }`
    }),
    symbol: value => !symbolMaxLength
        ? null
        : validateText({
            name: value,
            length: symbolMaxLength,
            fieldName: `El símbolo de ${ entityLabel }`
        }),
    isActive: value => validateBoolean(value, 'El estado')
});

export const userValidation = {
    name: validateUsername,
    password: validatePassword,
    departmentId: (value) => validateUUID(value, 'El área'),
    roleId: (value) => validateUUID(value, 'El rol')
};

export const userEditValidation = {
    name: validateUsername,
    departmentId: (value) => validateUUID(value, 'El área'),
    roleId: (value) => validateUUID(value, 'El rol')
};

export const userPasswordValidation = {
    password: validatePassword,
};

export const personValidation = {
    fullName: (value) => validateText({
        name: value,
        length: FORM_FIELD_LIMITS.PERSON_NAME,
        fieldName: 'El nombre',
        regex: PERSON_NAME_PATTERN
    }),
    accesses: validatePersonAccessesArray,
}

export const personAccessValidation = {
    departmentId: (value, { accesses = [] } = {}) => {
        const requiredError = validateUUID(value, 'El área');

        if (requiredError) return requiredError;
        if (accesses.some(access => access.departmentId === value)) {
            return 'Esta área ya está en la tabla; elimine la relación existente si necesita cambiar su rol';
        }

        return null;
    },
    roleId: value => validateUUID(value, 'El rol')
};
