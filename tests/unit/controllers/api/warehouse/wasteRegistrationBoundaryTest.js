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
  name: 'Recorte de prueba',
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
        coneWeightKg: '0',
        totalWeightKg: '100',
        sampleLengthM: 2, sampleNetWeightKg: 0.2,
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
        coneWeightKg: 0,
        totalWeightKg: 100,
        observations
      }),
      userId
    });
  });

  it.each([
    ['partición de equivalencia', 'nombre vacío', { name: '' }, 'name'],
    ['partición de equivalencia', 'UUID de material inválido', { materialId: 'not-a-uuid' }, 'materialId'],
    ['partición de equivalencia', 'UUID de proveedor inválido', { supplierId: 'not-a-uuid' }, 'supplierId'],
    ['valor límite', 'dimensión en cero', { base: '0' }, 'base'],
    ['partición de equivalencia', 'stock no numérico', { newStock: 'NaN' }, 'newStock'],
    ['valor límite', 'stock negativo', { newStock: '-0.000001' }, 'newStock'],
    ['valor límite', 'costo máximo negativo', { maxUnitCost: '-0.000001' }, 'maxUnitCost'],
    ['partición de equivalencia', 'costo máximo nulo', { maxUnitCost: null }, 'maxUnitCost'],
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
  it.each([undefined, null, '', '0.01'])('admite peso desconocido o el mínimo positivo: %s', weightKg => {
    return request(app).post('/wastes').send({ ...validBody, ...(weightKg ? { sampleLengthM: 2, sampleNetWeightKg: 0.2 } : {}), coneWeightKg: weightKg == null || weightKg === '' ? weightKg : 0, totalWeightKg: weightKg }).expect(200);
  });

  it.each([
    [0, 'WEIGHT_KG_INVALID_NUMBER'],
    [-1, 'WEIGHT_KG_INVALID_NUMBER'],
    ['abc', 'WEIGHT_KG_INVALID_NUMBER'],
    ['0.75abc', 'WEIGHT_KG_INVALID_NUMBER'],
    ['1e3', 'WEIGHT_KG_INVALID_NUMBER'],
    ['1,25', 'WEIGHT_KG_INVALID_NUMBER'],
    ['Infinity', 'WEIGHT_KG_INVALID_NUMBER'],
    ['NaN', 'WEIGHT_KG_INVALID_NUMBER'],
    [true, 'WEIGHT_KG_INVALID_NUMBER'],
    [[1], 'WEIGHT_KG_INVALID_NUMBER'],
    [{ value: 1 }, 'WEIGHT_KG_INVALID_NUMBER'],
    [' ', 'WEIGHT_KG_INVALID_NUMBER'],
    ['1\n', 'WEIGHT_KG_INVALID_NUMBER'],
    [' 1', 'WEIGHT_KG_INVALID_NUMBER'],
    ['1 ', 'WEIGHT_KG_INVALID_NUMBER'],
    ['+1', 'WEIGHT_KG_INVALID_NUMBER'],
    ['1.001', 'WEIGHT_KG_TOO_LONG'],
    ['100.000', 'WEIGHT_KG_TOO_LONG'],
    ['0001', 'WEIGHT_KG_TOO_LONG'],
    ['999.990001', 'WEIGHT_KG_TOO_HIGH'],
    [1000, 'WEIGHT_KG_TOO_HIGH'],
    ['100000000', 'WEIGHT_KG_TOO_HIGH'],
    ['0.001', 'WEIGHT_KG_TOO_LONG'],
    [0.001, 'WEIGHT_KG_TOO_LONG'],
    [1e21, 'WEIGHT_KG_TOO_HIGH']
  ])('rechaza peso %s antes de normalizarlo y devuelve el código correcto', async (weightKg, code) => {
    const response = await request(app).post('/wastes').send({ ...validBody, coneWeightKg: 0, totalWeightKg: weightKg }).expect(400);
    expect(response.body.errors.totalWeightKg.code).toBe(code);
    expect(createWasteWithInitialStockAdjustment).not.toHaveBeenCalled();
  });

  it.each([
    [{ totalWeightKg: 2 }, 'coneWeightKg', 'CONE_WEIGHT_KG_REQUIRED'],
    [{ coneWeightKg: 0 }, 'totalWeightKg', 'TOTAL_WEIGHT_KG_REQUIRED'],
    [{ coneWeightKg: -1, totalWeightKg: 2 }, 'coneWeightKg', 'CONE_WEIGHT_KG_INVALID_NUMBER'],
    [{ coneWeightKg: 2, totalWeightKg: 2 }, 'totalWeightKg', 'WASTE_TOTAL_WEIGHT_NOT_GREATER'],
    [{ coneWeightKg: 3, totalWeightKg: 2 }, 'totalWeightKg', 'WASTE_TOTAL_WEIGHT_NOT_GREATER'],
    [{ weightKg: 1 }, 'weightKg', 'WASTE_WEIGHT_CALCULATED']
  ])('rechaza captura incompleta o incoherente %s antes del servicio', async (weights, field, code) => {
    const response = await request(app).post('/wastes').send({ ...validBody, ...weights }).expect(400);
    expect(response.body.errors[field].code).toBe(code);
    expect(createWasteWithInitialStockAdjustment).not.toHaveBeenCalled();
  });

  it.each([
    [{ sampleLengthM: undefined, sampleNetWeightKg: 0.057 }, 'sampleLengthM', 'SAMPLE_LENGTH_REQUIRED'],
    [{ sampleLengthM: 1, sampleNetWeightKg: undefined }, 'sampleNetWeightKg', 'SAMPLE_WEIGHT_REQUIRED'],
    [{ sampleLengthM: 0, sampleNetWeightKg: 0.057 }, 'sampleLengthM', 'SAMPLE_LENGTH_INVALID_NUMBER'],
    [{ sampleLengthM: 1, sampleNetWeightKg: '0.1234567' }, 'sampleNetWeightKg', 'SAMPLE_WEIGHT_TOO_LONG']
  ])('valida la muestra con códigos por campo y no ejecuta el servicio: %j', async (sample, field, code) => {
    const response = await request(app).post('/wastes').send({ ...validBody, coneWeightKg: 0, totalWeightKg: 1, ...sample }).expect(400);
    expect(response.body.errors[field].code).toBe(code);
    expect(createWasteWithInitialStockAdjustment).not.toHaveBeenCalled();
  });

});
