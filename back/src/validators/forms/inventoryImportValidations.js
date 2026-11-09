import { validationResult } from 'express-validator';
import { materialValidation, consumableValidation, materialEditValidation, materialStockValidation } from './materialValidations.js';
import { wasteValidation, wasteEditValidation, wasteStockAdjustmentValidation } from './wasteValidations.js';
import { validateRecordVersion } from '../fields/versionValidator.js';
import { errorMessages } from '../../shared/messages/apiMessages.js';
import { INVENTORY_IMPORT_MODES as modes } from '../../shared/constants/inventoryImport.js';
import { INVENTORY_COLLECTIONS as resources } from '../../shared/constants/inventory.js';

// Adapta una fila a las mismas cadenas de captura de los formularios HTTP, sin consultar datos.
export const validateInventoryImportRow = async ({ resource, mode, body }) => {
    const capture = { body: { ...body } };
    const validations = mode === modes.ADJUST
        ? resource === resources.WASTES ? wasteStockAdjustmentValidation : [...materialStockValidation, validateRecordVersion('expectedMaterialVersion')]
        : mode === modes.UPDATE
        ? resource === resources.WASTES ? wasteEditValidation : materialEditValidation
        : resource === resources.WASTES ? wasteValidation : resource === resources.CONSUMABLES ? consumableValidation : materialValidation;
    for (const validation of validations) await validation.run(capture);
    const errors = validationResult(capture).array({ onlyFirstError: true }).map(error => {
        const meta = typeof error.msg === 'object' ? error.msg : {};
        const code = meta.code ?? error.msg;
        const description = errorMessages[code];
        return { field: error.path, code,
            message: typeof description === 'function' ? description(meta) : description ?? 'Revisa el valor de esta columna.' };
    });
    return { body: capture.body, errors };
};
