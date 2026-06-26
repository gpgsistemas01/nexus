import { afterEach, describe, expect, it, vi } from 'vitest';

import { createDataTable } from '../src/public/js/plugins/datatable/baseDatatable.js';
import { buildResponsiveHeaderLabels, configureResponsiveHeaderGroups } from '../src/public/js/plugins/datatable/utils/responsive.js';

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
    const recalc = vi.fn();
    const page = Object.assign(vi.fn(), { info: vi.fn(() => ({ page: 0, pages: 1, recordsDisplay: 1 })) });
    const dataTable = vi.fn((options) => {
      options.drawCallback.call({ api: () => ({ columns: { adjust }, page, responsive: { recalc } }) }, {});
      return {};
    });

    vi.stubGlobal('$', () => ({ DataTable: dataTable }));

    createDataTable({ options: {} });

    expect(dataTable).toHaveBeenCalledWith(expect.objectContaining({
      autoWidth: false,
      responsive: {
        details: {
          type: 'inline',
          renderer: expect.any(Function)
        }
      }
    }));
    expect(adjust).toHaveBeenCalledOnce();
    expect(recalc).toHaveBeenCalledOnce();
  });

  it('genera etiquetas responsive combinando encabezados con rowspan y colspan', () => {
    const cell = (text, attrs = {}) => ({
      textContent: text,
      getAttribute: (name) => attrs[name]
    });
    const rows = [
      {
        children: [
          cell('Material', { rowspan: '2' }),
          cell('Medidas', { colspan: '2' }),
          cell('Compra', { rowspan: '2' }),
          cell('Conversión', { colspan: '2' })
        ]
      },
      {
        children: [
          cell('Base'),
          cell('Altura'),
          cell('Cantidad'),
          cell('Unidad')
        ]
      }
    ];
    const tableNode = { querySelectorAll: () => rows };

    expect(buildResponsiveHeaderLabels(tableNode)).toEqual([
      'Material',
      'Medidas / Base',
      'Medidas / Altura',
      'Compra',
      'Conversión / Cantidad',
      'Conversión / Unidad'
    ]);
  });

  it('sincroniza encabezados agrupados responsive reutilizando data-responsive-group', () => {
    const on = vi.fn();
    vi.stubGlobal('$', () => ({ on }));

    const groupHeader = {
      hidden: false,
      colSpan: 2,
      getAttribute: (name) => ({ colspan: '2', 'data-responsive-group': 'measures' })[name]
    };
    const childHeaders = [
      { hidden: false, getAttribute: (name) => ({ 'data-responsive-parent': 'measures' })[name] },
      { hidden: false, getAttribute: (name) => ({ 'data-responsive-parent': 'measures' })[name] }
    ];
    const rowspannedHeader = {
      hidden: false,
      getAttribute: (name) => ({ rowspan: '2' })[name]
    };
    const rows = [
      { children: [rowspannedHeader, groupHeader] },
      { children: childHeaders }
    ];
    const tableNode = {
      querySelector: vi.fn(() => groupHeader),
      querySelectorAll: vi.fn((selector) => {
        if (selector === 'thead tr') return rows;
        if (selector === 'thead th[data-responsive-parent]') return childHeaders;
        return childHeaders;
      })
    };
    const columns = {
      1: { visible: vi.fn(() => true), responsiveHidden: vi.fn(() => true) },
      2: { visible: vi.fn(() => true), responsiveHidden: vi.fn(() => false) }
    };
    const table = {
      table: () => ({ node: () => tableNode }),
      column: (index) => columns[index]
    };

    configureResponsiveHeaderGroups(table);

    expect(groupHeader.hidden).toBe(true);
    expect(groupHeader.colSpan).toBe(1);
    expect(childHeaders[0].hidden).toBe(false);
    expect(childHeaders[1].hidden).toBe(true);
    expect(on).toHaveBeenCalledWith('responsive-resize.dt column-visibility.dt draw.dt', expect.any(Function));
  });

  it('oculta encabezados con colspan aunque no tengan data-responsive-group', () => {
    const on = vi.fn();
    vi.stubGlobal('$', () => ({ on }));

    const groupHeader = {
      hidden: false,
      colSpan: 2,
      getAttribute: (name) => ({ colspan: '2' })[name]
    };
    const childHeaders = [
      { hidden: false, getAttribute: () => undefined },
      { hidden: false, getAttribute: () => undefined }
    ];
    const rows = [
      { children: [groupHeader] },
      { children: childHeaders }
    ];
    const tableNode = {
      querySelector: vi.fn(() => null),
      querySelectorAll: vi.fn((selector) => {
        if (selector === 'thead tr') return rows;
        if (selector === 'thead th[colspan]') return [groupHeader];
        return [];
      })
    };
    const columns = {
      0: { visible: vi.fn(() => true), responsiveHidden: vi.fn(() => false) },
      1: { visible: vi.fn(() => true), responsiveHidden: vi.fn(() => false) }
    };
    const table = {
      table: () => ({ node: () => tableNode }),
      column: (index) => columns[index]
    };

    configureResponsiveHeaderGroups(table);

    expect(groupHeader.hidden).toBe(true);
    expect(groupHeader.colSpan).toBe(1);
    expect(childHeaders[0].hidden).toBe(true);
    expect(childHeaders[1].hidden).toBe(true);
  });

});
