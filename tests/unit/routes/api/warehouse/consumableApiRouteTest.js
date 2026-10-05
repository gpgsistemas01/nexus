import { describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const post = vi.fn();
const patch = vi.fn();
const remove = vi.fn();
const authorizeUserApi = vi.fn(permission => `authorize:${ permission }`);
const verifyApiTokenRequired = vi.fn();
const getAllConsumables = vi.fn();
const registerConsumable = vi.fn();
const editConsumable = vi.fn();
const editConsumableStock = vi.fn();
const removeConsumable = vi.fn();
const validate = vi.fn();
const materialValidation = [vi.fn()];
const materialEditValidation = [vi.fn()];
const materialStockValidation = [vi.fn()];

vi.mock('express', () => ({
  default: { Router: () => ({ get, post, patch, delete: remove }) }
}));

vi.mock('../../../../../src/middleware/authMiddleware.js', () => ({
  authorizeUserApi,
  verifyApiTokenRequired
}));

vi.mock('../../../../../src/controllers/api/warehouse/consumableController.js', () => ({
  editConsumable,
  editConsumableStock,
  getAllConsumables,
  registerConsumable,
  removeConsumable
}));

vi.mock('../../../../../src/middleware/validatorMiddleware.js', () => ({ validate }));
vi.mock('../../../../../src/validators/forms/materialValidations.js', () => ({
  materialEditValidation,
  materialStockValidation,
  materialValidation
}));

const { PERMISSIONS } = await import('../../../../../src/constants/permissions.js');
const { default: consumableApiRoutes } = await import('../../../../../src/routes/api/warehouse/consumableApiRoute.js');

describe('consumableApiRoute', () => {
  it('protege el listado con el permiso de lectura de materiales', () => {
    expect(consumableApiRoutes).toEqual({ get, post, patch, delete: remove });
    expect(get).toHaveBeenCalledWith(
      '/',
      verifyApiTokenRequired,
      `authorize:${ PERMISSIONS.MATERIALS_READ }`,
      getAllConsumables
    );
  });

  it('reutiliza validaciones y permisos de las escrituras de materiales', () => {
    expect(post).toHaveBeenCalledWith('/', verifyApiTokenRequired, materialValidation, validate, `authorize:${ PERMISSIONS.MATERIALS_WRITE }`, registerConsumable);
    expect(patch).toHaveBeenCalledWith('/:id', verifyApiTokenRequired, materialEditValidation, validate, `authorize:${ PERMISSIONS.MATERIALS_WRITE }`, editConsumable);
    expect(patch).toHaveBeenCalledWith('/:id/stock', verifyApiTokenRequired, materialStockValidation, validate, `authorize:${ PERMISSIONS.MATERIALS_ADJUST_STOCK }`, editConsumableStock);
    expect(remove).toHaveBeenCalledWith('/:id', verifyApiTokenRequired, `authorize:${ PERMISSIONS.MATERIALS_WRITE }`, removeConsumable);
  });
});
