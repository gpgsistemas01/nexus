import { describe, expect, it } from 'vitest';

import { getFallbackPageForEmptyDataTableResponse } from '../src/public/js/plugins/datatable/baseDatatable.js';

describe('baseDatatable', () => {
  it('regresa a la última página disponible cuando la página actual queda vacía', () => {
    expect(getFallbackPageForEmptyDataTableResponse({
      requestData: { start: 20, length: 10 },
      responseData: { data: [], recordsFiltered: 19 }
    })).toBe(1);
  });

  it('usa la página anterior cuando todavía hay más de una página disponible', () => {
    expect(getFallbackPageForEmptyDataTableResponse({
      requestData: { start: 30, length: 10 },
      responseData: { data: [], recordsFiltered: 29 }
    })).toBe(2);
  });

  it('mantiene la página actual si la respuesta tiene datos o no quedan registros', () => {
    expect(getFallbackPageForEmptyDataTableResponse({
      requestData: { start: 10, length: 10 },
      responseData: { data: [{ id: 1 }], recordsFiltered: 11 }
    })).toBeNull();

    expect(getFallbackPageForEmptyDataTableResponse({
      requestData: { start: 10, length: 10 },
      responseData: { data: [], recordsFiltered: 0 }
    })).toBeNull();
  });
});
