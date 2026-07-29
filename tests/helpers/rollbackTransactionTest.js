import { describe, expect, it, vi } from 'vitest';

import { withRollbackTransaction } from './rollbackTransaction.js';

describe('rollbackTransaction', () => {
  it('ejecuta la prueba dentro de una transacción y revierte al finalizar', async () => {
    const tx = { material: { create: vi.fn() } };
    const prisma = {
      $transaction: vi.fn(async (callback) => callback(tx))
    };
    const callback = vi.fn(async (transaction) => {
      await transaction.material.create({ data: { name: 'Material de prueba' } });
    });

    await expect(withRollbackTransaction(prisma, callback)).resolves.toBeUndefined();

    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(tx);
    expect(tx.material.create).toHaveBeenCalledWith({ data: { name: 'Material de prueba' } });
  });

  it('propaga errores reales del cuerpo de la prueba', async () => {
    const expectedError = new Error('falló la prueba');
    const prisma = {
      $transaction: vi.fn(async (callback) => callback({}))
    };

    await expect(withRollbackTransaction(prisma, async () => {
      throw expectedError;
    })).rejects.toThrow(expectedError);
  });
});
