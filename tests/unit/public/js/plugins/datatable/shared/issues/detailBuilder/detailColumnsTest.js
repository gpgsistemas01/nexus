import { beforeAll, describe, expect, it, vi } from 'vitest';

import { buildDetailsColumns } from '../../../../../../../../../src/public/js/plugins/datatable/shared/issues/detailBuilder/detailColumns.js';

describe('columnas responsivas del detalle compartido de compras y salidas', () => {
  beforeAll(() => {
    globalThis.document = {};
    globalThis.$ = vi.fn(() => ({ on: vi.fn() }));
  });

  it('mantiene visibles surtir y cantidad de proyecto al reducir una salida', () => {
    const columns = buildDetailsColumns({
      type: 'issue',
      mode: 'edit-detail',
      canManageProjectQuantity: true
    });
    const projectQuantityColumn = columns.find(column => column.title === 'Cantidad de proyecto');
    const supplyColumn = columns.find(column => column.title === 'Surtir');

    expect(projectQuantityColumn.responsivePriority).toBe(1);
    expect(supplyColumn.responsivePriority).toBe(projectQuantityColumn.responsivePriority);
  });

  it.each(['create', 'edit'])('mantiene visibles las acciones de compra en modo %s', (mode) => {
    const columns = buildDetailsColumns({ type: 'receipt', mode });
    const actionsColumn = columns.find(column => column.title === 'Acciones');

    expect(actionsColumn.responsivePriority).toBe(1);
  });
});
