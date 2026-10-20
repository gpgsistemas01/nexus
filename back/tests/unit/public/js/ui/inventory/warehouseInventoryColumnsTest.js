import { describe, expect, it } from 'vitest';
import { buildWarehouseInventoryColumns } from '../../../../../../src/public/js/plugins/datatable/shared/inventory/warehouseInventoryDatatable.js';

describe('pesos unitarios en la tabla de mermas', () => {
    it('muestra cero para cono sin peso y ausencia para pesos desconocidos u otras presentaciones', () => {
        const columns = buildWarehouseInventoryColumns({ showRollWeights: true });
        const cone = columns.find(column => column.data === 'coneWeightKg');
        const total = columns.find(column => column.data === 'totalWeightKg');
        expect(cone.render(0, 'display', { presentation: { name: 'ROLLO' } })).toMatch(/^0(?:[.,]0+)?$/);
        expect(total.render(null, 'display', { presentation: { name: 'ROLLO' } })).toBe('—');
        expect(total.render(1, 'display', { presentation: { name: 'LÁMINA' } })).toBe('—');
    });
});
