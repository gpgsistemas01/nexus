import { afterEach, expect, it, vi } from 'vitest';
import { mountComposable } from '../../../helpers/mountComposable.js';
import { useReportScope } from '../../../../src/shared/composables/useReportScope.js';
import { useFileExport } from '../../../../src/shared/composables/useFileExport.js';
import { reportFilename, reportParams } from '../../../../src/shared/report.js';
import type { ReportScope } from '../../../../src/shared/report.js';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it('el nombre de una plantilla conserva la operación elegida al iniciar la descarga', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-05T12:00:00Z'));
  vi.stubGlobal('URL', { createObjectURL: () => 'blob:excel', revokeObjectURL: vi.fn() });
  const names: string[] = [];
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    names.push(this.download);
  });
  let mode = 'create';
  let complete!: (file: Blob) => void;
  const mounted = mountComposable(() =>
    useFileExport({
      canExport: () => true,
      filename: () => `plantilla_materials_${mode}`,
      onDenied: vi.fn(),
      request: () =>
        new Promise<Blob>((resolve) => {
          complete = resolve;
        }),
    }),
  );
  const download = mounted.value.exportReport(undefined);
  mode = 'adjust';
  complete(new Blob(['xlsx']));
  await download;
  expect(names).toEqual(['plantilla_materials_create_11_2026.xlsx']);
  mounted.wrapper.unmount();
  vi.runAllTimers();
});

it.each(['reporte_clientes', 'reporte_clientes.xlsx'])(
  'nombra %s con fecha de México y una extensión',
  (name) => {
    expect(reportFilename(name, new Date('2026-07-01T05:30:00Z'))).toBe(
      'reporte_clientes_06_2026.xlsx',
    );
    expect(reportFilename(name, new Date('2026-07-01T06:30:00Z'))).toBe(
      'reporte_clientes_07_2026.xlsx',
    );
  },
);

it.each(['period', 'inventory', 'filtered'] as const)(
  'comparte confirmación y descarga para %s y conserva los filtros actuales',
  async (kind) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-05T12:00:00Z'));
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:excel', revokeObjectURL });
    const names: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      names.push(this.download);
    });
    let search = '';
    const received: string[] = [];
    const request = vi.fn<(scope: ReportScope, signal: AbortSignal) => Promise<Blob>>(async () => {
      received.push(search);
      return new Blob(['excel']);
    });
    const { value } = mountComposable(() =>
      useReportScope({
        kind,
        request,
        filename: 'reporte_prueba',
        canExport: () => true,
        onDenied: vi.fn(),
      }),
    );
    value.openReport();
    value.isReportOpen.value = false;
    expect(request).not.toHaveBeenCalled();
    value.openReport();
    if (kind === 'inventory') value.setInventoryScope('inStock');
    search = 'Lona';
    vi.setSystemTime(new Date('2026-12-05T12:00:00Z'));
    await value.exportReport();
    expect(received).toEqual(['Lona']);
    expect(value.isReportOpen.value).toBe(false);
    expect(names).toEqual(['reporte_prueba_12_2026.xlsx']);
    expect(request.mock.calls[0]?.[0]).toMatchObject(
      kind === 'inventory'
        ? { inventoryScope: 'inStock', mode: 'filtered' }
        : { mode: kind === 'period' ? 'current-month' : 'filtered' },
    );
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:excel');
  },
);

it('los periodos comparten orden y omiten filtros; personalizado conserva búsqueda y excluye paginación', () => {
  const query = new URLSearchParams({
    search: 'Lona',
    departmentId: 'area',
    start: '20',
    length: '10',
    'order[0][column]': '2',
    'order[0][dir]': 'desc',
  });
  expect(
    Object.fromEntries(reportParams(query, { mode: 'specific-month', month: '2026-07' })),
  ).toEqual({
    monthlyReport: 'true',
    reportMonth: '2026-07',
    'order[0][column]': '2',
    'order[0][dir]': 'desc',
  });
  expect(Object.fromEntries(reportParams(query, { mode: 'filtered', month: '' }))).toEqual({
    search: 'Lona',
    departmentId: 'area',
    'order[0][column]': '2',
    'order[0][dir]': 'desc',
  });
  expect(query.get('length')).toBe('10');
});
