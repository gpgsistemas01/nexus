import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import Swal from 'sweetalert2';
import { flushPromises } from '@vue/test-utils';
import { confirmAction, showSuccess } from '../../../../src/shared/ui/feedback.js';

beforeEach(() => {
  vi.useFakeTimers();
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
});
afterEach(async () => {
  Swal.close();
  await vi.runOnlyPendingTimersAsync();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('cancelar al desmontar antes de terminar de abrir no deja una confirmación global pendiente', async () => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  const controller = new AbortController();
  const submit = vi.fn();
  const confirming = confirmAction({
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

const hostileText = '<img data-injected src=x onerror="window.injected=true">';

it('un aviso de éxito conserva el mensaje como texto', async () => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  const showing = showSuccess(hostileText);
  expect(Swal.getTitle()?.innerText).toBe(hostileText);
  expect(Swal.getPopup()?.querySelector('[data-injected]')).toBeNull();
  Swal.close();
  await showing;
});

it('la confirmación y el error del servidor no interpretan HTML', async () => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  const controller = new AbortController();
  const errorText = `Fallo: ${hostileText}`;
  const submit = vi.fn(async () => {
    throw new Error(errorText);
  });
  const confirming = confirmAction({
    title: hostileText,
    description: hostileText,
    signal: controller.signal,
    submit,
  });
  expect(Swal.getTitle()?.innerText).toBe(hostileText);
  expect(Swal.getHtmlContainer()?.textContent).toBe(hostileText);
  expect(Swal.getPopup()?.querySelector('[data-injected]')).toBeNull();
  Swal.clickConfirm();
  await flushPromises();
  expect(submit).toHaveBeenCalledOnce();
  expect(Swal.getHtmlContainer()?.textContent).toBe(errorText);
  expect(Swal.getPopup()?.querySelector('[data-injected]')).toBeNull();
  controller.abort();
  await vi.runOnlyPendingTimersAsync();
  await expect(confirming).resolves.toBe(false);
});
