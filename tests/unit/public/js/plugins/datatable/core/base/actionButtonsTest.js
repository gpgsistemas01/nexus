import { describe, expect, it } from 'vitest';

import { renderActionButtons } from '../../../../../../../../src/public/js/plugins/datatable/core/base/actionButtons.js';

describe('renderActionButtons para el CRUD de salidas', () => {
  it.each([
    ['goodsIssue', 'Pendiente', 'btn-edit-detail', ['btn-return-detail']],
    ['goodsIssue', 'Surtido parcial', 'btn-edit-detail', ['btn-return-detail']],
    ['goodsIssue', 'Surtido', 'btn-return-detail', ['btn-edit-detail']],
    ['wasteIssue', 'Pendiente', 'btn-edit-detail', ['btn-return-detail']],
    ['wasteIssue', 'Surtido parcial', 'btn-edit-detail', ['btn-return-detail']],
    ['wasteIssue', 'Surtido', 'btn-return-detail', ['btn-edit-detail']]
  ])('aplica a %s la acción del estado de surtido %s', (context, fulfillmentStatus, expectedAction, excludedActions) => {
    const buttons = renderActionButtons({
      context,
      status: 'Aprobada',
      fulfillmentStatus,
      canManage: true,
      canSupply: true
    });

    expect(buttons).toContain(expectedAction);
    excludedActions.forEach(action => expect(buttons).not.toContain(action));
  });

  it.each(['goodsIssue', 'wasteIssue'])('impide editar, surtir o devolver una %s cancelada', context => {
    const buttons = renderActionButtons({
      context,
      status: 'Cancelada',
      fulfillmentStatus: 'Surtido',
      canManage: true,
      canSupply: true
    });

    expect(buttons).toContain('Ver registro');
    expect(buttons).not.toContain('Editar registro');
    expect(buttons).not.toContain('btn-edit-detail');
    expect(buttons).not.toContain('btn-return-detail');
  });
});
