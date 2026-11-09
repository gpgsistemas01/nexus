import { describe, expect, it } from 'vitest';
import { authorizeInventoryImport, getImportConfig } from '../../../../src/services/warehouse/imports/inventoryImportConfig.js';
import { PERMISSIONS } from '../../../../src/shared/constants/permissions.js';

describe('decisiones de acceso a importaciones', () => {
    it.each(['materials', 'consumables', 'wastes'])('el conteo de %s exige lectura y ajuste, sin exigir ni exponer costos', resource => {
        const config = getImportConfig(resource, 'adjust');
        expect(authorizeInventoryImport({ permissions: [config.read, config.adjust] }, resource, 'adjust').mode).toBe('adjust');
        expect(config.columns.some(([, key]) => key === 'maxUnitCost')).toBe(false);
        expect(() => authorizeInventoryImport({ permissions: [config.read, config.write, PERMISSIONS.INVENTORY_COSTS_READ] }, resource, 'adjust'))
            .toThrow(expect.objectContaining({ statusCode: 403 }));
    });
    it.each(['materials', 'consumables', 'wastes'].flatMap(resource => ['create', 'update'].map(mode => [resource, mode])))('exige cada permiso de %s para %s', (resource, mode) => {
        const config = getImportConfig(resource);
        const required = [config.read, config.write, PERMISSIONS.INVENTORY_COSTS_READ];
        expect(authorizeInventoryImport({ permissions: required }, resource, mode).mode).toBe(mode);
        for (const missing of required) expect(() => authorizeInventoryImport({ permissions: required.filter(value => value !== missing) }, resource, mode))
            .toThrow(expect.objectContaining({ statusCode: 403 }));
    });
    it('rechaza recursos y modos fuera de la lista blanca', () => {
        expect(() => getImportConfig('constructor')).toThrow(expect.objectContaining({ code: 'INVENTORY_IMPORT_FILE' }));
        for (const mode of ['mixed', 'delete', 'update-adjust']) expect(() => getImportConfig('materials', mode)).toThrow(expect.objectContaining({ code: 'INVENTORY_IMPORT_FILE' }));
    });
});
