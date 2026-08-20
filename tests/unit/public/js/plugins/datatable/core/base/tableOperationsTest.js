import { afterEach, describe, expect, it, vi } from 'vitest';

import { refreshDataTable } from '../../../../../../../../src/public/js/plugins/datatable/core/base/tableOperations.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('actualización de detalles durante el CRUD de salidas', () => {
  it('reutiliza la tabla existente al agregar o eliminar un material o una merma', () => {
    const table = {
      clear: vi.fn(),
      rows: { add: vi.fn() },
      draw: vi.fn(),
      destroy: vi.fn()
    };
    const dataTable = vi.fn(() => table);

    vi.stubGlobal('$', vi.fn(() => ({ DataTable: dataTable })));
    const details = [{ materialId: 'material-1', quantity: 2 }];

    refreshDataTable({ selector: '#materialTable', data: details });

    expect(dataTable).toHaveBeenCalledOnce();
    expect(table.clear).toHaveBeenCalledOnce();
    expect(table.rows.add).toHaveBeenCalledWith(details);
    expect(table.draw).toHaveBeenCalledOnce();
    expect(table.destroy).not.toHaveBeenCalled();
  });
});
