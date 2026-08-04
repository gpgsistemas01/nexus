import { describe, expect, it } from 'vitest';

import { wasteDataValidators } from '../../src/public/js/utils/validations/validators.js';

describe('wasteDataValidators', () => {
  it('rechaza medidas de merma iguales a cero', () => {
    expect(wasteDataValidators.base(null, { base: '0', height: '1' })).toBe('La base de la merma debe ser un número mayor a cero');
    expect(wasteDataValidators.height(null, { base: '1', height: 0 })).toBe('La altura de la merma debe ser un número mayor a cero');
  });

  it('acepta medidas de merma vacías o mayores a cero', () => {
    expect(wasteDataValidators.base(null, { base: '', height: '' })).toBeNull();
    expect(wasteDataValidators.height(null, { base: '', height: '' })).toBeNull();

    expect(wasteDataValidators.base(null, { base: '0.01', height: '1' })).toBeNull();
    expect(wasteDataValidators.height(null, { base: '0.01', height: '1' })).toBeNull();
  });
});
