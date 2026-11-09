import { INVENTORY_IMPORT_ROW_ACTIONS as actions } from '../../../shared/constants/inventoryImport.js';
import { UUID_V4_PATTERN } from '../../../shared/constants/inputValidation.js';
import { validateInventoryImportRow } from '../../../validators/forms/inventoryImportValidations.js';
import { calculateStockAdjustmentValues } from '../adjustmentService.js';
import { calculateWasteStockAdjustmentValues } from '../wastes/wasteStockAdjustmentService.js';
import { importCatalogValue } from './inventoryImportContext.js';
import { inventoryImportColumnLabel } from './inventoryImportConfig.js';
import { errorMap } from '../../../messages/codeMessages.js';

// El conteo reemplaza el saldo. Las columnas de referencia del Excel nunca son una fuente de datos.
export const validateInventoryStockCountRows = async ({ config, rows, context }) => {
    const targets = new Map();
    const results = [];
    for (const input of rows) {
        const body = { ...input.values, reasonId: importCatalogValue(input.values.reasonId) };
        const errors = [];
        const add = (field, message, code = errorMap.inventoryImport.VALIDATION) => errors.push({ field, message, code,
            column: inventoryImportColumnLabel(config, field) });
        if (!UUID_V4_PATTERN.test(String(body.id ?? ''))) add('id', 'El identificador del registro no es válido.');
        if (body.newStock === '' || body.newStock == null) add('newStock', 'Captura el stock contado. Cero es válido; una celda vacía no es un conteo.');
        if (!String(body.observations ?? '').trim()) add('observations', 'Describe el conteo físico que justifica el ajuste.');
        const validated = await validateInventoryImportRow({ ...config, body });
        for (const error of validated.errors) add(error.field, error.message, error.code);
        const dto = { newStock: Number(validated.body.newStock), reasonId: body.reasonId,
            observations: String(validated.body.observations ?? '').trim(), expectedVersion: Number(validated.body.expectedVersion),
            ...(config.type && { supplierId: body.supplierId, expectedMaterialVersion: Number(validated.body.expectedMaterialVersion) }) };
        const target = config.type ? context.offers.get(`${body.id}:${body.supplierId}`) : context.wastes.get(body.id);
        const reason = context.reasons.get(body.reasonId);
        if (!target || (config.type && target.material.type !== config.type)) add('id', 'El registro o proveedor no corresponde a este módulo.');
        if (!reason) add('reasonId', 'Selecciona un motivo activo del catálogo.');
        const identity = config.type ? `${body.id}:${body.supplierId}` : body.id;
        if (targets.has(identity)) add('id', `El registro está repetido: coincide con la fila ${targets.get(identity)} del archivo.`);
        targets.set(identity, input.row);
        let before = null, after = null, reference = null;
        let difference = null;
        if (target) {
            if (target.version !== dto.expectedVersion || (config.type && target.material.version !== dto.expectedMaterialVersion)) {
                add('expectedVersion', 'El registro cambió desde que se descargó la plantilla. Descarga una nueva y vuelve a comprobar el conteo.');
            }
            before = { currentStock: Number(target.currentStock), convertedQuantity: Number(target.convertedQuantity) };
            reference = { reasonVersion: reason?.version ?? null };
            if (!errors.length) {
                try {
                    const values = config.type ? calculateStockAdjustmentValues({ supplierMaterial: target, newStock: dto.newStock })
                        : calculateWasteStockAdjustmentValues({ waste: target, newStock: dto.newStock });
                    after = { currentStock: values.newStock, convertedQuantity: values.newConvertedQuantity };
                    difference = values.difference;
                } catch (error) {
                    if (!error.isOperational) throw error;
                    add('newStock', error.message, error.code);
                }
            }
        }
        const material = target?.material ?? target;
        results.push({ row: input.row, id: body.id ?? null, name: material?.name ?? String(body.name ?? ''),
            before, after, reference, dto,
            details: { supplier: target?.supplier?.tradeName ?? '', presentation: material?.presentation?.name ?? '',
                unit: material?.unitMeasure?.symbol ?? '', difference, reason: reason?.name ?? '', observations: dto.observations },
            action: errors.length ? actions.ERROR : difference === 0 && before.convertedQuantity === after.convertedQuantity ? actions.UNCHANGED : actions.UPDATE,
            errors, warnings: [] });
    }
    return { context, rows: results, summary: { total: results.length, creates: 0,
        updates: results.filter(row => row.action === actions.UPDATE).length,
        unchanged: results.filter(row => row.action === actions.UNCHANGED).length, errors: results.filter(row => row.action === actions.ERROR).length } };
};
