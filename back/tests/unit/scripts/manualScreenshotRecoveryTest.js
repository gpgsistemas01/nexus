import { describe, expect, it, vi } from 'vitest';

import { captureWithRecovery, isTimeoutError } from '../../../scripts/manualScreenshotRecovery.js';

const createPage = () => ({ close: vi.fn().mockResolvedValue() });

describe('manual screenshot recovery', () => {
  it('detects timeout errors through their cause', () => {
    const timeout = Object.assign(new Error('operation failed'), { name: 'TimeoutError' });
    const wrappedError = new Error('No pudo cargarse', { cause: timeout });

    expect(isTimeoutError(wrappedError)).toBe(true);
    expect(isTimeoutError(new Error('selector ausente'))).toBe(false);
  });

  it('uses a new page when retrying a timed-out capture', async () => {
    const firstPage = createPage();
    const secondPage = createPage();
    const context = { newPage: vi.fn().mockResolvedValueOnce(firstPage).mockResolvedValueOnce(secondPage) };
    const capturePage = vi.fn()
      .mockRejectedValueOnce(Object.assign(new Error('Timeout exceeded'), { name: 'TimeoutError' }))
      .mockResolvedValueOnce();
    const onRetry = vi.fn();

    await captureWithRecovery({
      context,
      capture: { id: 'CAP-TEST' },
      capturePage,
      retries: 1,
      retryDelay: 0,
      onRetry
    });

    expect(capturePage).toHaveBeenNthCalledWith(1, firstPage, { id: 'CAP-TEST' });
    expect(capturePage).toHaveBeenNthCalledWith(2, secondPage, { id: 'CAP-TEST' });
    expect(firstPage.close).toHaveBeenCalledOnce();
    expect(secondPage.close).toHaveBeenCalledOnce();
    expect(onRetry).toHaveBeenCalledWith(1);
  });

  it('does not retry a non-timeout failure', async () => {
    const page = createPage();
    const context = { newPage: vi.fn().mockResolvedValue(page) };
    const error = new Error('No existe el selector');

    await expect(captureWithRecovery({
      context,
      capture: { id: 'CAP-TEST' },
      capturePage: vi.fn().mockRejectedValue(error),
      retries: 2,
      retryDelay: 0,
      onRetry: vi.fn()
    })).rejects.toBe(error);
    expect(context.newPage).toHaveBeenCalledOnce();
    expect(page.close).toHaveBeenCalledOnce();
  });
});
