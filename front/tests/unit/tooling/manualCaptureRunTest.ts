import { afterEach, expect, it, vi } from 'vitest';
import { runManualCapture } from '../../../scripts/manual/capture.mjs';

afterEach(() => vi.useRealTimers());

it('conserva el resultado y limpia el temporizador cuando la captura termina', async () => {
  vi.useFakeTimers();
  const cancel = vi.fn();
  expect(await runManualCapture(async () => 'capturada', { timeout: 90, cancel })).toBe(
    'capturada',
  );
  await vi.advanceTimersByTimeAsync(100);
  expect(cancel).not.toHaveBeenCalled();
});

it('cancela y espera la operación antes de continuar después del límite', async () => {
  vi.useFakeTimers();
  let close: (error: Error) => void = () => {};
  let finished = false;
  const work = new Promise((_resolve, reject) => {
    close = reject;
  });
  const cancel = vi.fn(async () => {
    close(new Error('Página cerrada'));
  });
  const result = runManualCapture(
    async () => {
      try {
        await work;
      } finally {
        finished = true;
      }
    },
    { timeout: 90, cancel },
  );
  const checked = expect(result).rejects.toThrow('su página se canceló antes de continuar');
  await vi.advanceTimersByTimeAsync(90);
  await checked;
  expect(finished).toBe(true);
  expect(cancel).toHaveBeenCalledTimes(1);
});

it('conserva un error de consulta y no lo convierte en ausencia de datos ni en cierre de página', async () => {
  vi.useFakeTimers();
  const cause = new Error('HTTP 503');
  const cancel = vi.fn();
  await expect(
    runManualCapture(
      async () => {
        throw cause;
      },
      { timeout: 90, cancel },
    ),
  ).rejects.toBe(cause);
  await vi.advanceTimersByTimeAsync(100);
  expect(cancel).not.toHaveBeenCalled();
});
