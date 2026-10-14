import { describe, expect, it } from 'vitest';
import { buildWarehouseInventoryColumns, renderWarehouseInventoryHeader } from '../../../../../../src/public/js/plugins/datatable/shared/inventory/warehouseInventoryDatatable.js';

describe('pesos unitarios en la tabla de mermas', () => {
    it.each([false, true])('agrupa los pesos inmediatamente antes de acciones, costos visibles: %s', canSeeCost => {
        const options = { showRollWeights: true, canSeeCost, canSeeActive: true, canManageItems: true };
        const tableElement = {};
        renderWarehouseInventoryHeader({ ...options, tableElement });
        const columns = buildWarehouseInventoryColumns(options);
        expect(columns.slice(-4).map(column => column.data ?? column.title)).toEqual(['coneWeightKg', 'totalWeightKg', 'weightKg', 'Acciones']);
        expect(tableElement.innerHTML.indexOf('Pesos por unidad')).toBeLessThan(tableElement.innerHTML.indexOf('Acciones'));
        expect(tableElement.innerHTML).toContain('data-responsive-parent="weights"');
    });

    it('muestra cero para cono sin peso y ausencia para pesos desconocidos u otras presentaciones', () => {
        const [cone, total] = buildWarehouseInventoryColumns({ showRollWeights: true }).slice(-3);
        expect(cone.render(0, 'display', { presentation: { name: 'ROLLO' } })).not.toBe('—');
        expect(total.render(null, 'display', { presentation: { name: 'ROLLO' } })).toBe('—');
        expect(total.render(1, 'display', { presentation: { name: 'LÁMINA' } })).toBe('—');
    });

    it('conserva las columnas del material sin agregar pesos de merma', () => {
        const columns = buildWarehouseInventoryColumns({ canManageItems: true });
        expect(columns).toHaveLength(9);
        expect(columns.some(column => column.data === 'weightKg')).toBe(false);
    });
});
