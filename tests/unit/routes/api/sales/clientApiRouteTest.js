import { describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const post = vi.fn();
const put = vi.fn();
const authorizeUserApi = vi.fn(permission => `authorize:${ permission }`);
const verifyApiTokenRequired = vi.fn();
const validate = vi.fn();
const clientValidation = [vi.fn()];
const getAllClients = vi.fn();
const registerClient = vi.fn();
const editClient = vi.fn();

vi.mock('express', () => ({
  default: {
    Router: () => ({ get, post, put })
  }
}));

vi.mock('../../../../../src/middleware/authMiddleware.js', () => ({
  authorizeUserApi,
  verifyApiTokenRequired
}));

vi.mock('../../../../../src/middleware/validatorMiddleware.js', () => ({ validate }));

vi.mock('../../../../../src/validators/forms/clientValidations.js', () => ({ clientValidation }));

vi.mock('../../../../../src/controllers/api/sales/clientController.js', () => ({
  editClient,
  getAllClients,
  registerClient
}));

const { PERMISSIONS } = await import('../../../../../src/constants/permissions.js');
const { default: clientApiRoutes } = await import('../../../../../src/routes/api/sales/clientApiRoute.js');

describe('clientApiRoute', () => {
  it('valida las altas y ediciones antes de comprobar su permiso y ejecutar el controller', () => {
    expect(clientApiRoutes).toEqual({ get, post, put });
    expect(post).toHaveBeenCalledWith(
      '/',
      verifyApiTokenRequired,
      clientValidation,
      validate,
      `authorize:${ PERMISSIONS.CLIENTS_CREATE }`,
      registerClient
    );
    expect(put).toHaveBeenCalledWith(
      '/:id',
      verifyApiTokenRequired,
      clientValidation,
      validate,
      `authorize:${ PERMISSIONS.CLIENTS_UPDATE }`,
      editClient
    );
  });
});
