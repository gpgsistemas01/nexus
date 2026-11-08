import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import pg from 'pg';
import { resolveDatabaseUrl } from '../../../src/lib/databaseUrl.js';

const migration = readFileSync(new URL('../../../prisma/migrations/20261108000000_preserve_goods_receipt_cancellation_totals/migration.sql', import.meta.url), 'utf8');

const withLegacyReceipts = async callback => {
  const connection = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
  await connection.connect();
  try {
    await connection.query(`
      CREATE TEMP TABLE "GoodsReceipt" (
        "id" TEXT PRIMARY KEY, "type" TEXT, "referenceNumber" TEXT,
        "totalQuantity" NUMERIC(18,6), "totalNetPurchaseAmount" NUMERIC(18,6),
        "totalGrossPurchaseAmount" NUMERIC(18,6) CHECK ("totalGrossPurchaseAmount" >= 0)
      );
      CREATE TEMP TABLE "GoodsReceiptDetail" (
        "goodsReceiptId" TEXT, "status" TEXT, "quantity" NUMERIC(18,6),
        "netPurchaseAmount" NUMERIC(18,6), "grossPurchaseAmount" NUMERIC(18,6)
      );
      CREATE TEMP TABLE "GoodsReceiptDetailChange" (
        "id" TEXT, "goodsReceiptId" TEXT, "changeType" TEXT, "createdAt" TIMESTAMP,
        "correctedQuantity" NUMERIC(18,6), "correctedNetPurchaseAmount" NUMERIC(18,6),
        "correctedGrossPurchaseAmount" NUMERIC(18,6)
      );
    `);
    await callback(connection);
  } finally {
    await connection.end();
  }
};

const insertReceipt = (connection, id, quantity, type = 'MATERIAL') => connection.query(
  'INSERT INTO "GoodsReceipt" VALUES ($1, $2, $3, $4, $5, $6)',
  [id, type, `Migration-${id}`, quantity, quantity * 10, quantity * 11.6]
);
const insertDetail = (connection, id, quantity, status) => connection.query(
  'INSERT INTO "GoodsReceiptDetail" VALUES ($1, $2, $3, $4, $5)',
  [id, status, quantity, quantity * 10, quantity * 11.6]
);
const insertChange = (connection, receiptId, id, quantity, changeType = 'CANCELLATION', createdAt = '2026-11-07') => connection.query(
  'INSERT INTO "GoodsReceiptDetailChange" VALUES ($1, $2, $3, $4, $5, $6, $7)',
  [id, receiptId, changeType, createdAt, quantity, quantity * 10, quantity * 11.6]
);
const snapshot = async connection => (await connection.query('SELECT * FROM "GoodsReceipt" ORDER BY "id"')).rows.map(row => ({
  ...row,
  totalQuantity: Number(row.totalQuantity),
  totalNetPurchaseAmount: Number(row.totalNetPurchaseAmount),
  totalGrossPurchaseAmount: Number(row.totalGrossPurchaseAmount)
}));

describe('migración de totales de compras canceladas', () => {
  it('repara saldos activos e históricos sin alterar contexto, folio ni compras sin evidencia y permite repetición', async () => {
    await withLegacyReceipts(async connection => {
      for (const [id, quantity, type] of [
        ['active', 99, 'MATERIAL'], ['canceled', 0, 'MATERIAL'],
        ['consumable', 99, 'CONSUMABLE'], ['no-audit', 7, 'MATERIAL'], ['empty', 8, 'MATERIAL']
      ]) await insertReceipt(connection, id, quantity, type);
      await insertDetail(connection, 'active', 2, 'ACTIVE');
      await insertDetail(connection, 'active', 5, 'CANCELED');
      await insertDetail(connection, 'canceled', 5, 'CANCELED');
      await insertDetail(connection, 'canceled', 3, 'CANCELED');
      await insertDetail(connection, 'consumable', 4, 'ACTIVE');
      await insertDetail(connection, 'consumable', 2, 'CANCELED');
      await insertDetail(connection, 'no-audit', 7, 'CANCELED');
      await insertChange(connection, 'canceled', 'old', 5, 'CANCELLATION', '2026-11-06');
      await insertChange(connection, 'canceled', 'latest', 3);
      await insertChange(connection, 'canceled', 'correction', 50, 'CORRECTION', '2026-11-08');
      await insertChange(connection, 'active', 'active-history', 5);
      const before = await snapshot(connection);
      const quantities = { active: 2, canceled: 3, consumable: 4, 'no-audit': 7, empty: 8 };
      const details = (await connection.query('SELECT * FROM "GoodsReceiptDetail"')).rows;
      const history = (await connection.query('SELECT * FROM "GoodsReceiptDetailChange"')).rows;

      await connection.query(migration);

      const expected = before.map(row => ({
        ...row,
        totalQuantity: quantities[row.id],
        totalNetPurchaseAmount: quantities[row.id] * 10,
        totalGrossPurchaseAmount: Number((quantities[row.id] * 11.6).toFixed(6))
      }));
      expect(await snapshot(connection)).toEqual(expected);
      expect((await connection.query('SELECT * FROM "GoodsReceiptDetail"')).rows).toEqual(details);
      expect((await connection.query('SELECT * FROM "GoodsReceiptDetailChange"')).rows).toEqual(history);
      await connection.query(migration);
      expect(await snapshot(connection)).toEqual(expected);
    });
  });

  it('resuelve cancelaciones con la misma fecha de forma determinista', async () => {
    await withLegacyReceipts(async connection => {
      await insertReceipt(connection, 'same-time', 0);
      await insertDetail(connection, 'same-time', 1, 'CANCELED');
      await insertDetail(connection, 'same-time', 2, 'CANCELED');
      await insertChange(connection, 'same-time', 'a', 1);
      await insertChange(connection, 'same-time', 'z', 2);

      await connection.query(migration);

      expect((await snapshot(connection))[0]).toMatchObject({ totalQuantity: 2, totalNetPurchaseAmount: 20, totalGrossPurchaseAmount: 23.2 });
    });
  });

  it('revierte también la reparación activa si una actualización histórica falla', async () => {
    await withLegacyReceipts(async connection => {
      await insertReceipt(connection, 'active', 99);
      await insertDetail(connection, 'active', 2, 'ACTIVE');
      await insertReceipt(connection, 'invalid-history', 7);
      await insertChange(connection, 'invalid-history', 'invalid', -1);
      const before = await snapshot(connection);

      await expect(connection.query(migration)).rejects.toMatchObject({ code: '23514' });
      await connection.query('ROLLBACK');

      expect(await snapshot(connection)).toEqual(before);
    });
  });
});
