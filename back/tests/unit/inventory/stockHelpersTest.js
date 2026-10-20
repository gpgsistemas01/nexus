import { describe, expect, it } from 'vitest';

import {
  assertSufficientStock,
  calculateConvertedQuantity,
  hasDimensions
} from '../../../src/services/inventory/stockHelpers.js';
import { GoodsIssueInsufficientStock } from '../../../src/errors/inventory/stockError.js';

describe('stockHelpers', () => {
  it('detecta dimensiones válidas solo cuando base y altura son mayores a cero', () => {
    expect(hasDimensions({ base: '2', height: '3' })).toBe(true);
    expect(hasDimensions({ base: '0', height: '3' })).toBe(false);
    expect(hasDimensions({ base: null, height: '3' })).toBe(false);
  });

  it('calcula cantidad convertida con dimensiones y redondeo normalizado', () => {
    expect(calculateConvertedQuantity({ quantity: '3', base: '1.5', height: '2' })).toBe(9);
    expect(calculateConvertedQuantity({ currentStock: '2.345', base: '1', height: '1' })).toBe(2.345);
  });

  it('usa la cantidad original o cero cuando no hay dimensiones según la configuración', () => {
    expect(calculateConvertedQuantity({ quantity: '4', base: null, height: null })).toBe(4);
    expect(calculateConvertedQuantity({ quantity: '4', base: null, height: null, fallbackToQuantity: false })).toBe(0);
  });

  it('no falla cuando el stock resultante no es negativo', () => {
    expect(() => assertSufficientStock({
      material: { id: 'p1', name: 'Lámina' },
      newStock: 0,
      newConvertedQuantity: 0
    })).not.toThrow();
  });

  it('lanza un error de negocio con metadatos cuando el stock es insuficiente', () => {
    expect(() => assertSufficientStock({
      material: {
        id: 'p1',
        name: 'Lámina',
        supplierId: 's1',
        supplier: { tradeName: 'Proveedor Uno' },
        base: 2,
        height: 3
      },
      newStock: -1,
      requestedQuantity: 5
    })).toThrow(GoodsIssueInsufficientStock);

    try {
      assertSufficientStock({
        material: {
          id: 'p1',
          name: 'Lámina',
          supplierId: 's1',
          supplier: { tradeName: 'Proveedor Uno' },
          base: 2,
          height: 3
        },
        newStock: -1,
        requestedQuantity: 5
      });
    } catch (error) {
      expect(error.meta).toMatchObject({
        materialName: 'Lámina',
        materialId: 'p1',
        supplierId: 's1',
        supplierName: 'Proveedor Uno',
        requestedQuantity: 5
      });
    }
  });

  it('obtiene los metadatos desde el contrato anidado de proveedor-material', () => {
    let capturedError;

    try {
      assertSufficientStock({
        material: {
          id: 'supplier-material-1',
          material: {
            id: 'material-1',
            name: 'Lámina',
            base: 2,
            height: 3
          },
          supplier: { id: 'supplier-1', tradeName: 'Proveedor Uno' }
        },
        newStock: -1,
        requestedQuantity: 5
      });
    } catch (error) {
      capturedError = error;
    }

    expect(capturedError).toBeInstanceOf(GoodsIssueInsufficientStock);
    expect(capturedError.meta).toMatchObject({
      materialName: 'Lámina',
      materialId: 'material-1',
      supplierId: 'supplier-1',
      supplierName: 'Proveedor Uno',
      requestedQuantity: 5
    });
  });
});
