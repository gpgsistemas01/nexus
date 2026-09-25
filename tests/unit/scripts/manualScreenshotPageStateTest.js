import { describe, expect, it, vi } from 'vitest';

import { waitForCaptureReady } from '../../../scripts/manualScreenshotPageState.js';

const capture = {
  id: 'CAP-CAT-SUP-00-NAVIGATION',
  area: 'almacen',
  route: '/proveedores',
  ready: '#table'
};

const createPage = ({ ready = false, login = false } = {}) => {
  const terminalState = { waitFor: vi.fn().mockResolvedValue() };
  const readyState = { first: vi.fn().mockReturnThis(), isVisible: vi.fn().mockResolvedValue(ready) };
  const loginState = { isVisible: vi.fn().mockResolvedValue(login) };
  const page = {
    locator: vi.fn(selector => {
      if (selector === `${ capture.ready }, #loginForm, .error-card`) {
        return { first: vi.fn().mockReturnValue(terminalState) };
      }
      if (selector === capture.ready) return readyState;
      if (selector === '#loginForm') return loginState;
      throw new Error(`Selector inesperado: ${ selector }`);
    }),
    url: vi.fn().mockReturnValue('http://127.0.0.1:3000/error/404')
  };
  return { page, terminalState };
};

describe('manual screenshot page state', () => {
  it('accepts the expected ready selector', async () => {
    const { page, terminalState } = createPage({ ready: true });

    await expect(waitForCaptureReady(page, capture, 'http://127.0.0.1:3000')).resolves.toBeUndefined();
    expect(terminalState.waitFor).toHaveBeenCalledWith({ state: 'visible' });
  });

  it('reports an expired or mismatched authenticated session without a timeout error', async () => {
    const { page } = createPage({ login: true });

    await expect(waitForCaptureReady(page, capture, 'http://127.0.0.1:3000'))
      .rejects.toThrow('expiró o no pertenece a la instancia http://127.0.0.1:3000');
  });

  it('reports a permission error when Nexus renders an error page', async () => {
    const { page } = createPage();

    await expect(waitForCaptureReady(page, capture, 'http://127.0.0.1:3000'))
      .rejects.toThrow('tenga permiso para abrir /proveedores');
  });
});
