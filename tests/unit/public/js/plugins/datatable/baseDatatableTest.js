import { describe, expect, it } from 'vitest';

import { renderActionButtons } from '../../../../../../src/public/js/plugins/datatable/baseDatatable.js';

describe('renderActionButtons para salidas de merma', () => {
  it.each([
    ['Pendiente', 'btn-edit-detail', ['btn-return-detail']],
    ['Surtido parcial', 'btn-edit-detail', ['btn-return-detail']],
    ['Surtido', 'btn-return-detail', ['btn-edit-detail']],
    ['Cancelado', 'btn-edit', ['btn-edit-detail', 'btn-return-detail']]
  ])('aplica la acción del estado %s', (fulfillmentStatus, expectedAction, excludedActions) => {
    const buttons = renderActionButtons({
      context: 'wasteIssue',
      fulfillmentStatus,
      canManage: true,
      canSupply: true
    });

    expect(buttons).toContain(expectedAction);
    excludedActions.forEach(action => expect(buttons).not.toContain(action));
  });
});
