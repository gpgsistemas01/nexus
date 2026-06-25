import { afterEach, describe, expect, it, vi } from 'vitest';

import { createDataTable } from '../src/public/js/plugins/datatable/baseDatatable.js';

describe('baseDatatable', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('agrega un drawCallback que mueve la tabla a la última página disponible si la actual queda fuera de rango', () => {
    const page = vi.fn(() => ({ draw }));
    const draw = vi.fn();
    const info = vi.fn(() => ({ page: 2, pages: 2, recordsDisplay: 19 }));
    const dataTable = vi.fn((options) => options.drawCallback.call({ api: () => ({ page: Object.assign(page, { info }) }) }, {}));

    vi.stubGlobal('$', () => ({ DataTable: dataTable }));

    createDataTable({ options: {} });

    expect(page).toHaveBeenCalledWith(1);
    expect(draw).toHaveBeenCalledWith('page');
  });

  it('ejecuta el drawCallback personalizado cuando la página actual sigue siendo válida', () => {
    const customDrawCallback = vi.fn();
    const page = Object.assign(vi.fn(), { info: vi.fn(() => ({ page: 1, pages: 2, recordsDisplay: 11 })) });
    const dataTable = vi.fn((options) => options.drawCallback.call({ api: () => ({ page }) }, { draw: true }));

    vi.stubGlobal('$', () => ({ DataTable: dataTable }));

    createDataTable({ options: { drawCallback: customDrawCallback } });

    expect(page).not.toHaveBeenCalled();
    expect(customDrawCallback).toHaveBeenCalledWith({ draw: true });
  });

  it('habilita responsive de DataTables y recalcula columnas al redibujar', () => {
    const adjust = vi.fn();
    const page = Object.assign(vi.fn(), { info: vi.fn(() => ({ page: 0, pages: 1, recordsDisplay: 1 })) });
    const dataTable = vi.fn((options) => {
      options.drawCallback.call({ api: () => ({ columns: { adjust }, page }) }, {});
      return {};
    });

    vi.stubGlobal('$', () => ({ DataTable: dataTable }));

    createDataTable({ options: {} });

    expect(dataTable).toHaveBeenCalledWith(expect.objectContaining({
      autoWidth: false,
      responsive: {
        details: {
          type: 'inline'
        }
      }
    }));
    expect(adjust).toHaveBeenCalledOnce();
  });
});
