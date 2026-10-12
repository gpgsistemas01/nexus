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
  it.each([undefined, null, '', '0.000001', 0.000001, '0.75', '99999999.999999', 99999999.999999])('acepta peso opcional o decimal válido: %s', value => {
    expect(wasteValidation.weightKg(value, { presentationName: 'ROLLO' })).toBeNull();
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
    ['1.1234567', 'WEIGHT_KG_TOO_LONG'],
    ['100000000', 'WEIGHT_KG_TOO_LONG'],
    ['0.0000001', 'WEIGHT_KG_TOO_LONG'],
    [0.0000001, 'WEIGHT_KG_TOO_LONG'],
    [1e21, 'WEIGHT_KG_TOO_LONG']
  ])('rechaza peso %s con el mensaje correspondiente', (value, code) => {
    expect(wasteValidation.weightKg(value, { presentationName: 'ROLLO' })).toBe(getErrorMessage({ code }));
  });

  it('valida la presentación de la plantilla sin hacer obligatorio el peso', () => {
    expect(wasteValidation.weightKg('0.75', { presentationName: 'LÁMINA' })).toBe(getErrorMessage({ code: 'WASTE_WEIGHT_INVALID' }));
    expect(wasteValidation.weightKg('0.75', { presentationName: '' })).toBe(getErrorMessage({ code: 'WASTE_WEIGHT_INVALID' }));
    expect(wasteValidation.weightKg('', { presentationName: 'LÁMINA' })).toBeNull();
  });

});
