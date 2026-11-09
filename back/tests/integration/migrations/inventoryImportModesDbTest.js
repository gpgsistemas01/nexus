import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import pg from 'pg';

import { resolveDatabaseUrl } from '../../../src/lib/databaseUrl.js';

const migration = readFileSync(new URL('../../../prisma/migrations/20261109000000_single_operation_inventory_import/migration.sql', import.meta.url), 'utf8');
const previousMigration = readFileSync(new URL('../../../prisma/migrations/20261108030000_unified_inventory_import/migration.sql', import.meta.url), 'utf8');

const withImportTable = async callback => {
    const connection = new pg.Client({ connectionString: resolveDatabaseUrl({ nodeEnv: 'test', preferDirectUrl: true }) });
    await connection.connect();
    try {
        await connection.query('CREATE TEMP TABLE "InventoryImport" (LIKE public."InventoryImport" INCLUDING ALL)');
        await connection.query(previousMigration);
        await callback(connection);
    } finally {
        await connection.end();
    }
};

const insertImport = (connection, mode) => connection.query(`INSERT INTO "InventoryImport"
    ("id", "resource", "mode", "filename", "fileHash", "payload", "expiresAt")
    VALUES ($1, 'materials', $2, 'inventario.xlsx', 'migration-test', '{"quantity":2}', '2026-11-10')`, [randomUUID(), mode]);
const snapshot = async connection => (await connection.query('SELECT * FROM "InventoryImport" ORDER BY "id"')).rows;

describe('migración de una operación por archivo de inventario', () => {
    it('conserva las tres operaciones y sus datos, y rechaza modos no admitidos sin escrituras', async () => {
        await withImportTable(async connection => {
            for (const mode of ['create', 'update', 'adjust']) await insertImport(connection, mode);
            const before = await snapshot(connection);
            await connection.query(migration);
            expect(await snapshot(connection)).toEqual(before);
            for (const mode of ['mixed', 'delete']) {
                await expect(insertImport(connection, mode)).rejects.toMatchObject({ code: '23514' });
            }
            expect(await snapshot(connection)).toEqual(before);
            for (const mode of ['create', 'update', 'adjust']) await insertImport(connection, mode);
            expect(await snapshot(connection)).toHaveLength(6);
        });
    });

    it('detiene la migración si existen modos no admitidos, sin convertir ni borrar registros', async () => {
        await withImportTable(async connection => {
            await insertImport(connection, 'create');
            await insertImport(connection, 'mixed');
            const before = await snapshot(connection);
            const constraint = async () => (await connection.query(`SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint
                WHERE conrelid = '"InventoryImport"'::regclass AND conname = 'InventoryImport_mode_check'`)).rows[0];
            const previousConstraint = await constraint();
            await expect(connection.query(migration)).rejects.toMatchObject({ code: '23514' });
            await connection.query('ROLLBACK');
            expect(await snapshot(connection)).toEqual(before);
            expect(await constraint()).toEqual(previousConstraint);
        });
    });
});
