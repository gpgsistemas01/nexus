import { PERMISSIONS } from '../../../shared/constants/permissions.js';
import { InventoryImportError } from '../../../errors/warehouse/inventoryImportError.js';
import { ForbiddenError } from '../../../errors/authError.js';
import { INVENTORY_COLLECTIONS as resources, MATERIAL_TYPES } from '../../../shared/constants/inventory.js';
import { ARTICLE_IMPORT_RESOURCE, INVENTORY_IMPORT_MODES as modes } from '../../../shared/constants/inventoryImport.js';
import { INVENTORY_SPREADSHEET_COLUMNS } from '../../../constants/inventorySpreadsheet.js';
import { INVENTORY_STOCK_COUNT_FIELDS } from '../../../constants/inventoryImport.js';

const weights = [
    ['Cono (kg)', 'coneWeightKg'], ['Merma con cono (kg)', 'totalWeightKg'],
    ['Rollo completo con cono (kg)', 'referenceRollTotalWeightKg']
];
const configs = {
    [resources.MATERIALS]: { type: MATERIAL_TYPES.MATERIAL, read: PERMISSIONS.MATERIALS_READ, write: PERMISSIONS.MATERIALS_WRITE, adjust: PERMISSIONS.MATERIALS_ADJUST_STOCK },
    [resources.CONSUMABLES]: { type: MATERIAL_TYPES.CONSUMABLE, read: PERMISSIONS.MATERIALS_READ, write: PERMISSIONS.MATERIALS_WRITE, adjust: PERMISSIONS.MATERIALS_ADJUST_STOCK },
    [resources.WASTES]: { read: PERMISSIONS.WASTES_READ, write: PERMISSIONS.WASTES_WRITE, adjust: PERMISSIONS.WASTES_ADJUST_STOCK }
};

const articleColumns = [
    ['Nombre', 'name'], ['Tipo', 'type'], ['Presentación', 'presentationName'],
    ['Unidad', 'unitLabel'], ['Base (m)', 'base'], ['Altura (m)', 'height']
];

export const getImportConfig = (resource, mode = modes.CREATE) => {
    if (resource === ARTICLE_IMPORT_RESOURCE && [modes.CREATE, modes.UPDATE].includes(mode)) {
        const identity = mode === modes.UPDATE ? [['ID artículo', 'id'], ['Versión', 'expectedVersion']] : [];
        return { resource, mode, columns: [...articleColumns, ...identity], readonlyFields: identity.map(([, key]) => key) };
    }
    if (!Object.hasOwn(configs, resource) || !Object.values(modes).includes(mode)) throw new InventoryImportError();
    const identity = resource === resources.WASTES ? [['ID merma', 'id'], ['Versión', 'expectedVersion']]
        : [['ID material', 'id'], ['ID proveedor', 'supplierId'], ['Versión proveedor', 'expectedVersion'], ['Versión material', 'expectedMaterialVersion']];
    const inventory = INVENTORY_SPREADSHEET_COLUMNS
        .filter(([, , key]) => mode !== modes.ADJUST || key !== 'maxUnitCost')
        .map(([header, , key]) => [header, mode === modes.CREATE && key === 'supplierName' ? 'supplierCode' : key]);
    const columns = [...inventory, ['Activo', 'isActive'],
        ...(mode === modes.CREATE ? [] : identity),
        ...(mode === modes.ADJUST ? [['Stock contado', 'newStock']]
            : mode === modes.CREATE ? [
                ...(resource === resources.WASTES ? [['Material de referencia', 'materialId'], ...weights] : []),
                ['Cantidad inicial', resource === resources.WASTES ? 'initialQuantity' : 'newStock']
            ] : []),
        ...(mode === modes.CREATE ? [['Observaciones', 'observations']] : [])];
    const editable = mode === modes.ADJUST ? ['newStock']
        : mode === modes.UPDATE ? resource === resources.WASTES
            ? ['name', 'minStock', 'maxUnitCost', 'isActive']
            : ['minStock', 'maxUnitCost', 'isActive']
            : ['supplierCode', 'name', 'minStock', 'maxUnitCost', 'isActive', 'observations', 'newStock', 'initialQuantity',
                ...(resource === resources.WASTES ? ['materialId', 'base', 'height', ...weights.map(([, key]) => key)]
                    : ['presentationName', 'unitLabel', 'base', 'height'])];
    return { ...configs[resource], resource, mode, columns,
        readonlyFields: columns.map(([, key]) => key).filter(key => !editable.includes(key)) };
};

export const importUnitLabel = unit => `${unit.symbol} · ${unit.name}`;
export const inventoryImportColumnLabel = (config, field) => {
    const documentField = config.mode === modes.ADJUST && INVENTORY_STOCK_COUNT_FIELDS.find(({ key }) => key === field);
    return documentField ? `Instrucciones!B${documentField.row} · ${documentField.label}`
        : config.columns.find(([, key]) => key === field)?.[0] ?? field;
};

export const authorizeInventoryImport = (user, resource, mode = modes.CREATE) => {
    const config = getImportConfig(resource, mode);
    if (resource === ARTICLE_IMPORT_RESOURCE) {
        if (![PERMISSIONS.MATERIAL_CATALOGS_MANAGE, PERMISSIONS.CATALOGS_MANAGE]
            .some(permission => user?.permissions?.includes(permission))) throw new ForbiddenError();
        return config;
    }
    const required = mode === modes.ADJUST ? [config.read, config.adjust] : [config.read, config.write, PERMISSIONS.INVENTORY_COSTS_READ];
    if (!required.every(permission => user?.permissions?.includes(permission))) {
        throw new ForbiddenError();
    }
    return config;
};
