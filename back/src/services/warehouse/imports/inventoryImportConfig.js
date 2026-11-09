import { PERMISSIONS } from '../../../shared/constants/permissions.js';
import { InventoryImportError } from '../../../errors/warehouse/inventoryImportError.js';
import { AppError } from '../../../errors/AppError.js';
import { INVENTORY_COLLECTIONS as resources, MATERIAL_TYPES } from '../../../shared/constants/inventory.js';
import { INVENTORY_IMPORT_MODES as modes } from '../../../shared/constants/inventoryImport.js';
import { errorMap } from '../../../messages/codeMessages.js';
import { errorMessages } from '../../../shared/messages/apiMessages.js';
import { INVENTORY_SPREADSHEET_COLUMNS } from '../../../constants/inventorySpreadsheet.js';

const weights = [
    ['Cono (kg)', 'coneWeightKg'], ['Merma con cono (kg)', 'totalWeightKg'],
    ['Rollo completo con cono (kg)', 'referenceRollTotalWeightKg']
];
const configs = {
    [resources.MATERIALS]: { type: MATERIAL_TYPES.MATERIAL, read: PERMISSIONS.MATERIALS_READ, write: PERMISSIONS.MATERIALS_WRITE, adjust: PERMISSIONS.MATERIALS_ADJUST_STOCK },
    [resources.CONSUMABLES]: { type: MATERIAL_TYPES.CONSUMABLE, read: PERMISSIONS.MATERIALS_READ, write: PERMISSIONS.MATERIALS_WRITE, adjust: PERMISSIONS.MATERIALS_ADJUST_STOCK },
    [resources.WASTES]: { read: PERMISSIONS.WASTES_READ, write: PERMISSIONS.WASTES_WRITE, adjust: PERMISSIONS.WASTES_ADJUST_STOCK }
};

export const getImportConfig = (resource, mode = modes.CREATE) => {
    if (!Object.hasOwn(configs, resource) || !Object.values(modes).includes(mode)) throw new InventoryImportError();
    const identity = resource === resources.WASTES ? [['ID merma', 'id'], ['Versión', 'expectedVersion']]
        : [['ID material', 'id'], ['ID proveedor', 'supplierId'], ['Versión proveedor', 'expectedVersion'], ['Versión material', 'expectedMaterialVersion']];
    const inventory = INVENTORY_SPREADSHEET_COLUMNS
        .filter(([, , key]) => mode !== modes.ADJUST || key !== 'maxUnitCost')
        .map(([header, , key]) => [header, mode === modes.CREATE && key === 'supplierName' ? 'supplierCode' : key]);
    const columns = [...inventory, ['Activo', 'isActive'],
        ...(mode === modes.CREATE ? [] : identity),
        ...(mode === modes.ADJUST ? [['Stock contado', 'newStock'], ['Motivo', 'reasonId']]
            : mode === modes.CREATE ? [
                ...(resource === resources.WASTES ? [['Material de referencia', 'materialId'], ...weights] : []),
                ['Cantidad inicial', resource === resources.WASTES ? 'initialQuantity' : 'newStock']
            ] : []),
        ...(mode === modes.UPDATE ? [] : [['Observaciones', 'observations']])];
    const editable = mode === modes.ADJUST ? ['newStock', 'reasonId', 'observations']
        : mode === modes.UPDATE ? ['name', 'minStock', 'maxUnitCost', 'isActive']
            : ['supplierCode', 'name', 'minStock', 'maxUnitCost', 'isActive', 'observations', 'newStock', 'initialQuantity',
                ...(resource === resources.WASTES ? ['materialId', 'base', 'height', ...weights.map(([, key]) => key)]
                    : ['presentationName', 'unitLabel', ...(resource === resources.MATERIALS ? ['base', 'height'] : [])])];
    return { ...configs[resource], resource, mode, columns,
        readonlyFields: columns.map(([, key]) => key).filter(key => !editable.includes(key)) };
};

export const importUnitLabel = unit => `${unit.symbol} · ${unit.name}`;
export const inventoryImportColumnLabel = (config, field) => config.columns.find(([, key]) => key === field)?.[0] ?? field;

const forbidden = () => new AppError(errorMessages[errorMap.message.FORBIDDEN], errorMap.message.FORBIDDEN, 403);

export const authorizeInventoryImport = (user, resource, mode = modes.CREATE) => {
    const config = getImportConfig(resource, mode);
    const required = mode === modes.ADJUST ? [config.read, config.adjust] : [config.read, config.write, PERMISSIONS.INVENTORY_COSTS_READ];
    if (!required.every(permission => user?.permissions?.includes(permission))) {
        throw forbidden();
    }
    return config;
};
