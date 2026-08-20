import { describe, expect, it } from 'vitest';

import { createTableFilterState } from '../../../../../../../../src/public/js/plugins/datatable/utils/filters/tableFilterState.js';

describe('tableFilterState', () => {
  it('mantiene los filtros aplicados mientras sólo cambian los controles', () => {
    let supplierId = 'supplier-1';
    const state = createTableFilterState({
      supplier: () => ({ supplierId })
    });

    state.apply();
    supplierId = 'supplier-2';

    expect(state.getValues()).toEqual({ supplierId: 'supplier-1' });
  });

  it('reemplaza en conjunto los valores al aplicar o limpiar filtros', () => {
    let values = { startDate: '2026-08-01', endDate: '2026-08-20' };
    const state = createTableFilterState({
      date: () => values
    });

    expect(state.apply()).toEqual(values);

    values = { startDate: '', endDate: '' };

    expect(state.apply()).toEqual(values);
    expect(state.getValues()).toEqual(values);
  });

  it('devuelve copias para impedir que un consumidor altere el estado aplicado', () => {
    const state = createTableFilterState({
      observations: () => ({ observationsSearch: 'dañado' })
    });

    const values = state.apply();
    values.observationsSearch = 'modificado';

    expect(state.getValues()).toEqual({ observationsSearch: 'dañado' });
  });
});
