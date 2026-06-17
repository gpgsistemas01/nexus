import { describe, expect, it, vi } from 'vitest';

import { withRollbackTransaction } from './rollbackTransaction.js';

describe('rollbackTransaction', () => {
  it('ejecuta la prueba dentro de una transacción y revierte al finalizar', async () => {
    const tx = { product: { create: vi.fn() } };
    const prisma = {
      $transaction: vi.fn(async (callback) => callback(tx))
    };
    const callback = vi.fn(async (transaction) => {
      await transaction.product.create({ data: { name: 'Producto de prueba' } });
    });

    await expect(withRollbackTransaction(prisma, callback)).resolves.toBeUndefined();

    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(tx);
    expect(tx.product.create).toHaveBeenCalledWith({ data: { name: 'Producto de prueba' } });
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
