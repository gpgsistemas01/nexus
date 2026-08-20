import { describe, expect, it } from 'vitest';

import { getPresentation, mapSelectMaterialData } from '../../src/public/js/utils/warehouseInventoryUtils.js';

describe('select de material reutilizado por el CRUD de merma', () => {
  it('conserva el id proveedor-material del listado sin duplicar su presentación', () => {
    const option = mapSelectMaterialData({
      id: 'supplier-material-1',
      material: {
        name: 'Lámina',
        base: 2,
        height: 3,
        presentation: { name: 'ROLLO' }
      },
      supplier: { tradeName: 'Proveedor Norte' }
    });

    expect(option).toEqual(expect.objectContaining({
      id: 'supplier-material-1',
      text: 'Lámina (2 × 3) · Proveedor Norte'
    }));
    expect(option).not.toHaveProperty('presentationName');
    expect(getPresentation(JSON.parse(option.material))).toBe('ROLLO');
  });
});
