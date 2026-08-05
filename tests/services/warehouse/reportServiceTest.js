import { beforeEach, describe, expect, it, vi } from 'vitest';

const findAllSupplierMaterials = vi.fn();
const findAllGoodsIssues = vi.fn();
const findAllGoodsReceipts = vi.fn();
const findAllSuppliers = vi.fn();
const findAllWastes = vi.fn();

vi.mock('../../../src/services/warehouse/materials/supplierMaterialService.js', () => ({
  findAllSupplierMaterials
}));

vi.mock('../../../src/services/warehouse/goodsIssues/goodsIssueService.js', () => ({
  findAllGoodsIssues
}));

vi.mock('../../../src/services/warehouse/goodsReceipts/goodsReceiptService.js', () => ({
  findAllGoodsReceipts
}));

vi.mock('../../../src/services/warehouse/supplierService.js', () => ({
  findAllSuppliers
}));

vi.mock('../../../src/services/warehouse/wastes/wasteService.js', () => ({
  findAllWastes
}));

const {
  findGoodsIssueReportRows,
  findGoodsReceiptReportRows,
  findSupplierReportRows,
  findWasteReportRows,
  findWarehouseReportRows
} = await import('../../../src/services/warehouse/reportService.js');

describe('warehouse reportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mapea reporte de almacén desde proveedor-material con números normalizados', async () => {
    findAllSupplierMaterials.mockResolvedValue({
      data: [{
        supplier: { tradeName: 'Proveedor Uno' },
        name: 'Material Uno',
        base: '2.5',
        height: '3',
        currentStock: '4',
        minStock: '1',
        presentation: { name: 'Caja' },
        convertedQuantity: '30',
        unitMeasure: { name: 'Metro' },
        maxUnitCost: '12.50'
      }]
    });

    await expect(findWarehouseReportRows({ search: 'Material', orderBy: 'name', orderDir: 'desc' })).resolves.toEqual([{
      supplier: 'Proveedor Uno',
      name: 'Material Uno',
      base: 2.5,
      height: 3,
      currentStock: 4,
      minStock: 1,
      presentation: 'Caja',
      convertedQuantity: 30,
      unitMeasure: 'Metro',
      maxUnitCost: 12.5
    }]);

    expect(findAllSupplierMaterials).toHaveBeenCalledWith({
      skip: 0,
      take: 100000,
      search: 'Material',
      supplierId: null,
      orderBy: 'name',
      orderDir: 'desc'
    });
  });

  it('mapea reporte de salidas filtrando detalles por proveedor/material', async () => {
    const requestDate = new Date('2026-06-18T10:30:00.000Z');
    findAllGoodsIssues.mockResolvedValue({
      data: [{
        referenceNumber: 'SAL-2026-0001',
        requestDate,
        departmentName: 'Almacén',
        requesterName: 'Solicitante',
        clientName: 'Cliente',
        projectNumber: 'P-1',
        fulfillmentStatus: { name: 'Surtido' },
        details: [
          {
            materialId: 'material-1',
            supplierId: 'supplier-1',
            materialName: 'Material Uno',
            supplierName: 'Proveedor Uno',
            materialBase: '2',
            materialHeight: '3',
            quantity: '2',
            suppliedQuantity: '2',
            presentationName: 'Caja',
            convertedQuantity: '12',
            unitMeasureSymbol: 'm2',
            projectConvertedQuantity: '10',
            convertedQuantityDifference: '2',
            fulfillmentStatus: { name: 'Surtido' }
          },
          { materialId: 'material-2', supplierId: 'supplier-1', materialName: 'Filtrado' }
        ]
      }]
    });

    const rows = await findGoodsIssueReportRows({ search: 'SAL', accesses: [{ role: 'Administrador del sistema' }] });

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      referenceNumber: 'SAL-2026-0001',
      departmentName: 'Almacén',
      requesterName: 'Solicitante',
      clientName: 'Cliente',
      fulfillmentStatusName: 'Surtido',
      materialName: 'Material Uno',
      supplierName: 'Proveedor Uno',
      materialBase: 2,
      materialHeight: 3,
      requestedQuantity: 2,
      suppliedQuantity: 2,
      convertedQuantity: 12,
      convertedUnitMeasureName: 'm2',
      projectConvertedQuantity: 10,
      convertedQuantityDifference: 2,
      detailFulfillmentStatusName: 'Surtido'
    });
    expect(findAllGoodsIssues).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 100000, search: 'SAL' }));
  });

  it('mapea reporte de compras con factura y montos normalizados', async () => {
    findAllGoodsReceipts.mockResolvedValue({
      data: [{
        referenceNumber: 'REC-2026-0001',
        receptionDate: new Date('2026-06-18T11:00:00.000Z'),
        receivedByName: 'Receptor',
        supplierName: 'Proveedor Uno',
        isInvoiced: true,
        invoice: 'F-1',
        details: [{
          materialId: 'material-1',
          materialName: 'Material Uno',
          materialBase: '2',
          materialHeight: '3',
          quantity: '5',
          presentationName: 'Caja',
          convertedQuantity: '30',
          unitMeasureName: 'Metro',
          conversionUnitCost: '1.50',
          costPerUnitType: '9',
          netPurchaseAmount: '45',
          grossPurchaseAmount: '52.20',
          status: 'ACTIVE'
        }, {
          materialId: 'material-2',
          materialName: 'Material cancelado',
          status: 'CANCELED'
        }]
      }]
    });

    await expect(findGoodsReceiptReportRows({ search: 'REC', supplierId: 'supplier-1' })).resolves.toEqual([
      expect.objectContaining({
        referenceNumber: 'REC-2026-0001',
        receivedByName: 'Receptor',
        supplierName: 'Proveedor Uno',
        invoice: 'F-1',
        materialName: 'Material Uno',
        materialBase: 2,
        materialHeight: 3,
        quantity: 5,
        convertedQuantity: 30,
        unitMeasureName: 'Metro',
        conversionUnitCost: 1.5,
        costPerUnitType: 9,
        netPurchaseAmount: 45,
        grossPurchaseAmount: 52.2
      })
    ]);

    expect(findAllGoodsReceipts).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 100000, search: 'REC', supplierId: 'supplier-1' }));
  });

  it('mapea reporte de mermas usando medidas y conversión propias de la merma', async () => {
    findAllWastes.mockResolvedValue({
      data: [{
        supplier: { tradeName: 'Proveedor Uno' },
        name: 'Merma Uno',
        base: '1.5',
        height: '2',
        material: { base: '10', height: '20' },
        currentStock: '4',
        presentation: { name: 'Pieza' },
        convertedQuantity: '12',
        unitMeasure: { name: 'Metro cuadrado' },
        maxUnitCost: '7.50'
      }]
    });

    await expect(findWasteReportRows({ search: 'Merma', supplierId: 'supplier-1' })).resolves.toEqual([{
      supplier: 'Proveedor Uno',
      name: 'Merma Uno',
      base: 1.5,
      height: 2,
      currentStock: 4,
      presentation: 'Pieza',
      convertedQuantity: 12,
      unitMeasure: 'Metro cuadrado',
      maxUnitCost: 7.5
    }]);

    expect(findAllWastes).toHaveBeenCalledWith({
      skip: 0,
      take: 100000,
      search: 'Merma',
      supplierId: 'supplier-1',
      orderBy: 'name',
      orderDir: 'asc'
    });
  });

  it('obtiene reporte de proveedores desde el servicio base de proveedores', async () => {
    const suppliers = [
      { id: 'supplier-1', tradeName: 'Proveedor Uno', legalName: 'Proveedor Uno SA', isActive: true },
      { id: 'supplier-2', tradeName: 'Proveedor Dos', legalName: 'Proveedor Dos SA', isActive: false }
    ];

    findAllSuppliers.mockResolvedValue({ data: suppliers });

    await expect(findSupplierReportRows({ search: 'Proveedor', orderBy: 'legalName', orderDir: 'desc' })).resolves.toEqual(suppliers);

    expect(findAllSuppliers).toHaveBeenCalledWith({
      skip: 0,
      take: 0,
      search: 'Proveedor',
      orderBy: 'legalName',
      orderDir: 'desc'
    });
  });

});
