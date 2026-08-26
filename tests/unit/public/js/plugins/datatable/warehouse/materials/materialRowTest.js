import { describe, expect, it } from 'vitest';

import { mapMaterialRowToFormData } from '../../../../../../../../src/public/js/plugins/datatable/warehouse/materials/materialRow.js';

describe('fila del listado CRUD de materiales', () => {
  it('entrega al formulario el material anidado y no el id de proveedor-material', () => {
    const supplier = { id: 'supplier-1', tradeName: 'Proveedor' };
    const presentation = { id: 'presentation-1', name: 'Rollo' };
    const unitMeasure = { id: 'unit-1', name: 'Metro' };

    expect(mapMaterialRowToFormData({
      id: 'supplier-material-1',
      maxUnitCost: 25.5,
      supplier,
      material: {
        id: 'material-1',
        name: 'Lona',
        minStock: 2,
        isActive: false,
        presentation,
        unitMeasure
      }
    })).toEqual(expect.objectContaining({
      id: 'material-1',
      name: 'Lona',
      minStock: 2,
      maxUnitCost: 25.5,
      isActive: false,
      supplier,
      presentation,
      unitMeasure
    }));
  });
});
