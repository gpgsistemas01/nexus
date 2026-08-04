import { describe, expect, it } from 'vitest';

import { materialValidators } from '../../src/public/js/utils/validations/validators.js';

describe('materialValidators', () => {
  it('rechaza medidas de material iguales a cero cuando se capturan', () => {
    expect(materialValidators.base(null, { base: '0', height: '1' })).toBe('La base debe ser un número mayor a cero');
    expect(materialValidators.height(null, { base: '1', height: 0 })).toBe('La altura debe ser un número mayor a cero');
  });

  it('acepta medidas de material vacías o mayores a cero', () => {
    expect(materialValidators.base(null, { base: '', height: '' })).toBeNull();
    expect(materialValidators.height(null, { base: '', height: '' })).toBeNull();
    expect(materialValidators.base(null, { base: '0.01', height: '1' })).toBeNull();
    expect(materialValidators.height(null, { base: '0.01', height: '1' })).toBeNull();
  });
});
