import { expect, it, vi } from 'vitest';
import { mountComposable } from '../../../helpers/mountComposable.js';
import { useReportScope } from '../../../../src/shared/composables/useReportScope.js';

it('el alcance valida antes de pedir el archivo y conserva el diálogo al fallar', async () => {
  const request = vi.fn().mockRejectedValue(new Error('Reporte no disponible'));
  const { value } = mountComposable(() =>
    useReportScope({ canExport: () => true, request, filename: 'compras.xlsx', onDenied: vi.fn() }),
  );
  value.openReport();
  expect(value.reportFormError.value).toBe('');
  value.setReportMode('specific-month');
  await value.exportReport();
  expect(request).not.toHaveBeenCalled();
  expect(value.reportFormError.value).toContain('mes válido');
  value.setReportMonth('2026-10');
  expect(value.reportFormError.value).toBe('');
  await value.exportReport();
  expect(request).toHaveBeenCalledWith(
    { mode: 'specific-month', month: '2026-10' },
    expect.any(AbortSignal),
  );
  expect(value.isReportOpen.value).toBe(true);
  expect(value.exportError.value).toBe('Reporte no disponible');
  value.openReport();
  expect(value.exportError.value).toBe('');
});

it('no abre ni solicita reportes sin permiso', async () => {
  const request = vi.fn();
  const { value } = mountComposable(() =>
    useReportScope({
      canExport: () => false,
      request,
      filename: 'compras.xlsx',
      onDenied: vi.fn(),
    }),
  );
  value.openReport();
  await value.exportReport();
  expect(value.isReportOpen.value).toBe(false);
  expect(request).not.toHaveBeenCalled();
});
