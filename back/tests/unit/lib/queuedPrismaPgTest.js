import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ adapter: null }));
vi.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {
  async connect() { return state.adapter; }
} }));
const { QueuedPrismaPg } = await import('../../../src/lib/queuedPrismaPg.js');

const createTransaction = () => ({
  queryRaw: vi.fn(async query => query), executeRaw: vi.fn(async query => query),
  commit: vi.fn(async () => {}), rollback: vi.fn(async () => {})
});
const connect = () => new QueuedPrismaPg({}).connect();

beforeEach(() => {
  state.adapter = {
    queryRaw: vi.fn(async query => query),
    startTransaction: vi.fn(async () => createTransaction())
  };
});

describe('consultas PostgreSQL por conexión transaccional', () => {
  it('ordena lecturas y escrituras sobre la misma conexión y conserva sus resultados', async () => {
    const transaction = createTransaction();
    const first = Promise.withResolvers();
    const events = [];
    transaction.queryRaw.mockImplementation(async query => {
      events.push(query);
      return query === 'read first' ? first.promise : query;
    });
    transaction.executeRaw.mockImplementation(async query => { events.push(query); return 1; });
    state.adapter.startTransaction.mockResolvedValue(transaction);
    const startTransaction = state.adapter.startTransaction;
    const adapter = await connect();
    const tx = await adapter.startTransaction('Serializable');
    const results = [tx.queryRaw('read first'), tx.executeRaw('write'), tx.queryRaw('read last')];
    await Promise.resolve();

    expect(events).toEqual(['read first']);
    first.resolve('first result');
    expect(await Promise.all(results)).toEqual(['first result', 1, 'read last']);
    expect(events).toEqual(['read first', 'write', 'read last']);
    expect(startTransaction).toHaveBeenCalledWith('Serializable');
  });

  it('propaga el error original y permite continuar para que Prisma pueda revertir', async () => {
    const transaction = createTransaction();
    const error = new Error('database failure');
    transaction.queryRaw.mockRejectedValue(error);
    state.adapter.startTransaction.mockResolvedValue(transaction);
    const tx = await (await connect()).startTransaction();
    const results = await Promise.allSettled([tx.queryRaw('invalid'), tx.executeRaw('ROLLBACK')]);

    expect(results).toEqual([{ status: 'rejected', reason: error }, { status: 'fulfilled', value: 'ROLLBACK' }]);
    await tx.rollback();
    expect(transaction.rollback).toHaveBeenCalledOnce();
  });

  it('permite que otra transacción avance mientras la primera tiene una consulta pendiente', async () => {
    const first = Promise.withResolvers();
    const firstTransaction = createTransaction();
    firstTransaction.queryRaw.mockReturnValue(first.promise);
    state.adapter.startTransaction.mockResolvedValueOnce(firstTransaction).mockResolvedValueOnce(createTransaction());
    const adapter = await connect();
    const tx1 = await adapter.startTransaction();
    const tx2 = await adapter.startTransaction();
    const pending = tx1.queryRaw('slow');

    try {
      expect(await tx2.queryRaw('independent')).toBe('independent');
    } finally { first.resolve('slow result'); }
    expect(await pending).toBe('slow result');
  });

  it('conserva la concurrencia del pool fuera de las transacciones', async () => {
    const first = Promise.withResolvers();
    state.adapter.queryRaw.mockImplementation(query => query === 'slow' ? first.promise : Promise.resolve(query));
    const adapter = await connect();
    const pending = adapter.queryRaw('slow');

    try {
      expect(await adapter.queryRaw('independent')).toBe('independent');
    } finally { first.resolve('slow result'); }
    expect(await pending).toBe('slow result');
  });
});
