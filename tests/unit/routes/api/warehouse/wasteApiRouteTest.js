import { describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const post = vi.fn();
const patch = vi.fn();
const authorizeUserApi = vi.fn(permission => `authorize:${ permission }`);
const verifyApiTokenRequired = vi.fn();
const validate = vi.fn();
const wasteValidation = [vi.fn()];
const wasteEditValidation = [vi.fn()];
const wasteStockValidation = [vi.fn()];
const getWasteMaterialTemplates = vi.fn();
const getAllWastes = vi.fn();
const registerWaste = vi.fn();
const editWaste = vi.fn();
const editWasteStock = vi.fn();

vi.mock('express', () => ({
  default: {
    Router: () => ({ get, post, patch })
  }
}));

vi.mock('../../../../../src/middleware/authMiddleware.js', () => ({
  authorizeUserApi,
  verifyApiTokenRequired
}));

vi.mock('../../../../../src/middleware/validatorMiddleware.js', () => ({ validate }));

vi.mock('../../../../../src/validators/forms/wasteValidations.js', () => ({
  wasteEditValidation,
  wasteStockValidation,
  wasteValidation
}));

vi.mock('../../../../../src/controllers/api/warehouse/wasteController.js', () => ({
  editWaste,
  editWasteStock,
  getAllWastes,
  getWasteMaterialTemplates,
  registerWaste
}));

const { PERMISSIONS } = await import('../../../../../src/constants/permissions.js');
const { default: wasteApiRoutes } = await import('../../../../../src/routes/api/warehouse/wasteApiRoute.js');

describe('wasteApiRoute', () => {
  it('asigna a cada escritura del CRUD su validador y permiso específicos', () => {
    expect(wasteApiRoutes).toEqual({ get, post, patch });
    expect(post).toHaveBeenCalledWith(
      '/',
      verifyApiTokenRequired,
      wasteValidation,
      validate,
      `authorize:${ PERMISSIONS.WASTES_WRITE }`,
      registerWaste
    );
    expect(patch).toHaveBeenCalledWith(
      '/:id',
      verifyApiTokenRequired,
      wasteEditValidation,
      validate,
      `authorize:${ PERMISSIONS.WASTES_WRITE }`,
      editWaste
    );
    expect(patch).toHaveBeenCalledWith(
      '/:id/stock',
      verifyApiTokenRequired,
      wasteStockValidation,
      validate,
      `authorize:${ PERMISSIONS.WASTES_ADJUST_STOCK }`,
      editWasteStock
    );
  });
});
