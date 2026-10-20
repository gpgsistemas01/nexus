import { describe, expect, it } from 'vitest';

import { getMaterialIdentityWidth } from '../../../../src/services/inventory/materialIdentity.js';

describe('identidad dimensional de material', () => {
  it('normaliza dimensiones numéricas recibidas como cadenas antes de elegir la menor positiva', () => {
    expect(getMaterialIdentityWidth({ base: '50', height: '1.52' })).toBe(1.52);
  });

  it('ignora dimensiones vacías, cero o negativas', () => {
    expect(getMaterialIdentityWidth({ base: 0, height: -1 })).toBeNull();
  });
});
