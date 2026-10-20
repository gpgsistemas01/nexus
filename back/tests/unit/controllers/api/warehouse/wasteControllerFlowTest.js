import { beforeEach, describe, expect, it, vi } from 'vitest';

const transaction = vi.fn();
const wasteCreate = vi.fn();
const wasteFindFirst = vi.fn();
const wasteFindUnique = vi.fn();
const wasteUpdate = vi.fn();
const wasteStockAdjustmentCreate = vi.fn();
const wasteStockAdjustmentUpdate = vi.fn();
const wasteStockEntryCreate = vi.fn();
const findSupplierMaterialByIds = vi.fn();
const generateYearlyReferenceNumber = vi.fn();
const throwIfReferenceNumberAlreadyExists = vi.fn();
const createWasteMovement = vi.fn();
const applyWasteMovement = vi.fn();

vi.mock('../../../../../src/utils/logger.js', () => ({
  createServiceLogger: () => ({}),
  getModelLogContext: (_model, data = {}) => data,
  logServiceError: vi.fn(),
  logServiceInfo: vi.fn()
}));

vi.mock('../../../../../src/repository/baseRepository.js', () => ({
  getDb: (tx = null) => tx || ({
    $transaction: transaction
  })
}));

vi.mock('../../../../../src/services/warehouse/materials/supplierMaterialService.js', () => ({
  findSupplierMaterialByIds
}));

vi.mock('../../../../../src/services/document/referenceNumberService.js', () => ({
  generateYearlyReferenceNumber,
  throwIfReferenceNumberAlreadyExists
}));

vi.mock('../../../../../src/services/warehouse/wastes/wasteMovementService.js', () => ({
  applyWasteMovement,
  createWasteMovement
}));

const {
  editWaste,
  editWasteStock,
  registerWaste,
  registerWasteStockAddition
} = await import('../../../../../src/controllers/api/warehouse/wasteController.js');

const createResponse = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn()
  };
  res.status.mockReturnValue(res);
  return res;
};

const createWaste = (overrides = {}) => ({
  id: 'waste-1',
  supplierMaterialId: 'supplier-material-1',
  supplierId: 'supplier-1',
  name: 'Lámina',
  base: 2,
  height: 3,
  minStock: 0,
  currentStock: 5,
  convertedQuantity: 30,
  isActive: true,
  supplierMaterial: {
    id: 'supplier-material-1',
    materialId: 'material-1',
    supplierId: 'supplier-1',
    maxUnitCost: 10,
    currentStock: 100,
    convertedQuantity: 600,
    material: {
      type: 'MATERIAL',
      id: 'material-1',
      name: 'Lámina',
      isActive: true,
      base: 2,
      height: 3,
      presentation: null,
      unitMeasure: null
    },
    supplier: {
      id: 'supplier-1',
      tradeName: 'Proveedor'
    }
  },
  ...overrides
});

describe('wasteController complete flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation((callback) => callback({
      $queryRaw: vi.fn().mockResolvedValue([]),
      waste: {
        create: wasteCreate,
        findFirst: wasteFindFirst,
        findUnique: wasteFindUnique,
        update: wasteUpdate
      },
      wasteStockAdjustment: {
        create: wasteStockAdjustmentCreate,
        update: wasteStockAdjustmentUpdate
      },
      wasteStockEntry: { create: wasteStockEntryCreate }
    }));
    wasteCreate.mockImplementation(async ({ data }) => createWaste(data));
    wasteFindFirst.mockResolvedValue(null);
    wasteFindUnique.mockResolvedValue(createWaste());
    wasteUpdate.mockResolvedValue(createWaste({ currentStock: 7, convertedQuantity: 42 }));
    wasteStockAdjustmentCreate.mockResolvedValue({ id: 'adjustment-1', details: [{ id: 'detail-1' }] });
    wasteStockAdjustmentUpdate.mockResolvedValue({ id: 'adjustment-1', details: [{ id: 'detail-1' }], movement: { id: 'movement-1' } });
    wasteStockEntryCreate.mockResolvedValue({ id: 'entry-1' });
    applyWasteMovement.mockResolvedValue({ id: 'movement-1', details: [{ wasteId: 'waste-1', previousStock: 0, newStock: 5 }] });
    findSupplierMaterialByIds.mockResolvedValue({
      isActive: true,
      material: {
      type: 'MATERIAL',
      id: 'material-1',
      name: 'Lámina',
      base: 2,
      height: 3,
      presentation: { id: 'presentation-1', name: 'ROLLO' },
      unitMeasure: { id: 'unit-measure-1', name: 'Metro cuadrado', symbol: 'm²' },
      maxUnitCost: 18.5
      }
    });
    generateYearlyReferenceNumber.mockImplementation(async ({ type }) => `${type}-2026-000001`);
    createWasteMovement.mockResolvedValue({ id: 'movement-1' });
  });

  it('registra una entrada inicial con saldo cero y aplica la cantidad una sola vez', async () => {
    const req = {
      body: {
        name: 'Recorte confirmado',
        coneWeightKg: 0.25,
        totalWeightKg: 1.25,
        referenceRollTotalWeightKg: 1.25,
        materialId: 'material-1',
        supplierId: 'supplier-1',
        base: 2,
        height: 3,
        maxUnitCost: 18.5,
        initialQuantity: 5,
        minStock: 2,
        isActive: false,
        observations: '  Stock inicial  ',
        reasonId: 'client-reason-id'
      },
      user: { id: 'user-1' }
    };
    const res = createResponse();

    await registerWaste(req, res);

    expect(generateYearlyReferenceNumber).toHaveBeenCalledWith({
      type: 'EME',
      tx: expect.any(Object)
    });
    expect(wasteCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        name: 'Recorte confirmado',
        currentStock: 0,
        maxUnitCost: 18.5,
        minStock: 2,
        isActive: false,
        presentation: { connect: { id: 'presentation-1' } },
        unitMeasure: { connect: { id: 'unit-measure-1' } },
        convertedQuantity: 0
      })
    }));
    expect(applyWasteMovement).toHaveBeenCalledWith(expect.objectContaining({
      movementType: 'ENTRY',
      details: [{ wasteId: 'waste-1', quantity: 5, convertedQuantity: 30 }]
    }));
    expect(wasteStockEntryCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        referenceNumber: 'EME-2026-000001',
        createdBy: { connect: { id: 'user-1' } },
        quantity: 5,
        previousStock: 0,
        newStock: 5,
        observations: 'Stock inicial'
      })
    }));
    expect(wasteStockAdjustmentCreate).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: 'CREATED_WASTE', waste: expect.objectContaining({ currentStock: 5, convertedQuantity: 30 })
    }));
  });

  it('crea una merma sin existencia sin documento, movimiento ni consumo de folio', async () => {
    const res = createResponse();
    await registerWaste({
      body: { name: 'Sin existencia', materialId: 'material-1', supplierId: 'supplier-1',
        base: 2, height: 3, initialQuantity: 0, coneWeightKg: 0.25, totalWeightKg: 1.25, referenceRollTotalWeightKg: 1.25 },
      user: { id: 'user-1' }
    }, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      waste: expect.objectContaining({ currentStock: 0, convertedQuantity: 0 })
    }));
    expect(generateYearlyReferenceNumber).not.toHaveBeenCalled();
    expect(wasteStockEntryCreate).not.toHaveBeenCalled();
    expect(wasteStockAdjustmentCreate).not.toHaveBeenCalled();
    expect(applyWasteMovement).not.toHaveBeenCalled();
    expect(createWasteMovement).not.toHaveBeenCalled();
  });

  it('rechaza un proveedor inactivo obtenido con la oferta sin crear registros', async () => {
    findSupplierMaterialByIds.mockResolvedValueOnce({ isActive: true, supplier: { isActive: false } });
    await expect(registerWaste({
      body: { name: 'Recorte', materialId: 'material-1', supplierId: 'supplier-1', base: 2, height: 3, initialQuantity: 1 },
      user: { id: 'user-1' }
    }, createResponse())).rejects.toMatchObject({ code: 'SUPPLIER_INACTIVE_CONFLICT', statusCode: 409 });
    expect(wasteCreate).not.toHaveBeenCalled();
    expect(wasteStockAdjustmentCreate).not.toHaveBeenCalled();
  });

  it('permite corregir el nombre sin cambiar los demás campos de identidad ni las existencias', async () => {
    const req = {
      params: { id: 'waste-1' },
      body: {
        name: 'Nombre alterado',
        materialId: 'material-2',
        supplierId: 'supplier-2',
        base: 8,
        height: 9,
        minStock: 4,
        maxUnitCost: 22.5,
        isActive: false,
        newStock: 99
      }
    };
    const res = createResponse();

    await editWaste(req, res);

    expect(wasteUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'waste-1' },
      data: { name: 'Nombre alterado', minStock: 4, maxUnitCost: 22.5, isActive: false }
    }));
    expect(wasteFindFirst).toHaveBeenCalledWith({
      where: {
        supplierId: 'supplier-1',
        name: 'Nombre alterado',
        base: 2,
        height: 3,
        coneWeightKg: null, totalWeightKg: null,
        NOT: { id: 'waste-1' }
      },
      select: expect.objectContaining({ id: true })
    });
    expect(wasteUpdate.mock.calls[0][0].data).not.toHaveProperty('currentStock');
    expect(wasteUpdate.mock.calls[0][0].data).not.toHaveProperty('newStock');
    expect(wasteUpdate.mock.calls[0][0].data).not.toHaveProperty('materialId');
    expect(wasteUpdate.mock.calls[0][0].data).not.toHaveProperty('supplierId');
    expect(wasteUpdate.mock.calls[0][0].data).not.toHaveProperty('base');
    expect(wasteUpdate.mock.calls[0][0].data).not.toHaveProperty('height');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'UPDATED_WASTE' }));
  });

  it('rechaza corregir el nombre cuando repetiría la identidad de otra merma', async () => {
    wasteFindFirst.mockResolvedValueOnce({ id: 'waste-2' });

    await expect(editWaste({
      params: { id: 'waste-1' },
      body: {
        name: 'Merma repetida',
        minStock: 4,
        maxUnitCost: 22.5,
        isActive: true
      }
    }, createResponse())).rejects.toMatchObject({
      code: 'WASTE_ALREADY_EXISTS',
      statusCode: 409
    });

    expect(wasteUpdate).not.toHaveBeenCalled();
  });

  it('permite editar el estado sin enviar stock mínimo', async () => {
    const req = {
      params: { id: 'waste-1' },
      body: {
        isActive: true
      }
    };
    const res = createResponse();

    await editWaste(req, res);

    expect(wasteUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: { isActive: true }
    }));
    expect(wasteUpdate.mock.calls[0][0].data).not.toHaveProperty('currentStock');
  });

  it('ajusta stock desde controller calculando el convertido como ajuste de material', async () => {
    const req = {
      params: { id: 'waste-1' },
      body: {
        newStock: 7,
        reasonId: 'reason-1',
        observations: '  Conteo físico  '
      },
      user: { id: 'user-1' }
    };
    const res = createResponse();

    await editWasteStock(req, res);

    expect(generateYearlyReferenceNumber).toHaveBeenCalledWith({
      type: 'AME',
      tx: expect.any(Object)
    });
    expect(wasteStockAdjustmentCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        reason: { connect: { id: 'reason-1' } },
        details: {
          create: expect.objectContaining({
            previousStock: 5,
            newStock: 7,
            difference: 2,
            previousConvertedQuantity: 30,
            newConvertedQuantity: 42,
            convertedDifference: 12
          })
        }
      })
    }));
    expect(wasteUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        currentStock: 7,
        convertedQuantity: 42
      }
    }));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'UPDATED_WASTE' }));
  });

  it('informa un conflicto cuando ya existe la misma identidad de merma', async () => {
    wasteFindFirst.mockResolvedValue({ id: 'waste-existing' });

    const req = {
      body: {
        name: 'Lámina',
        coneWeightKg: 0.25,
        totalWeightKg: 1.25,
        referenceRollTotalWeightKg: 1.25,
        materialId: 'material-1',
        supplierId: 'supplier-1',
        base: 2,
        height: 3,
        initialQuantity: 0
      },
      user: { id: 'user-1' }
    };

    await expect(registerWaste(req, createResponse())).rejects.toMatchObject({
      code: 'WASTE_ALREADY_EXISTS',
      statusCode: 409
    });
  });

  it('identifica un fallo de persistencia al agregar stock como error de entrada', async () => {
    wasteStockEntryCreate.mockRejectedValueOnce(new Error('database unavailable'));
    await expect(registerWasteStockAddition({
      params: { id: 'waste-1' }, body: { quantity: 2 }, user: { id: 'user-1' }
    }, createResponse())).rejects.toMatchObject({ code: 'WASTE_STOCK_ENTRY_DB_ERROR', statusCode: 500 });
    expect(wasteStockAdjustmentCreate).not.toHaveBeenCalled();
  });
});
