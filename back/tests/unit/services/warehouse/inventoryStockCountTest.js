import { randomUUID } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
vi.mock('../../../../src/lib/prisma.js', () => ({ prisma: {} }));
import { validateInventoryStockCountRows } from '../../../../src/services/warehouse/imports/inventoryStockCountValidationService.js';
import { getImportConfig } from '../../../../src/services/warehouse/imports/inventoryImportConfig.js';

const id = randomUUID(), supplierId = randomUUID(), reasonId = randomUUID();
const target = { id: randomUUID(), version: 3, currentStock: 10, convertedQuantity: 60,
    material: { id, version: 2, name: 'Material contado', type: 'MATERIAL', base: 2, height: 3,
        presentation: { name: 'PIEZA' }, unitMeasure: { symbol: 'm²' } }, supplier: { tradeName: 'Proveedor' } };
const context = { offers: new Map([[`${id}:${supplierId}`, target]]), wastes: new Map(),
    reasons: new Map([[reasonId, { id: reasonId, version: 0, name: 'Conteo físico' }]]) };
const validate = newStock => validateInventoryStockCountRows({ config: getImportConfig('materials', 'adjust'), context,
    rows: [{ row: 2, values: { id, supplierId, reasonId, expectedVersion: 3, expectedMaterialVersion: 2, newStock, observations: 'Conteo comprobado' } }] });

describe('conteo físico: particiones y fronteras del saldo final', () => {
    it.each([[0, 'update', -10], [10, 'unchanged', 0], [12, 'update', 2]])('interpreta %s como saldo final, no como entrada', async (count, action, difference) => {
        const result = await validate(count);
        expect(result.summary.errors).toBe(0);
        expect(result.rows[0]).toMatchObject({ action, after: { currentStock: count, convertedQuantity: count * 6 }, details: { difference } });
    });
    it.each(['', null, -1, 1.5, 'no numérico'])('rechaza conteo inválido de PIEZA: %s', async count => {
        const result = await validate(count);
        expect(result.rows[0].action).toBe('error');
        expect(result.rows[0].errors.some(error => error.field === 'newStock')).toBe(true);
    });
});
