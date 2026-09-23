import { describe, expect, it } from 'vitest';

import { materialStockFields, materialStockRequestFields } from '../../../../../../../src/public/js/pages/warehouse/materials/materialFields.js';

describe('campos del formulario de materiales', () => {
  it('agrega el proveedor sólo al contrato enviado para ajustar stock', () => {
    expect(materialStockFields).toEqual(['newStock', 'reasonId', 'observations']);
    expect(materialStockRequestFields).toEqual(['supplierId', ...materialStockFields]);
  });
});
