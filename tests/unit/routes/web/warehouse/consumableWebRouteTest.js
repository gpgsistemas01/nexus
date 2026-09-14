import { describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const authorizeUserWeb = vi.fn(permission => `authorize:${permission}`);
const verifyCookiesAuthTokenRequired = vi.fn();
const getConsumablesPage = vi.fn();

vi.mock('express', () => ({
  default: {
    Router: () => ({ get })
  }
}));

vi.mock('../../../../../src/middleware/authMiddleware.js', () => ({
  authorizeUserWeb,
  verifyCookiesAuthTokenRequired
}));

vi.mock('../../../../../src/controllers/web/warehouse/consumableController.js', () => ({
  getConsumablesPage
}));

const { PERMISSIONS } = await import('../../../../../src/constants/permissions.js');
const { default: consumableWebRoutes } = await import('../../../../../src/routes/web/warehouse/consumableWebRoute.js');

describe('consumableWebRoute', () => {
  it('registers the consumables page with authentication and the material read permission', () => {
    expect(consumableWebRoutes).toEqual({ get });
    expect(authorizeUserWeb).toHaveBeenCalledWith(PERMISSIONS.MATERIALS_READ);
    expect(get).toHaveBeenCalledWith(
      '/',
      verifyCookiesAuthTokenRequired,
      `authorize:${PERMISSIONS.MATERIALS_READ}`,
      getConsumablesPage
    );
  });
});
