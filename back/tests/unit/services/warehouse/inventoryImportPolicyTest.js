import { describe, expect, it } from 'vitest';
import { authorizeInventoryImport, getImportConfig } from '../../../../src/services/warehouse/imports/inventoryImportConfig.js';
import { PERMISSIONS } from '../../../../src/shared/constants/permissions.js';

describe('decisiones de acceso a importaciones', () => {
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
