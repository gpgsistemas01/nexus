import { describe, expect, it, vi } from 'vitest';
import { buildWarehouseInventoryColumns } from '../../../../../../../../src/public/js/plugins/datatable/shared/inventory/warehouseInventoryDatatable.js';

describe('columnas compartidas de los CRUD de existencias y mermas', () => {
  it.each([
    ['existencias con estado, costos y acciones', true, true, true],
    ['mermas sin estado, costos ni acciones', false, false, false]
  ])('centra vertical y horizontalmente todas las filas de %s', (_, canSeeActive, canSeeCost, canManageItems) => {
    const columns = buildWarehouseInventoryColumns({
      canSeeActive,
      canSeeCost,
      canManageItems,
      renderActions: vi.fn()
    });

    expect(columns).toHaveLength(8 + Number(canSeeActive) + Number(canSeeCost) + Number(canManageItems));
    expect(columns.every(({ className }) => className === 'text-center align-middle')).toBe(true);
    expect(columns[0]).toMatchObject({ data: null, className: 'text-center align-middle' });
  });

  it('muestra el estado únicamente cuando el contexto puede consultarlo', () => {
    const columns = buildWarehouseInventoryColumns({
      canSeeActive: true,
      canSeeCost: false,
      canManageItems: false,
      renderActions: vi.fn()
    });

    const activeColumn = columns.find(({ data }) => data === 'isActive');

    expect(activeColumn).toBeDefined();
    expect(activeColumn.render(true)).toBe('Sí');
    expect(activeColumn.render(false)).toBe('No');
  });

  it('coloca el estado activo inmediatamente antes de las acciones', () => {
    const columns = buildWarehouseInventoryColumns({
      canSeeActive: true,
      canSeeCost: true,
      canManageItems: true,
      renderActions: vi.fn()
    });

    expect(columns.at(-2)).toMatchObject({ data: 'isActive' });
    expect(columns.at(-1)).toMatchObject({ title: 'Acciones' });
  });
});
