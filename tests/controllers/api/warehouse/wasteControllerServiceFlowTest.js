import { beforeEach, describe, expect, it, vi } from 'vitest';

const transaction = vi.fn();
const wasteCreate = vi.fn();
const wasteFindFirst = vi.fn();
const wasteFindUnique = vi.fn();
const wasteUpdate = vi.fn();
const wasteStockAdjustmentCreate = vi.fn();
const wasteStockAdjustmentUpdate = vi.fn();
const findSupplierMaterialById = vi.fn();
const findInitialStockAdjustmentReason = vi.fn();
const generateYearlyReferenceNumber = vi.fn();
const throwIfReferenceNumberAlreadyExists = vi.fn();
const createWasteMovement = vi.fn();

vi.mock('../../../../src/utils/logger.js', () => ({
  createServiceLogger: () => ({}),
  getModelLogContext: (_model, data = {}) => data,
  logServiceError: vi.fn(),
  logServiceInfo: vi.fn()
}));

vi.mock('../../../../src/repository/baseRepository.js', () => ({
  getDb: (tx = null) => tx || ({
    $transaction: transaction
  })
}));

vi.mock('../../../../src/services/warehouse/materials/supplierMaterialService.js', () => ({
  findSupplierMaterialById
}));

vi.mock('../../../../src/services/warehouse/reasonService.js', () => ({
  findInitialStockAdjustmentReason
}));

vi.mock('../../../../src/services/document/referenceNumberService.js', () => ({
  generateYearlyReferenceNumber,
  throwIfReferenceNumberAlreadyExists
}));

vi.mock('../../../../src/services/warehouse/wastes/wasteMovementService.js', () => ({
  createWasteMovement
}));

const {
  editWaste,
  editWasteStock,
  registerWaste
} = await import('../../../../src/controllers/api/warehouse/wasteController.js');

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

describe('wasteController service flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation((callback) => callback({
      waste: {
        create: wasteCreate,
        findFirst: wasteFindFirst,
        findUnique: wasteFindUnique,
        update: wasteUpdate
      },
      wasteStockAdjustment: {
        create: wasteStockAdjustmentCreate,
        update: wasteStockAdjustmentUpdate
      }
    }));
    wasteCreate.mockResolvedValue(createWaste());
    wasteFindFirst.mockResolvedValue(null);
    wasteFindUnique.mockResolvedValue(createWaste());
    wasteUpdate.mockResolvedValue(createWaste({ currentStock: 7, convertedQuantity: 42 }));
    wasteStockAdjustmentCreate.mockResolvedValue({ id: 'adjustment-1', details: [{ id: 'detail-1' }] });
    wasteStockAdjustmentUpdate.mockResolvedValue({ id: 'adjustment-1', details: [{ id: 'detail-1' }], movement: { id: 'movement-1' } });
    findSupplierMaterialById.mockResolvedValue({ id: 'supplier-material-1' });
    findInitialStockAdjustmentReason.mockResolvedValue({ id: 'initial-reason-1' });
    generateYearlyReferenceNumber.mockResolvedValue('ADJ-2026-0001');
    createWasteMovement.mockResolvedValue({ id: 'movement-1' });
  });

  it('crea merma desde controller calculando stock convertido inicial y registrando ajuste inicial', async () => {
    const req = {
      body: {
        supplierMaterialId: 'supplier-material-1',
        base: '2',
        height: '3',
        newStock: '5',
        observations: '  Stock inicial  ',
        reasonId: 'client-reason-id'
      },
      user: { id: 'user-1' }
    };
    const res = createResponse();

    await registerWaste(req, res);

    expect(wasteCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        currentStock: 5,
        convertedQuantity: 30
      })
    }));
    expect(wasteStockAdjustmentCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        reason: { connect: { id: 'initial-reason-1' } },
        details: {
          create: expect.objectContaining({
            previousStock: 0,
            newStock: 5,
            previousConvertedQuantity: 0,
            newConvertedQuantity: 30,
            convertedDifference: 30
          })
        }
      })
    }));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'CREATED_WASTE' }));
  });

  it('edita únicamente los datos secundarios sin cambiar existencias', async () => {
    const req = {
      params: { id: 'waste-1' },
      body: {
        minStock: '4',
        isActive: false,
        newStock: '99'
      }
    };
    const res = createResponse();

    await editWaste(req, res);

    expect(wasteUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'waste-1' },
      data: { minStock: 4, isActive: false }
    }));
    expect(wasteUpdate.mock.calls[0][0].data).not.toHaveProperty('currentStock');
    expect(wasteUpdate.mock.calls[0][0].data).not.toHaveProperty('newStock');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'UPDATED_WASTE' }));
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
        newStock: '7',
        reasonId: 'reason-1',
        observations: '  Conteo físico  '
      },
      user: { id: 'user-1' }
    };
    const res = createResponse();

    await editWasteStock(req, res);

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

  it('informa un conflicto cuando ya existe la misma merma sin dimensiones', async () => {
    wasteFindFirst.mockResolvedValue({ id: 'waste-existing' });

    const req = {
      body: {
        supplierMaterialId: 'supplier-material-1',
        base: '',
        height: '',
        newStock: '0'
      },
      user: { id: 'user-1' }
    };

    await expect(registerWaste(req, createResponse())).rejects.toMatchObject({
      code: 'WASTE_ALREADY_EXISTS',
      statusCode: 409
    });
  });
});
