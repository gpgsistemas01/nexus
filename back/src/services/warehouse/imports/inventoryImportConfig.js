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
    materials: { type: 'MATERIAL', read: PERMISSIONS.MATERIALS_READ, write: PERMISSIONS.MATERIALS_WRITE },
    consumables: { type: 'CONSUMABLE', read: PERMISSIONS.MATERIALS_READ, write: PERMISSIONS.MATERIALS_WRITE },
    wastes: { read: PERMISSIONS.WASTES_READ, write: PERMISSIONS.WASTES_WRITE }
};

export const getImportConfig = (resource, mode = 'create') => {
    if (!Object.hasOwn(configs, resource) || !['create', 'update'].includes(mode)) throw new InventoryImportError();
    const columns = mode === 'update'
        ? [...(resource === 'wastes' ? [['id_merma', 'id'], ['version', 'expectedVersion']]
            : [['id_material', 'id'], ['id_proveedor', 'supplierId'], ['version_proveedor', 'expectedVersion'], ['version_material', 'expectedMaterialVersion']]), ...base]
        : [...base, ...(resource === 'wastes'
            ? [['proveedor_codigo', 'supplierCode'], ['material_referencia', 'materialId'], ...dimensions, ...weights, ['cantidad_inicial', 'initialQuantity']]
            : [...material, ...(resource === 'materials' ? dimensions : []), ['cantidad_inicial', 'newStock']]), ['observaciones', 'observations']];
    return { ...configs[resource], resource, mode, columns };
};

export const importUnitLabel = unit => `${unit.symbol} · ${unit.name}`;

export const authorizeInventoryImport = (user, resource, mode = 'create') => {
    const config = getImportConfig(resource, mode);
    if (![config.read, config.write, PERMISSIONS.INVENTORY_COSTS_READ].every(permission => user?.permissions?.includes(permission))) {
        throw new AppError('No tiene permiso para importar estos registros.', 'FORBIDDEN', 403);
    }
    return config;
};
