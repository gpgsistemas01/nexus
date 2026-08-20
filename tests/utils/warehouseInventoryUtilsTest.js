import { describe, expect, it } from 'vitest';

import {
  getMaterialName,
  getPresentation,
  getSupplierName,
  mapGoodsIssueDetailsToRequest,
  mapIssueDetailToTable,
  mapSelectMaterialData
} from '../../src/public/js/utils/warehouseInventoryUtils.js';

describe('select de material reutilizado por el CRUD de merma', () => {
  it('obtiene nombre de material y proveedor desde las formas del contrato', () => {
    const waste = {
      supplierMaterial: {
        material: { name: 'Recorte' },
        supplier: { tradeName: 'Proveedor Norte', name: 'Razón social' }
      }
    };

    expect(getMaterialName(waste)).toBe('Recorte');
    expect(getSupplierName(waste)).toBe('Proveedor Norte');
    expect(getMaterialName({ name: 'Lámina' })).toBe('Lámina');
    expect(getSupplierName({ supplier: 'Proveedor capturado' })).toBe('Proveedor capturado');
  });

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

describe('contrato de detalles de salidas de almacén y merma', () => {
  it('mantiene intacta la respuesta de una salida de material y separa ids al formatear la tabla', () => {
    const responseDetail = {
      id: 'goods-detail-1',
      materialId: 'material-1',
      supplierId: 'supplier-1',
      quantity: '2.5',
      convertedQuantity: '15',
      isSupplied: false,
      material: {
        id: 'material-1',
        name: 'Lámina',
        base: '2',
        height: '3',
        presentation: { id: 'presentation-1', name: 'ROLLO' },
        unitMeasure: { symbol: 'm²' }
      },
      supplier: { id: 'supplier-1', tradeName: 'Proveedor Norte' }
    };
    const snapshot = structuredClone(responseDetail);

    const row = mapIssueDetailToTable(responseDetail);

    expect(responseDetail).toEqual(snapshot);
    expect(row).toEqual(expect.objectContaining({
      id: 'goods-detail-1',
      materialId: 'material-1',
      supplierId: 'supplier-1',
      presentationId: 'presentation-1',
      name: 'Lámina (2 × 3) · Proveedor Norte',
      originalIsSupplied: false
    }));
    expect(row).not.toHaveProperty('wasteId');
  });

  it('mantiene intacta la respuesta de merma y conserva el id del detalle para surtir', () => {
    const responseDetail = {
      id: 'waste-detail-1',
      wasteId: 'waste-1',
      quantity: '3',
      suppliedQuantity: '1',
      isSupplied: true,
      waste: {
        id: 'waste-1',
        base: '1',
        height: '4',
        supplierMaterial: {
          maxUnitCost: '20',
          material: {
            name: 'Recorte',
            presentation: { name: 'PIEZA' },
            unitMeasure: { symbol: 'm²' }
          },
          supplier: { tradeName: 'Proveedor Sur' }
        }
      }
    };
    const snapshot = structuredClone(responseDetail);

    const row = mapIssueDetailToTable(responseDetail);

    expect(responseDetail).toEqual(snapshot);
    expect(row).toEqual(expect.objectContaining({
      id: 'waste-detail-1',
      wasteId: 'waste-1',
      name: 'Recorte (1 × 4) · Proveedor Sur',
      originalIsSupplied: true
    }));
    expect(row).not.toHaveProperty('materialId');
  });

  it('reduce el request de alta y edición a los campos aceptados por el contrato', () => {
    const payload = mapGoodsIssueDetailsToRequest([{
      id: 'detail-only-for-table',
      materialId: 'material-1',
      supplierId: 'supplier-1',
      presentationId: 'presentation-1',
      quantity: 2,
      name: 'texto de tabla',
      convertedQuantity: 12,
      fulfillmentStatus: { name: 'Pendiente' }
    }]);

    expect(payload).toEqual([{
      materialId: 'material-1',
      supplierId: 'supplier-1',
      presentationId: 'presentation-1',
      quantity: 2
    }]);
  });
});
