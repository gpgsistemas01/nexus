import { PERMISSIONS } from '../../../shared/constants/permissions.js';
import { InventoryImportError } from '../../../errors/warehouse/inventoryImportError.js';
import { AppError } from '../../../errors/AppError.js';

const base = [
    ['nombre', 'name'], ['stock_minimo', 'minStock'],
    ['costo_maximo_unitario', 'maxUnitCost'], ['activo', 'isActive']
];
const dimensions = [['base_m', 'base'], ['altura_m', 'height']];
const material = [['proveedor_codigo', 'supplierCode'], ['presentacion', 'presentationName'], ['unidad', 'unitLabel']];
const weights = [
    ['cono_kg', 'coneWeightKg'], ['merma_con_cono_kg', 'totalWeightKg'],
    ['rollo_completo_con_cono_kg', 'referenceRollTotalWeightKg']
];
const configs = {
    materials: { type: 'MATERIAL', read: PERMISSIONS.MATERIALS_READ, write: PERMISSIONS.MATERIALS_WRITE, adjust: PERMISSIONS.MATERIALS_ADJUST_STOCK },
    consumables: { type: 'CONSUMABLE', read: PERMISSIONS.MATERIALS_READ, write: PERMISSIONS.MATERIALS_WRITE, adjust: PERMISSIONS.MATERIALS_ADJUST_STOCK },
    wastes: { read: PERMISSIONS.WASTES_READ, write: PERMISSIONS.WASTES_WRITE, adjust: PERMISSIONS.WASTES_ADJUST_STOCK }
};

export const getImportConfig = (resource, mode = 'create') => {
    if (!Object.hasOwn(configs, resource) || !['create', 'update', 'adjust', 'mixed'].includes(mode)) throw new InventoryImportError();
    if (mode === 'mixed') {
        const columns = new Map([['operation', ['operacion', 'operation']]]);
        for (const kind of ['update', 'create', 'adjust']) for (const column of getImportConfig(resource, kind).columns) {
            if (!columns.has(column[1])) columns.set(column[1], column);
        }
        columns.set('newStock', ['stock_contado_o_inicial', 'newStock']);
        columns.delete('initialQuantity');
        return { ...configs[resource], resource, mode, columns: [...columns.values()] };
    }
    const identity = resource === 'wastes' ? [['id_merma', 'id'], ['version', 'expectedVersion']]
        : [['id_material', 'id'], ['id_proveedor', 'supplierId'], ['version_proveedor', 'expectedVersion'], ['version_material', 'expectedMaterialVersion']];
    const columns = mode === 'adjust'
        ? [...identity, ['nombre_referencia', 'name'], ['proveedor_referencia', 'supplierName'],
            ['presentacion_referencia', 'presentationName'], ['unidad_referencia', 'unitLabel'], ['stock_referencia', 'currentStock'],
            ['stock_contado', 'newStock'], ['motivo', 'reasonId'], ['observaciones', 'observations']]
        : mode === 'update'
            ? [...identity, ...base]
        : [...base, ...(resource === 'wastes'
            ? [['proveedor_codigo', 'supplierCode'], ['material_referencia', 'materialId'], ...dimensions, ...weights, ['cantidad_inicial', 'initialQuantity']]
            : [...material, ...(resource === 'materials' ? dimensions : []), ['cantidad_inicial', 'newStock']]), ['observaciones', 'observations']];
    return { ...configs[resource], resource, mode, columns };
};

export const importUnitLabel = unit => `${unit.symbol} · ${unit.name}`;

export const authorizeInventoryImport = (user, resource, mode = 'create') => {
    const config = getImportConfig(resource, mode);
    if (mode === 'mixed') {
        const canRead = user?.permissions?.includes(config.read);
        const canEdit = [config.write, PERMISSIONS.INVENTORY_COSTS_READ].every(permission => user?.permissions?.includes(permission));
        if (!canRead || (!canEdit && !user?.permissions?.includes(config.adjust))) {
            throw new AppError('No tiene permiso para importar estos registros.', 'FORBIDDEN', 403);
        }
        return config;
    }
    const required = mode === 'adjust' ? [config.read, config.adjust] : [config.read, config.write, PERMISSIONS.INVENTORY_COSTS_READ];
    if (!required.every(permission => user?.permissions?.includes(permission))) {
        throw new AppError('No tiene permiso para importar estos registros.', 'FORBIDDEN', 403);
    }
    return config;
};
