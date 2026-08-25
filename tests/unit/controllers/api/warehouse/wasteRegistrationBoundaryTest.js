import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

import { createControllerTestApp } from '../../../../helpers/controllerTestHarness.js';
import { validate } from '../../../../../src/middleware/validatorMiddleware.js';
import { wasteValidation } from '../../../../../src/validators/forms/wasteValidations.js';

const createWasteWithInitialStockAdjustment = vi.fn();

vi.mock('../../../../../src/services/warehouse/wastes/wasteService.js', () => ({
  createWasteWithInitialStockAdjustment,
  findAllWastes: vi.fn(),
  updateWaste: vi.fn(),
  updateWasteStock: vi.fn()
}));

vi.mock('../../../../../src/services/warehouse/wastes/wasteMaterialService.js', () => ({
  findWasteMaterialTemplates: vi.fn()
}));

const { registerWaste } = await import('../../../../../src/controllers/api/warehouse/wasteController.js');

const materialId = '00000000-0000-4000-8000-000000000001';
const supplierId = '00000000-0000-4000-8000-000000000003';
const userId = '00000000-0000-4000-8000-000000000002';

const app = createControllerTestApp({
  registerRoutes: (router) => {
    router.post(
      '/wastes',
      wasteValidation,
      validate,
      (req, _res, next) => {
        req.user = { id: userId };
        next();
      },
      registerWaste
    );
  }
});

const validBody = {
  materialId,
  supplierId,
  base: '1',
  height: '1',
  minStock: '0',
  maxUnitCost: '25',
  newStock: '0',
  isActive: true,
  observations: 'Registro inicial'
};

describe('wasteController registration boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createWasteWithInitialStockAdjustment.mockResolvedValue({ id: 'waste-1' });
  });

  it('acepta exactamente los máximos numéricos y de texto permitidos', async () => {
    const observations = 'a'.repeat(500);

    const response = await request(app)
      .post('/wastes')
      .send({
        ...validBody,
        base: '99999999.999999',
        height: '99999999.999999',
        newStock: '99999999.999999',
        observations
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toMatchObject({
      waste: { id: 'waste-1' },
      code: 'CREATED_WASTE'
    });
    expect(createWasteWithInitialStockAdjustment).toHaveBeenCalledWith({
      wasteDto: expect.objectContaining({
        base: 99999999.999999,
        height: 99999999.999999,
        newStock: 99999999.999999,
        observations
      }),
      userId
    });
  });

  it('permite costo nulo para que el servicio aplique el costo del material', async () => {
    await request(app)
      .post('/wastes')
      .send({ ...validBody, maxUnitCost: null })
      .expect(200);

    expect(createWasteWithInitialStockAdjustment).toHaveBeenCalledWith({
      wasteDto: expect.objectContaining({ maxUnitCost: null }),
      userId
    });
  });

  it.each([
    ['partición de equivalencia', 'UUID de material inválido', { materialId: 'not-a-uuid' }, 'materialId'],
    ['partición de equivalencia', 'UUID de proveedor inválido', { supplierId: 'not-a-uuid' }, 'supplierId'],
    ['valor límite', 'dimensión en cero', { base: '0' }, 'base'],
    ['tabla de decisiones', 'medidas ausentes', { base: undefined, height: undefined }, 'base'],
    ['tabla de decisiones', 'dimensión incompleta', { height: undefined }, 'height'],
    ['partición de equivalencia', 'stock no numérico', { newStock: 'NaN' }, 'newStock'],
    ['valor límite', 'stock negativo', { newStock: '-0.000001' }, 'newStock'],
    ['valor límite', 'costo máximo negativo', { maxUnitCost: '-0.000001' }, 'maxUnitCost'],
    ['valor límite', 'primer entero sobre el máximo', { newStock: '100000000' }, 'newStock'],
    ['valor límite', 'primer decimal sobre el máximo', { newStock: '1.0000001' }, 'newStock'],
    ['valor límite', '501 caracteres de observaciones', { observations: 'a'.repeat(501) }, 'observations']
  ])('%s: rechaza %s antes de intentar registrar', async (_strategy, _case, overrides, errorField) => {
    const response = await request(app)
      .post('/wastes')
      .send({ ...validBody, ...overrides })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      errors: { [errorField]: expect.anything() }
    });
    expect(createWasteWithInitialStockAdjustment).not.toHaveBeenCalled();
  });
});
