import { describe, expect, it, vi } from 'vitest';
import { buildWarehouseInventoryColumns } from '../../../../../../../../src/public/js/plugins/datatable/shared/inventory/warehouseInventoryDatatable.js';

describe('columnas compartidas de los CRUD de existencias y mermas', () => {
  it.each([
    ['existencias con costos y acciones', true, true],
    ['mermas sin costos ni acciones', false, false]
  ])('centra vertical y horizontalmente todas las filas de %s', (_, canSeeCost, canManageItems) => {
    const columns = buildWarehouseInventoryColumns({
      canSeeCost,
      canManageItems,
      renderActions: vi.fn()
    });

    expect(columns).toHaveLength(8 + Number(canSeeCost) + Number(canManageItems));
    expect(columns.every(({ className }) => className === 'text-center align-middle')).toBe(true);
    expect(columns[0]).toMatchObject({ data: null, className: 'text-center align-middle' });
  });
});
