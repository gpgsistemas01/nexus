import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import Swal from 'sweetalert2';
import { confirmRemoval } from '../../../../src/shared/ui/feedback.js';

beforeEach(() => vi.useFakeTimers());
afterEach(async () => {
  Swal.close();
  await vi.runOnlyPendingTimersAsync();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it('cancelar al desmontar antes de terminar de abrir no deja una confirmación global pendiente', async () => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  const controller = new AbortController();
  const submit = vi.fn();
  const confirming = confirmRemoval({
    title: 'Eliminar material',
    description: 'Proveedor de prueba',
    signal: controller.signal,
    submit,
  });
  expect(Swal.getPopup()).not.toBeNull();
  controller.abort();
  await vi.runOnlyPendingTimersAsync();
  await expect(confirming).resolves.toBe(false);
  expect(Swal.getPopup()).toBeNull();
  expect(submit).not.toHaveBeenCalled();
});
