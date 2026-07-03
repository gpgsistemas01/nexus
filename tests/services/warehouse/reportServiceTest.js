import { beforeEach, describe, expect, it, vi } from 'vitest';

const findAllSupplierProducts = vi.fn();
const findAllGoodsIssues = vi.fn();
const findAllGoodsReceipts = vi.fn();

vi.mock('../../../src/services/warehouse/products/supplierProductService.js', () => ({
  findAllSupplierProducts
}));

vi.mock('../../../src/services/warehouse/goodsIssues/goodsIssueService.js', () => ({
  findAllGoodsIssues
}));

vi.mock('../../../src/services/warehouse/goodsReceipts/goodsReceiptService.js', () => ({
  findAllGoodsReceipts
}));

const {
  findGoodsIssueReportRows,
  findGoodsReceiptReportRows,
  findWarehouseReportRows
} = await import('../../../src/services/warehouse/reportService.js');

describe('warehouse reportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mapea reporte de almacén desde proveedor-producto con números normalizados', async () => {
    findAllSupplierProducts.mockResolvedValue({
      data: [{
        supplier: { tradeName: 'Proveedor Uno' },
        name: 'Producto Uno',
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

    await expect(findWarehouseReportRows({ search: 'Producto', orderBy: 'name', orderDir: 'desc' })).resolves.toEqual([{
      supplier: 'Proveedor Uno',
      name: 'Producto Uno',
      base: 2.5,
      height: 3,
      currentStock: 4,
      minStock: 1,
      presentation: 'Caja',
      convertedQuantity: 30,
      unitMeasure: 'Metro',
      maxUnitCost: 12.5
    }]);

    expect(findAllSupplierProducts).toHaveBeenCalledWith({
      skip: 0,
      take: 100000,
      search: 'Producto',
      supplierId: null,
      orderBy: 'name',
      orderDir: 'desc'
    });
  });

  it('mapea reporte de salidas filtrando detalles por proveedor/producto', async () => {
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
            productId: 'product-1',
            supplierId: 'supplier-1',
            productName: 'Producto Uno',
            supplierName: 'Proveedor Uno',
            productBase: '2',
            productHeight: '3',
            quantity: '2',
            suppliedQuantity: '2',
            presentationName: 'Caja',
            convertedQuantity: '12',
            unitMeasureSymbol: 'm2',
            projectConvertedQuantity: '10',
            convertedQuantityDifference: '2',
            fulfillmentStatus: { name: 'Surtido' }
          },
          { productId: 'product-2', supplierId: 'supplier-1', productName: 'Filtrado' }
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
      productName: 'Producto Uno',
      supplierName: 'Proveedor Uno',
      productBase: 2,
      productHeight: 3,
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
          productId: 'product-1',
          productName: 'Producto Uno',
          productBase: '2',
          productHeight: '3',
          quantity: '5',
          presentationName: 'Caja',
          convertedQuantity: '30',
          unitMeasureName: 'Metro',
          conversionUnitCost: '1.50',
          costPerUnitType: '9',
          netPurchaseAmount: '45',
          grossPurchaseAmount: '52.20'
        }]
      }]
    });

    await expect(findGoodsReceiptReportRows({ search: 'REC', supplierId: 'supplier-1' })).resolves.toEqual([
      expect.objectContaining({
        referenceNumber: 'REC-2026-0001',
        receivedByName: 'Receptor',
        supplierName: 'Proveedor Uno',
        invoice: 'F-1',
        productName: 'Producto Uno',
        productBase: 2,
        productHeight: 3,
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
});
