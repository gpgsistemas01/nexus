import { describe, expect, it, vi } from 'vitest';

import { generateYearlyReferenceNumber, incrementNonYearlyReferenceNumberCounter } from '../../../src/services/document/referenceNumberService.js';

describe('referenceNumberService', () => {
  it('incrementa contadores no anuales por prefijo', async () => {
    const tx = {
      referenceNumberCounter: {
        update: vi.fn().mockResolvedValue({ counter: 3 })
      }
    };

    await expect(incrementNonYearlyReferenceNumberCounter({ type: 'PRO', tx })).resolves.toEqual({ counter: 3 });
    expect(tx.referenceNumberCounter.update).toHaveBeenCalledWith({
      where: { prefix_year: { prefix: 'PRO', year: 0 } },
      data: { counter: { increment: 1 } }
    });
  });

  it('genera referencias anuales con año y contador con padding', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-18T00:00:00Z'));

    const tx = {
      referenceNumberCounter: {
        upsert: vi.fn().mockResolvedValue({ counter: 42 })
      }
    };

    await expect(generateYearlyReferenceNumber({ type: 'REQ', tx })).resolves.toBe('REQ-2026-000042');
    expect(tx.referenceNumberCounter.upsert).toHaveBeenCalledWith({
      where: { prefix_year: { prefix: 'REQ', year: 2026 } },
      update: { counter: { increment: 1 } },
      create: { prefix: 'REQ', year: 2026, counter: 1 }
    });

    vi.useRealTimers();
  });
});
