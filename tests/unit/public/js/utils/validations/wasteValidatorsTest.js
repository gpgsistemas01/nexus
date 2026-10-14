import { describe, expect, it } from 'vitest';
import { getErrorMessage } from '../../../../../../src/public/js/constants/apiMessages.js';

import {
  wasteEditValidation,
  wasteStockValidation,
  wasteValidation
} from '../../../../../../src/public/js/utils/validations/validators.js';

describe('validadores del CRUD de mermas', () => {
  it.each([
    ['nombre corregido', 'Recorte de lona', null],
    ['nombre vacío', '', expect.any(String)]
  ])('%s', (_, value, expected) => {
    expect(wasteEditValidation.name(value)).toEqual(expected);
  });

  it.each([
    ['ancho decimal positivo', 'base', 0.25, null],
    ['largo decimal positivo', 'height', 0.5, null],
    ['ancho ausente', 'base', '', expect.any(String)],
    ['largo en cero', 'height', 0, expect.any(String)]
  ])('%s', (_, field, value, expected) => {
    expect(wasteValidation[field](value)).toEqual(expected);
  });

  it('valida el nombre confirmado durante el alta', () => {
    expect(wasteValidation.name('Recorte de lona')).toBeNull();
    expect(wasteValidation.name('')).toEqual(expect.any(String));
  });

  it.each([
    ['costo vacío', '', expect.any(String)],
    ['costo sugerido', 25.5, null],
    ['costo negativo', -0.01, expect.any(String)]
  ])('%s', (_, value, expected) => {
    expect(wasteEditValidation.maxUnitCost(value)).toEqual(expected);
  });

  it.each([
    ['stock en cero', 0, null],
    ['stock negativo', -0.01, expect.any(String)]
  ])('%s', (_, value, expected) => {
    expect(wasteStockValidation.newStock(value)).toEqual(expected);
  });
  it.each([undefined, null, '', '0.01', 0.01, '0.75', '99.99', 100, '100.00', '999.99'])('acepta peso opcional o decimal válido: %s', value => {
    expect(wasteValidation.totalWeightKg(value, { coneWeightKg: value == null || value === '' ? null : 0, presentationName: 'ROLLO' })).toBeNull();
  });

  it.each([
    [0, 'WEIGHT_KG_INVALID_NUMBER'],
    [-1, 'WEIGHT_KG_INVALID_NUMBER'],
    ['abc', 'WEIGHT_KG_INVALID_NUMBER'],
    ['0.75abc', 'WEIGHT_KG_INVALID_NUMBER'],
    ['1e3', 'WEIGHT_KG_INVALID_NUMBER'],
    ['1,25', 'WEIGHT_KG_INVALID_NUMBER'],
    ['Infinity', 'WEIGHT_KG_INVALID_NUMBER'],
    [Infinity, 'WEIGHT_KG_INVALID_NUMBER'],
    [NaN, 'WEIGHT_KG_INVALID_NUMBER'],
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
  ])('rechaza peso %s con el mensaje correspondiente', (value, code) => {
    expect(wasteValidation.totalWeightKg(value, { coneWeightKg: 0, presentationName: 'ROLLO' })).toBe(getErrorMessage({ code }));
  });

  it('valida la presentación de la plantilla sin hacer obligatorio el peso', () => {
    expect(wasteValidation.totalWeightKg('0.75', { coneWeightKg: 0, presentationName: 'LÁMINA' })).toBe(getErrorMessage({ code: 'WASTE_WEIGHT_INVALID' }));
    expect(wasteValidation.totalWeightKg('0.75', { coneWeightKg: 0, presentationName: '' })).toBe(getErrorMessage({ code: 'WASTE_WEIGHT_INVALID' }));
    expect(wasteValidation.totalWeightKg('', { presentationName: 'LÁMINA' })).toBeNull();
  });

  it.each([
    ['coneWeightKg', 0, { totalWeightKg: 1 }, null],
    ['coneWeightKg', 0, {}, 'TOTAL_WEIGHT_KG_REQUIRED'],
    ['coneWeightKg', -1, { totalWeightKg: 1 }, 'CONE_WEIGHT_KG_INVALID_NUMBER'],
    ['totalWeightKg', 1, { coneWeightKg: 1 }, 'WASTE_TOTAL_WEIGHT_NOT_GREATER'],
    ['totalWeightKg', 1, { coneWeightKg: 2 }, 'WASTE_TOTAL_WEIGHT_NOT_GREATER'],
    ['coneWeightKg', '', { totalWeightKg: 1 }, 'CONE_WEIGHT_KG_REQUIRED']
  ])('valida %s y su relación con el otro peso', (field, value, data, code) => {
    const values = { ...data, [field]: value, presentationName: 'ROLLO' };
    const errorField = code === 'TOTAL_WEIGHT_KG_REQUIRED' ? 'totalWeightKg' : field;
    expect(wasteValidation[errorField](values[errorField], values)).toBe(code ? getErrorMessage({ code }) : null);
  });

});


it('valida las dimensiones finales sin reconstruir el material ni calcular pesos', () => {
  const data = { presentationName: 'ROLLO', material: { base: 50, height: 1.5 } };
  expect(wasteValidation.base('', data)).not.toBeNull();
  expect(wasteValidation.base('5', data)).toBeNull();
  expect(wasteValidation.height('1.5', data)).toBeNull();
});
