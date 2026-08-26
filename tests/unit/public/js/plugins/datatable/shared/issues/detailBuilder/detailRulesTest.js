import { describe, expect, it } from 'vitest';

import { shouldShowDetailActionButtons } from '../../../../../../../../../src/public/js/plugins/datatable/shared/issues/detailBuilder/detailRules.js';

describe('reglas de acciones CRUD para detalles compartidos de salidas', () => {
  it('muestra eliminar para cualquier detalle durante el alta', () => {
    expect(shouldShowDetailActionButtons({
      row: { wasteId: 'waste-1' },
      mode: 'create'
    })).toBe(true);
  });

  it('mantiene eliminar al sustituir durante la edición un detalle que conserva el id documental', () => {
    expect(shouldShowDetailActionButtons({
      row: { id: 'detail-1', wasteId: 'waste-1', quantity: 3 },
      mode: 'edit'
    })).toBe(true);
  });

  it('mantiene eliminar para un detalle documental activo durante la edición', () => {
    expect(shouldShowDetailActionButtons({
      row: { id: 'detail-1', wasteId: 'waste-1' },
      mode: 'edit'
    })).toBe(true);
  });
});
