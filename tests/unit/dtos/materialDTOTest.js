import { describe, expect, it } from 'vitest';

import { createMaterialDtoForRegister } from '../../../src/dtos/materialDTO.js';

const materialBody = {
  name: '  Lámina  ',
  supplierId: 'supplier-1',
  presentationId: 'presentation-1',
  unitMeasureId: 'unit-1',
  minStock: '2',
  isActive: true
};

describe('materialDTO', () => {
  it('descarta costo máximo y stock inicial al crear el material desde una compra', () => {
    const dto = createMaterialDtoForRegister({
      ...materialBody,
      creationContext: 'goodsReceipt',
      maxUnitCost: '999',
      newStock: '50',
      observations: 'No debe generar un ajuste'
    });

    expect(dto).toEqual({
      name: 'Lámina',
      supplierId: 'supplier-1',
      presentationId: 'presentation-1',
      unitMeasureId: 'unit-1',
      base: null,
      height: null,
      minStock: 2,
      isActive: true
    });
  });

  it('conserva costo, stock y observaciones en el alta directa de materiales', () => {
    expect(createMaterialDtoForRegister({
      ...materialBody,
      maxUnitCost: '25.5',
      newStock: '4',
      observations: '  Inventario inicial  '
    })).toEqual(expect.objectContaining({
      maxUnitCost: 25.5,
      newStock: 4,
      observations: 'Inventario inicial'
    }));
  });
});
