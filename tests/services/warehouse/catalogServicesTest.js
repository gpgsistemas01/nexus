import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PresentationNotFound } from '../../../src/errors/warehouse/presentationError.js';
import { UnitMeasureNotFound } from '../../../src/errors/warehouse/unitMeasureError.js';

const presentationFindMany = vi.fn();
const presentationCount = vi.fn();
const presentationFindUnique = vi.fn();
const unitMeasureFindMany = vi.fn();
const unitMeasureCount = vi.fn();
const unitMeasureFindUnique = vi.fn();
const fulfillmentStatusFindMany = vi.fn();
const fulfillmentStatusCount = vi.fn();
const stockAdjustmentReasonFindMany = vi.fn();
const stockAdjustmentReasonCount = vi.fn();

vi.mock('../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    presentation: {
      findMany: presentationFindMany,
      count: presentationCount,
      findUnique: presentationFindUnique
    },
    unitMeasure: {
      findMany: unitMeasureFindMany,
      count: unitMeasureCount,
      findUnique: unitMeasureFindUnique
    },
    fulfillmentStatus: {
      findMany: fulfillmentStatusFindMany,
      count: fulfillmentStatusCount
    },
    stockAdjustmentReason: {
      findMany: stockAdjustmentReasonFindMany,
      count: stockAdjustmentReasonCount
    }
  })
}));

const { findAllPresentations, findUniquePresentation } = await import('../../../src/services/warehouse/presentationService.js');
const { findAllUnitMeasures, findUniqueUnitMeasure } = await import('../../../src/services/warehouse/unitMeasureService.js');
const { findAllFulfillmentStatuses } = await import('../../../src/services/warehouse/fulfillmentStatusService.js');
const { findAllReasons } = await import('../../../src/services/warehouse/reasonService.js');

describe('warehouse catalog GET services', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista presentaciones y valida búsqueda por id', async () => {
    const presentations = [{ id: 'presentation-1', name: 'Caja' }];
    presentationFindMany.mockResolvedValue(presentations);
    presentationCount.mockResolvedValueOnce(3).mockResolvedValueOnce(1);
    presentationFindUnique.mockResolvedValueOnce({ id: 'presentation-1' }).mockResolvedValueOnce(null);

    await expect(findAllPresentations({ search: 'caja', orderDir: 'desc' })).resolves.toEqual({
      data: presentations,
      recordsTotal: 3,
      recordsFiltered: 1
    });
    await expect(findUniquePresentation({ id: 'presentation-1' })).resolves.toEqual({ id: 'presentation-1' });
    await expect(findUniquePresentation({ id: 'missing-presentation' })).rejects.toThrow(PresentationNotFound);

    expect(presentationFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { name: { contains: 'caja', mode: 'insensitive' } },
      orderBy: { name: 'desc' }
    }));
  });

  it('lista unidades de medida y valida búsqueda por id', async () => {
    const units = [{ id: 'unit-1', name: 'Metro', symbol: 'm' }];
    unitMeasureFindMany.mockResolvedValue(units);
    unitMeasureCount.mockResolvedValueOnce(4).mockResolvedValueOnce(1);
    unitMeasureFindUnique.mockResolvedValueOnce({ id: 'unit-1' }).mockResolvedValueOnce(null);

    await expect(findAllUnitMeasures({ search: 'metro' })).resolves.toEqual({
      data: units,
      recordsTotal: 4,
      recordsFiltered: 1
    });
    await expect(findUniqueUnitMeasure({ id: 'unit-1' })).resolves.toEqual({ id: 'unit-1' });
    await expect(findUniqueUnitMeasure({ id: 'missing-unit' })).rejects.toThrow(UnitMeasureNotFound);

    expect(unitMeasureFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { name: { contains: 'metro', mode: 'insensitive' } },
      select: { id: true, name: true, symbol: true }
    }));
  });

  it('lista estados de surtido', async () => {
    const statuses = [{ id: 'status-1', name: 'Pendiente' }];
    fulfillmentStatusFindMany.mockResolvedValue(statuses);
    fulfillmentStatusCount.mockResolvedValueOnce(3).mockResolvedValueOnce(1);

    await expect(findAllFulfillmentStatuses({ search: 'pend' })).resolves.toEqual({
      data: statuses,
      recordsTotal: 3,
      recordsFiltered: 1
    });

    expect(fulfillmentStatusFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { name: { contains: 'pend', mode: 'insensitive' } }
    }));
  });

  it('lista razones de ajuste', async () => {
    const reasons = [{ id: 'reason-1', name: 'Conteo físico' }];
    stockAdjustmentReasonFindMany.mockResolvedValue(reasons);
    stockAdjustmentReasonCount.mockResolvedValueOnce(2).mockResolvedValueOnce(1);

    await expect(findAllReasons({ search: 'conteo' })).resolves.toEqual({
      data: reasons,
      recordsTotal: 2,
      recordsFiltered: 1
    });

    expect(stockAdjustmentReasonFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { name: { contains: 'conteo', mode: 'insensitive' } }
    }));
  });
});
