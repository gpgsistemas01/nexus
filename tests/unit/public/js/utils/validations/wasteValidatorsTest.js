import { describe, expect, it } from 'vitest';

import {
  wasteStockValidation,
  wasteValidation
} from '../../../../../../src/public/js/utils/validations/validators.js';

describe('validadores del CRUD de mermas', () => {
  it.each([
    ['ancho decimal positivo', 'base', 0.25, null],
    ['largo decimal positivo', 'height', 0.5, null],
    ['ancho ausente', 'base', '', expect.any(String)],
    ['largo en cero', 'height', 0, expect.any(String)]
  ])('%s', (_, field, value, expected) => {
    expect(wasteValidation[field](value)).toEqual(expected);
  });

  it.each([
    ['stock en cero', 0, null],
    ['stock negativo', -0.01, expect.any(String)]
  ])('%s', (_, value, expected) => {
    expect(wasteStockValidation.newStock(value)).toEqual(expected);
  });
});
