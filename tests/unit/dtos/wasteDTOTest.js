import { describe, expect, it } from 'vitest';

import {
  createWasteDtoForEdit,
  createWasteDtoForRegister
} from '../../../src/dtos/wasteDTO.js';

describe('wasteDTO', () => {
  it('trata el nombre como identidad editable y no como dato secundario', () => {
    expect(createWasteDtoForEdit({
      name: '  Recorte corregido  ',
      minStock: '2',
      maxUnitCost: '15.5',
      isActive: true
    })).toEqual({
      name: 'Recorte corregido',
      minStock: 2,
      maxUnitCost: 15.5,
      isActive: true
    });
  });

  it('incluye y normaliza el nombre confirmado al registrar', () => {
    expect(createWasteDtoForRegister({
      name: '  Recorte confirmado  ',
      materialId: 'material-1',
      supplierId: 'supplier-1',
      base: '2',
      height: '3',
      minStock: '1',
      maxUnitCost: '10',
      isActive: true,
      newStock: '4'
    })).toMatchObject({ name: 'Recorte confirmado' });
  });
});
