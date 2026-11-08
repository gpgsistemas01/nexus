import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { Prisma } from '../../../../generated/prisma/client.ts';
import { getDb } from '../../../repository/baseRepository.js';
import { OperationKeyConflictError, RecordVersionConflictError } from '../../../errors/concurrencyError.js';
import { InventoryImportError } from '../../../errors/warehouse/inventoryImportError.js';
import { INVENTORY_IMPORT_LIMITS as limits } from '../../../shared/constants/inventoryImport.js';
import { UUID_V4_PATTERN } from '../../../shared/constants/inputValidation.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';
import { AppError } from '../../../errors/AppError.js';
import { writeInventoryImport } from './inventoryImportWriteService.js';
import { authorizeInventoryImport } from './inventoryImportConfig.js';
import { processInventoryWorkbook } from './inventoryWorkbookService.js';
import { validateInventoryImportRows } from './inventoryImportValidationService.js';
import { createServiceLogger, logServiceInfo } from '../../../utils/logger.js';

const logger = createServiceLogger('warehouse.inventoryImport');
const json = value => JSON.parse(JSON.stringify(value));
const hash = value => createHash('sha256').update(value).digest('hex');
const publicRow = ({ dto, reference, ...row }) => row;

const owned = async ({ id, user, db = getDb() }) => {
    if (!UUID_V4_PATTERN.test(id ?? '')) throw new InventoryImportError('NOT_FOUND');
    const batch = await db.inventoryImport.findFirst({ where: { id, userId: user.id } });
    if (!batch) throw new InventoryImportError('NOT_FOUND');
    authorizeInventoryImport(user, batch.resource, batch.mode);
    const visibleRows = batch.preview?.rows ?? batch.result?.rows ?? [];
    if (batch.mode === 'mixed' && !user.permissions.includes(PERMISSIONS.INVENTORY_COSTS_READ)
        && visibleRows.some(row => Object.hasOwn(row.before ?? {}, 'maxUnitCost') || Object.hasOwn(row.after ?? {}, 'maxUnitCost'))) {
        throw new AppError('No tiene permiso para consultar los costos de esta importación.', 'FORBIDDEN', 403);
    }
    return batch;
};

const view = batch => {
    const expired = batch.status === 'DRAFT' && batch.expiresAt <= new Date();
    return { id: batch.id, version: batch.version, resource: batch.resource, mode: batch.mode,
        status: expired ? 'EXPIRED' : batch.status, filename: batch.filename,
        createdAt: batch.createdAt, expiresAt: batch.expiresAt, completedAt: batch.completedAt,
        preview: expired ? null : batch.preview, result: batch.result };
};

export const previewInventoryImport = async ({ user, resource, mode, filename, buffer, signal }) => {
    const config = authorizeInventoryImport(user, resource, mode);
    const started = performance.now();
    const fileHash = hash(buffer);
    const rows = await processInventoryWorkbook({ action: 'read', config, bytes: buffer }, signal);
    signal?.throwIfAborted();
    const validated = await validateInventoryImportRows({ db: getDb(), config, rows, user });
    signal?.throwIfAborted();
    const preview = { summary: validated.summary, rows: validated.rows.map(publicRow) };
    const payload = validated.summary.errors ? undefined : json(validated.rows.map(row => ({
        row: row.row, id: row.id, dto: row.dto, reference: row.reference, before: row.before
    })));
    const batch = await getDb().inventoryImport.create({ data: {
        userId: user.id, resource, mode, filename, fileHash,
        ...(payload && { payload }), preview: json(preview),
        expiresAt: new Date(Date.now() + limits.draftHours * 60 * 60 * 1000)
    } });
    logServiceInfo(logger, { operation: 'preview', userId: user.id, resource, mode,
        rows: rows.length, durationMs: Math.round(performance.now() - started) }, 'Vista previa de importación preparada');
    return view(batch);
};

export const getInventoryImport = async ({ id, user }) => view(await owned({ id, user }));

export const cancelInventoryImport = async ({ id, user }) => {
    const batch = await owned({ id, user });
    if (batch.status !== 'DRAFT') throw new InventoryImportError('STATE');
    const result = await getDb().inventoryImport.updateMany({ where: { id, userId: user.id, status: 'DRAFT' },
        data: { status: 'CANCELED', payload: Prisma.DbNull, preview: Prisma.DbNull } });
    if (!result.count) throw new InventoryImportError('STATE');
    return view(await owned({ id, user }));
};

export const confirmInventoryImport = async ({ id, user, expectedVersion, operationId }) => {
    if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0 || !UUID_V4_PATTERN.test(operationId ?? '')) throw new InventoryImportError();
    await owned({ id, user });
    const started = performance.now();
    try {
        const completed = await getDb().$transaction(async tx => {
            await tx.$executeRaw`SET LOCAL lock_timeout = '1500ms'`;
            await tx.$queryRaw`SELECT "id" FROM "InventoryImport" WHERE "id" = ${id}::uuid AND "userId" = ${user.id}::uuid FOR UPDATE`;
            const batch = await owned({ id, user, db: tx });
            const commandHash = hash(JSON.stringify({ id, expectedVersion, fileHash: batch.fileHash }));
            if (batch.status === 'COMPLETED') {
                if (batch.operationId !== operationId || batch.commandHash !== commandHash) throw new OperationKeyConflictError();
                return { batch: view(batch), replayed: true };
            }
            if (batch.status !== 'DRAFT') throw new InventoryImportError('STATE');
            if (batch.expiresAt <= new Date()) throw new InventoryImportError('EXPIRED');
            if (batch.version !== expectedVersion) throw new RecordVersionConflictError();
            if (!Array.isArray(batch.payload) || batch.preview?.summary?.errors) throw new InventoryImportError('VALIDATION');
            const [gate] = await tx.$queryRaw`SELECT pg_try_advisory_xact_lock(733040, 1) AS allowed`;
            if (!gate.allowed) throw new InventoryImportError('BUSY');
            const config = authorizeInventoryImport(user, batch.resource, batch.mode);
            const rows = batch.payload.map(row => ({ row: row.row, values: { ...row.dto, ...(row.id && { id: row.id }) } }));
            const validated = await validateInventoryImportRows({ db: tx, config, rows, user });
            if (validated.summary.errors) throw new InventoryImportError('CONFLICT', { rows: validated.rows.filter(row => row.errors.length).map(publicRow) });
            for (let index = 0; index < validated.rows.length; index++) {
                const current = validated.rows[index];
                const saved = batch.payload[index];
                if (!isDeepStrictEqual(current.reference, saved.reference)
                    || !isDeepStrictEqual(current.before, saved.before)
                    || !isDeepStrictEqual(current.dto, saved.dto)) throw new InventoryImportError('CONFLICT');
            }
            const saved = await writeInventoryImport({ tx, config, rows: validated.rows, context: validated.context, userId: user.id });
            const changes = validated.rows.map(row => ({ ...publicRow(row), id: saved.get(row.row) ?? row.id,
                supplierId: row.dto.supplierId ?? validated.context.wastes?.get(row.id)?.supplierId ?? null }));
            const result = json({ summary: validated.summary, rows: changes });
            const persisted = await tx.inventoryImport.update({ where: { id, version: expectedVersion }, data: {
                status: 'COMPLETED', operationId, commandHash, completedAt: new Date(), result,
                payload: Prisma.DbNull, preview: Prisma.DbNull
            } });
            return { batch: view(persisted), replayed: false };
        }, { maxWait: 1500, timeout: 30000 });
        logServiceInfo(logger, { operation: 'confirm', importId: id, userId: user.id,
            replayed: completed.replayed, durationMs: Math.round(performance.now() - started) }, 'Importación confirmada');
        return completed;
    } catch (error) {
        if (error.code === 'P2002' || error.meta?.code === '23505') throw new InventoryImportError('CONFLICT');
        if (error.code === 'P2028' || ['55P03', '57014', '40P01'].includes(error.meta?.code)) throw new InventoryImportError('BUSY');
        throw error;
    }
};

export const getInventoryImportErrors = async ({ id, user, signal }) => {
    const batch = await owned({ id, user });
    if (batch.status !== 'DRAFT' || batch.expiresAt <= new Date()) throw new InventoryImportError('EXPIRED');
    const rows = (batch.preview?.rows ?? []).flatMap(row => row.errors.map(error => ({
        row: row.row, name: row.name, column: error.column, message: error.message
    })));
    if (!rows.length) throw new InventoryImportError('VALIDATION');
    return processInventoryWorkbook({ action: 'errors', rows }, signal);
};
