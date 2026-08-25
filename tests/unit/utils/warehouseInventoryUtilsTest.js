import { describe, expect, it } from 'vitest';

import {
  getBase,
  getHeight,
  getMaterialName,
  getPresentation,
  getPresentationId,
  getSupplierName,
  getUnitMeasure,
  getUnitMeasureId,
  mapGoodsIssueDetailsToRequest,
  mapIssueDetailsToSupplyRequest,
  mapIssueDetailToTable,
  mapSelectMaterialData,
  mapSelectWasteData,
  mapSelectWasteMaterialTemplateData
} from '../../../src/public/js/utils/warehouseInventoryUtils.js';

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

  it('centraliza los campos canónicos y las relaciones Prisma del detalle CRUD', () => {
    const prismaDetail = {
      material: {
        base: 2,
        height: 3,
        presentation: { id: 'presentation-1', name: 'ROLLO' },
        unitMeasure: { id: 'unit-1', symbol: 'm²' }
      },
      supplier: { tradeName: 'Proveedor Prisma' }
    };

    expect(getBase(prismaDetail)).toBe(2);
    expect(getHeight(prismaDetail)).toBe(3);
    expect(getPresentation(prismaDetail)).toBe('ROLLO');
    expect(getPresentationId(prismaDetail)).toBe('presentation-1');
    expect(getUnitMeasure(prismaDetail)).toBe('m²');
    expect(getUnitMeasureId(prismaDetail)).toBe('unit-1');
    expect(getSupplierName(prismaDetail)).toBe('Proveedor Prisma');
    expect(getPresentation({ presentation: 'PIEZA' })).toBe('PIEZA');
    expect(getUnitMeasure({ unitMeasure: 'pza' })).toBe('pza');
  });

  it('resuelve de forma segura la presentación del listado CRUD de merma', () => {
    expect(getPresentation({
      supplierMaterial: {
        material: { presentation: { name: 'ROLLO' } }
      }
    })).toBe('ROLLO');
    expect(getPresentation({ presentation: undefined })).toBe('');
    expect(getPresentation()).toBe('');
  });

  it('serializa presentación y unidad para los atributos de la opción de salida de merma', () => {
    const option = mapSelectWasteData({
      id: 'waste-1',
      name: 'Recorte',
      base: 1,
      height: 2,
      presentation: { name: 'ROLLO' },
      unitMeasure: { symbol: 'm²' },
      supplier: { tradeName: 'Proveedor Norte' }
    });

    expect(JSON.parse(option.presentation)).toEqual({ name: 'ROLLO' });
    expect(JSON.parse(option.unitMeasure)).toEqual({ symbol: 'm²' });
    expect(() => JSON.parse(option.supplier)).not.toThrow();
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

  it('mapea la plantilla de merma con el mismo texto de identidad de inventario', () => {
    const material = {
      id: 'material-1',
      name: 'Lona',
      base: 1.52,
      height: 50,
      presentation: { id: 'presentation-1', name: 'ROLLO' },
      unitMeasure: { id: 'unit-1', symbol: 'm²' }
    };
    const option = mapSelectWasteMaterialTemplateData(material);

    expect(option).toEqual(expect.objectContaining({
      id: 'material-1',
      text: 'Lona (1.52 × 50)'
    }));
    expect(option).toEqual(expect.objectContaining({
      presentation: material.presentation,
      unitMeasure: material.unitMeasure
    }));
  });
});

describe('contrato de detalles de salidas de almacén y merma', () => {
  it('reduce el surtido a filas nuevas y a los campos aceptados por el contrato', () => {
    const detailToSupply = {
      id: 'new',
      isSupplied: true,
      originalIsSupplied: false,
      projectConvertedQuantity: 2,
      convertedQuantity: 3
    };

    expect(mapIssueDetailsToSupplyRequest([
      detailToSupply,
      { id: 'supplied', isSupplied: true, originalIsSupplied: true },
      { id: 'unselected', isSupplied: false, originalIsSupplied: false }
    ])).toEqual([{
      id: 'new',
      isSupplied: true,
      projectConvertedQuantity: 2
    }]);
  });

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
