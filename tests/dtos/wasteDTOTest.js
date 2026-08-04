import { describe, expect, it } from 'vitest';

import { createWasteDataDto, createWasteDto } from '../../src/dtos/wasteDTO.js';

describe('wasteDTO', () => {
  it('mantiene medidas de merma vacías como null', () => {
    expect(createWasteDataDto({ supplierMaterialId: 'supplier-material-1', base: '', height: '' })).toEqual({
      supplierMaterialId: 'supplier-material-1',
      base: null,
      height: null
    });
  });

  it('convierte medidas de merma capturadas a número', () => {
    expect(createWasteDto({ supplierMaterialId: 'supplier-material-1', base: '0.01', height: '2', currentStock: '3' })).toMatchObject({
      supplierMaterialId: 'supplier-material-1',
      base: 0.01,
      height: 2,
      currentStock: 3
    });
  });
});
