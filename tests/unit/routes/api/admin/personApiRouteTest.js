import { describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const post = vi.fn();
const put = vi.fn();
const authorizeUserApi = vi.fn(permission => `authorize:${ permission }`);
const verifyApiTokenRequired = vi.fn();
const validate = vi.fn();
const personValidation = [vi.fn()];
const getAllPersons = vi.fn();
const registerPerson = vi.fn();
const editPerson = vi.fn();

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

vi.mock('../../../../../src/validators/forms/personValidations.js', () => ({ personValidation }));

vi.mock('../../../../../src/controllers/api/admin/personController.js', () => ({
  editPerson,
  getAllPersons,
  registerPerson
}));

const { PERMISSIONS } = await import('../../../../../src/constants/permissions.js');
const { default: personApiRoutes } = await import('../../../../../src/routes/api/admin/personApiRoute.js');

describe('personApiRoute', () => {
  it('resuelve los resultados del validador antes de autorizar y ejecutar cada escritura', () => {
    expect(personApiRoutes).toEqual({ get, post, put });
    expect(post).toHaveBeenCalledWith(
      '/',
      verifyApiTokenRequired,
      personValidation,
      validate,
      `authorize:${ PERMISSIONS.PERSONS_WRITE }`,
      registerPerson
    );
    expect(put).toHaveBeenCalledWith(
      '/:id',
      verifyApiTokenRequired,
      personValidation,
      validate,
      `authorize:${ PERMISSIONS.PERSONS_WRITE }`,
      editPerson
    );
  });
});
