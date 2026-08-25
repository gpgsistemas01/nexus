import { isEmptyOrNull } from "./baseValidations.js";
import { validateName, validatePassword, validateNumber, validateUsername, validateTextOptional, validateGoodsReceiptDetailsArray, validateDate, validateText, validateNumberOptional, validateGoodsIssueDetailsArray, validateNonNegativeNumber, validatePairedOptionalNumber, validatePositiveNumber, validatePersonAccessesArray, validateWasteIssueDetailsArray, validateInvoice } from "./fieldValidations.js";

const inventoryStateValidation = {
    minStock: (value) => validateNumberOptional(value, 'El stock mínimo'),
    isActive: (value) => isEmptyOrNull(value, 'El estado del inventario')
};

const createInventoryStockValidation = ({ validateStock, stockFieldName }) => ({
    newStock: value => validateStock(value, stockFieldName),
    reasonId: value => isEmptyOrNull(value, 'La razón de ajuste'),
    observations: value => validateTextOptional(value, 500, 'Las observaciones')
});

export const supplierValidation = {
    legalName: (value) => validateText({
        name: value,
        length: 200,
        fieldName: 'La razón social'
    }),
    tradeName: (value) => validateText({
        name: value,
        length: 100,
        fieldName: 'El nombre comercial'
    }),
}

export const materialEditValidation = {
    name: (value) => validateName(value, 200),
    supplierId: (value) => isEmptyOrNull(value, 'El proveedor'),
    ...inventoryStateValidation,
    maxUnitCost: (value) => validateNumber(value, 'El costo máximo'),
}

export const materialValidation = {
    ...materialEditValidation,
    presentationId: (value) => isEmptyOrNull(value, 'La presentación'),
    unitMeasureId: (value) => isEmptyOrNull(value, 'La unidad'),
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

export const materialStockValidation = createInventoryStockValidation({
    validateStock: validateNumber,
    stockFieldName: 'El nuevo stock'
});

export const materialCreateValidation = {
    ...materialValidation,
    newStock: materialStockValidation.newStock,
    observations: materialStockValidation.observations
}

export const goodsReceiptMaterialCreateValidation = {
    ...materialValidation,
    maxUnitCost: (value) => value
        ? materialValidation.maxUnitCost(value)
        : null
}

export const wasteEditValidation = {
    ...inventoryStateValidation,
    maxUnitCost: value => validateNumberOptional(value, 'El costo máximo de la merma')
};

export const wasteStockValidation = createInventoryStockValidation({
    validateStock: validateNonNegativeNumber,
    stockFieldName: 'El nuevo stock de merma'
});

export const wasteValidation = {
    materialId: (value) => isEmptyOrNull(value, 'El material'),
    supplierId: (value) => isEmptyOrNull(value, 'El proveedor'),
    base: value => validatePositiveNumber(value, 'El ancho de la merma'),
    height: value => validatePositiveNumber(value, 'El largo de la merma'),
    ...wasteEditValidation,
    newStock: wasteStockValidation.newStock,
    observations: wasteStockValidation.observations,
}

export const loginValidation = {
    name: validateUsername,
    password: validatePassword,
}

export const addGoodsReceiptMaterialValidation = {
    materialId: (value) => isEmptyOrNull(value, 'El material'),
    quantity: (value) => validatePositiveNumber(value, 'La cantidad'),
    costPerUnitType: (value) => validateNumber(value, 'El costo por presentación', { allowZero: false }),
}

export const addMaterialValidation = {
    materialId: (value) => isEmptyOrNull(value, 'El material'),
    quantity: (value) => validatePositiveNumber(value, 'La cantidad'),
}

export const addGoodsIssueMaterialValidation = {
    materialId: (value) => isEmptyOrNull(value, 'El material'),
    supplierId: (value) => isEmptyOrNull(value, 'El proveedor'),
    quantity: (value) => validatePositiveNumber(value, 'La cantidad'),
}

const goodsReceiptHeaderValidation = {
    receivedById: (value) => isEmptyOrNull(value, 'El recibidor'),
    observations: (value) => validateTextOptional(value, 500, 'Las observaciones'),
    receptionDate: (value) => validateDate(value, 'La fecha de recepción'),
    invoice: validateInvoice
}

export const goodsReceiptEditValidation = {
    ...goodsReceiptHeaderValidation,
    details: (value) => value.length === 0 ? null : validateGoodsReceiptDetailsArray(value)
}

export const goodsReceiptValidation = {
    supplierId: (value) => isEmptyOrNull(value, 'El proveedor'),
    ...goodsReceiptHeaderValidation,
    details: validateGoodsReceiptDetailsArray
}

export const goodsReceiptCorrectionValidation = {
    quantity: (value) => validatePositiveNumber(value, 'La cantidad correcta'),
    costPerUnitType: (value) => validateNumber(value, 'El costo por presentación correcto', { allowZero: false })
};


export const issueHeaderValidation = {
    projectNumber: (value) => validateText({
        name: value,
        length: 10,
        fieldName: 'El número de proyecto'
    }),
    advisorId: (value) => isEmptyOrNull(value, 'El asesor'),
    clientId: (value) => isEmptyOrNull(value, 'El cliente'),
    departmentId: (value) => isEmptyOrNull(value, 'El área'),
    requesterId: (value) => isEmptyOrNull(value, 'El solicitante'),
    observations: (value) => validateTextOptional(value, 500, 'Las observaciones'),
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
    wasteId: value => isEmptyOrNull(value, 'La merma'),
    quantity: value => validatePositiveNumber(value, 'La cantidad')
};

export const issueProjectQuantityDetailsValidation = {
    projectConvertedQuantity: (value) => validateNumber(value, 'La cantidad')
}


export const issueReturnValidation = {
    returnQuantity: (value) => validatePositiveNumber(value, 'La cantidad a devolver'),
    observations: (value) => validateTextOptional(value, 500, 'Las observaciones')
};

export const goodsIssueReturnValidation = issueReturnValidation;

export const purchaseRequisitionValidation = {
    projectId: (value) => isEmptyOrNull(value, 'El proyecto'),
    observations: (value) => validateTextOptional(value, 500, 'Las observaciones'),
    requestDate: (value) => validateDate(value, 'La fecha de solicitud'),
    details: validateGoodsReceiptDetailsArray
};

export const clientValidation = {
    name: (value) => validateText({
        name: value,
        length: 100,
        fieldName: 'El nombre'
    }),
}

export const userValidation = {
    name: validateUsername,
    password: validatePassword,
    departmentId: (value) => isEmptyOrNull(value, 'El área'),
    roleId: (value) => isEmptyOrNull(value, 'El rol')
};

export const userEditValidation = {
    name: validateUsername,
    departmentId: (value) => isEmptyOrNull(value, 'El área'),
    roleId: (value) => isEmptyOrNull(value, 'El rol')
};

export const userPasswordValidation = {
    password: validatePassword,
};

export const personValidation = {
    fullName: (value) => validateText({
        name: value,
        length: 100,
        fieldName: 'El nombre',
        regex: /^[\p{L}0-9]+(?:[ '\-.,:;()¿?¡!][\p{L}0-9]+)*[.,:;()¿?¡!]*$/u
    }),
    accesses: validatePersonAccessesArray,
}

export const personAccessValidation = {
    departmentId: (value, { accesses = [] } = {}) => {
        const requiredError = isEmptyOrNull(value, 'El área');

        if (requiredError) return requiredError;
        if (accesses.some(access => access.departmentId === value)) {
            return 'Esta área ya está en la tabla; elimine la relación existente si necesita cambiar su rol';
        }

        return null;
    },
    roleId: value => isEmptyOrNull(value, 'El rol')
};
