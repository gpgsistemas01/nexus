import { validationResult } from 'express-validator';
import { materialValidation, consumableValidation, materialEditValidation, materialStockValidation } from './materialValidations.js';
import { wasteValidation, wasteEditValidation, wasteStockAdjustmentValidation } from './wasteValidations.js';
import { validateRecordVersion } from '../fields/versionValidator.js';
import { errorMessages } from '../../shared/messages/apiMessages.js';

// Adapta una fila a las mismas cadenas de captura de los formularios HTTP, sin consultar datos.
export const validateInventoryImportRow = async ({ resource, mode, body }) => {
    const capture = { body: { ...body } };
    const validations = mode === 'adjust'
        ? resource === 'wastes' ? wasteStockAdjustmentValidation : [...materialStockValidation, validateRecordVersion('expectedMaterialVersion')]
        : mode === 'update'
        ? resource === 'wastes' ? wasteEditValidation : materialEditValidation
        : resource === 'wastes' ? wasteValidation : resource === 'consumables' ? consumableValidation : materialValidation;
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
