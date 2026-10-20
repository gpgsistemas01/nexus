import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';
import { validate } from '../../../src/middleware/validatorMiddleware.js';
import { validateBoolean } from '../../../src/validators/fields/fieldsValidator.js';
import { goodsIssueDetailsValidation } from '../../../src/validators/forms/goodsIssueValidations.js';
import { wasteIssueDetailsValidation } from '../../../src/validators/forms/wasteIssueValidations.js';
import { createGoodsIssueDetailsDtoForEdit } from '../../../src/dtos/goodsIssueDTO.js';
import { createWasteIssueDetailsDtoForEdit } from '../../../src/dtos/wasteIssueDTO.js';

const detailId = '00000000-0000-4000-8000-000000000001';
const controller = vi.fn();
const app = createControllerTestApp({ registerRoutes: router => {
  router.post('/standard', validateBoolean('isActive'), validate, (req, res) => {
    controller(req.body);
    res.json(req.body);
  });
  for (const [path, rules, createDto] of [
    ['materials', goodsIssueDetailsValidation, createGoodsIssueDetailsDtoForEdit],
    ['consumables', goodsIssueDetailsValidation, createGoodsIssueDetailsDtoForEdit],
    ['wastes', wasteIssueDetailsValidation, createWasteIssueDetailsDtoForEdit]
  ]) {
    router.post(`/${path}`, rules, validate, (req, res) => {
      const dto = createDto(req.body);
      controller(dto);
      res.json(dto);
    });
  }
} });

describe('reglas estándar y personalizadas usan el mismo validate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('la regla estándar también responde 400 con errorMap antes del controller', async () => {
    const response = await request(app).post('/standard').send({ isActive: 'invalid' }).expect(400);

    expect(response.body).toMatchObject({ code: 'VALIDATION_ERROR', errors: { isActive: { code: 'ACTIVE_INVALID_BOOLEAN' } } });
    expect(controller).not.toHaveBeenCalled();
  });

  describe.each(['materials', 'consumables', 'wastes'])('%s', resource => {
    it.each([[true, true], [false, false], ['true', true], ['false', false]])(
      'conserva %s como %s al entregar el detalle validado al controller', async (value, expected) => {
        const response = await request(app).post(`/${resource}`).send({
          details: [{ id: detailId, projectConvertedQuantity: '2.5', isSupplied: value }]
        }).expect(200);

        expect(response.body.details).toEqual([{ id: detailId, projectConvertedQuantity: 2.5, isSupplied: expected }]);
        expect(controller).toHaveBeenCalledExactlyOnceWith(response.body);
      }
    );

    it.each([
      ['invalid', 'SUPPLIED_INVALID_BOOLEAN'],
      ['', 'SUPPLIED_INVALID_BOOLEAN'],
      [1, 'SUPPLIED_INVALID_BOOLEAN'],
      [{}, 'SUPPLIED_INVALID_BOOLEAN'],
      [null, 'SUPPLIED_REQUIRED'],
      [undefined, 'SUPPLIED_REQUIRED']
    ])('rechaza isSupplied=%s con %s antes del controller', async (value, code) => {
      const response = await request(app).post(`/${resource}`).send({
        details: [{ id: detailId, projectConvertedQuantity: 2.5, isSupplied: value }]
      }).expect(400);

      expect(response.body).toMatchObject({ code: 'VALIDATION_ERROR', errors: { [detailId]: { isSupplied: { code } } } });
      expect(controller).not.toHaveBeenCalled();
    });

    it.each([true, [2], { toString: null, valueOf: null }])('rechaza una cantidad de tipo incorrecto sin exponer una excepción de conversión', async value => {
      const response = await request(app).post(`/${resource}`).send({
        details: [{ id: detailId, projectConvertedQuantity: value, isSupplied: true }]
      }).expect(400);

      expect(response.body).toMatchObject({ code: 'VALIDATION_ERROR', errors: {
        [detailId]: { projectConvertedQuantity: { code: 'DETAILS_INVALID_FORMAT_QUANTITY' } }
      } });
      expect(controller).not.toHaveBeenCalled();
    });

    it.each([null, { toString: null, valueOf: null }, '__proto__'])('identifica como error de details un id inválido: %s', async id => {
      const response = await request(app).post(`/${resource}`).send({
        details: [{ id, projectConvertedQuantity: 2.5, isSupplied: true }]
      }).expect(400);

      expect(response.body).toMatchObject({ code: 'VALIDATION_ERROR', errors: { details: { code: 'DETAILS_INVALID_FORMAT_ID' } } });
      expect(controller).not.toHaveBeenCalled();
    });
  });
});
