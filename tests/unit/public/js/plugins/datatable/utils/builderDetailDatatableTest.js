import { beforeAll, describe, expect, it, vi } from 'vitest';

import { buildDetailsColumns } from '../../../../../../../src/public/js/plugins/datatable/utils/builderDetailDatatable.js';

describe('builderDetailDatatable', () => {
  beforeAll(() => {
    globalThis.document = {};
    globalThis.$ = vi.fn(() => ({ on: vi.fn() }));
  });

  it('mantiene la cantidad convertida de salida con la misma prioridad que surtir', () => {
    const columns = buildDetailsColumns({ type: 'issue', mode: 'edit-detail' });
    const convertedQuantityColumn = columns.find(column => column.data === 'convertedQuantity');
    const supplyColumn = columns.at(-1);

    expect(convertedQuantityColumn.responsivePriority).toBe(1);
    expect(supplyColumn.responsivePriority).toBe(convertedQuantityColumn.responsivePriority);
  });

  it.each(['create', 'edit'])('mantiene las acciones de compra visibles en modo %s', (mode) => {
    const columns = buildDetailsColumns({ type: 'receipt', mode });
    const actionsColumn = columns.at(-1);

    expect(actionsColumn).toMatchObject({
      title: 'Acciones',
      responsivePriority: 1
    });
  });
});
