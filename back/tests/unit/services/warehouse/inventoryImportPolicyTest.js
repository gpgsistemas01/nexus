import { describe, expect, it, vi } from 'vitest';
vi.mock('../../../../src/lib/prisma.js', () => ({ prisma: {} }));
import { authorizeInventoryImport, getImportConfig } from '../../../../src/services/warehouse/imports/inventoryImportConfig.js';
import { PERMISSIONS } from '../../../../src/shared/constants/permissions.js';
import { validateMixedInventoryImport } from '../../../../src/services/warehouse/imports/inventoryMixedImportService.js';

describe('decisiones de acceso a importaciones', () => {
    it('el archivo mixto no consulta ni revela costos al intentar una edición sin permiso de costos', async () => {
        const validate = vi.fn();
        const result = await validateMixedInventoryImport({ db: {}, config: getImportConfig('materials', 'mixed'),
            rows: [{ row: 2, values: { operation: 'Editar', name: 'Artículo' } }],
            user: { permissions: [PERMISSIONS.MATERIALS_READ, PERMISSIONS.MATERIALS_ADJUST_STOCK] }, validate });
        expect(validate).not.toHaveBeenCalled();
        expect(result.rows[0]).toMatchObject({ before: null, after: null, action: 'error' });
        expect(result.summary.errors).toBe(1);
    });
    it.each(['materials', 'consumables', 'wastes'])('el conteo de %s exige lectura y ajuste, sin exigir ni exponer costos', resource => {
        const config = getImportConfig(resource, 'adjust');
        expect(authorizeInventoryImport({ permissions: [config.read, config.adjust] }, resource, 'adjust').mode).toBe('adjust');
        expect(config.columns.some(([, key]) => key === 'maxUnitCost')).toBe(false);
        expect(() => authorizeInventoryImport({ permissions: [config.read, config.write, PERMISSIONS.INVENTORY_COSTS_READ] }, resource, 'adjust'))
            .toThrow(expect.objectContaining({ statusCode: 403 }));
    });
    it.each(['materials', 'consumables', 'wastes'])('exige cada permiso de %s también para actualizar', resource => {
        const config = getImportConfig(resource);
        const required = [config.read, config.write, PERMISSIONS.INVENTORY_COSTS_READ];
        expect(authorizeInventoryImport({ permissions: required }, resource, 'update').mode).toBe('update');
        for (const missing of required) expect(() => authorizeInventoryImport({ permissions: required.filter(value => value !== missing) }, resource, 'update'))
            .toThrow(expect.objectContaining({ statusCode: 403 }));
    });
    it('rechaza recursos y modos fuera de la lista blanca', () => {
        expect(() => getImportConfig('constructor')).toThrow(expect.objectContaining({ code: 'INVENTORY_IMPORT_FILE' }));
        expect(() => getImportConfig('materials', 'delete')).toThrow(expect.objectContaining({ code: 'INVENTORY_IMPORT_FILE' }));
    });
});
