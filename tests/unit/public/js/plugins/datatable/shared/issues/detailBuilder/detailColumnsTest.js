import { beforeAll, describe, expect, it, vi } from 'vitest';

import { buildDetailsColumns } from '../../../../../../../../../src/public/js/plugins/datatable/shared/issues/detailBuilder/detailColumns.js';
import { upsertIssueDetail } from '../../../../../../../../../src/public/js/utils/detailCollectionUtils.js';

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

  it('permite eliminar por separado un detalle repetido agregado al editar una compra', () => {
    const columns = buildDetailsColumns({ type: 'receipt', mode: 'edit' });
    const actionsColumn = columns.find(column => column.title === 'Acciones');
    const action = actionsColumn.render(null, null, {
      clientId: 'pending-detail-2',
      materialId: 'material-1'
    });

    expect(action).toContain('delete-btn');
    expect(action).toContain('data-id="pending-detail-2"');
  });

  it.each(['create', 'edit'])('mantiene visible la acción de eliminar de salidas en modo %s', (mode) => {
    const columns = buildDetailsColumns({ type: 'issue', mode });
    const actionsColumn = columns.at(-1);

    expect(actionsColumn.responsivePriority).toBe(1);
  });

  it.each([
    ['edit', { id: 'detail-1', wasteId: 'waste-1' }, 'detail-1'],
    ['edit', { wasteId: 'waste-1' }, 'waste-1'],
    ['edit', { materialId: 'material-1' }, 'material-1'],
    ['create', { wasteId: 'waste-1' }, 'waste-1']
  ])('identifica la acción de eliminar en modo %s', (mode, row, identifier) => {
    const columns = buildDetailsColumns({ type: 'issue', mode });
    const actionsColumn = columns.at(-1);
    const action = actionsColumn.render(null, null, row);

    expect(action).toContain('delete-btn');
    expect(action).toContain('Eliminar detalle');
    expect(action).toContain(`data-id="${ identifier }"`);
    expect(action).not.toContain('disabled');
  });

  it.each([
    [
      'material',
      { id: 'detail-1', materialId: 'material-1', supplierId: 'supplier-1', quantity: 1 },
      { materialId: 'material-1', supplierId: 'supplier-1', quantity: 3 },
      detail => detail.materialId === 'material-1' && detail.supplierId === 'supplier-1'
    ],
    [
      'merma',
      { id: 'detail-1', wasteId: 'waste-1', quantity: 1 },
      { wasteId: 'waste-1', quantity: 3 },
      detail => detail.wasteId === 'waste-1'
    ]
  ])('mantiene eliminar visible al sustituir durante edición pendiente un detalle de %s registrado', (
    _,
    persistedDetail,
    replacement,
    matches
  ) => {
    const details = [persistedDetail];

    upsertIssueDetail({ details, detail: replacement, matches });

    const columns = buildDetailsColumns({ type: 'issue', mode: 'edit' });
    const action = columns.at(-1).render(null, null, details[0]);

    expect(action).toContain('delete-btn');
    expect(action).toContain('Eliminar detalle');
    expect(action).toContain('data-id="detail-1"');
    expect(action).not.toContain('disabled');
  });

});
