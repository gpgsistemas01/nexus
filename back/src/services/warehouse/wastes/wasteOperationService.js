import { isAppError } from '../../../errors/AppError.js';
import { UserNotFound } from '../../../errors/admin/userError.js';
import { PRISMA_ERROR_CODES } from '../../../constants/prisma.js';
import { createHash } from 'node:crypto';
import { getDb } from '../../../repository/baseRepository.js';
import { OperationKeyConflictError } from '../../../errors/concurrencyError.js';

// Orden estable: el orden de propiedades de JSON no cambia la identidad de la captura.
const canonicalize = value => value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]))
    : Array.isArray(value) ? value.map(canonicalize) : value;

export const executeWasteOperation = ({ operationId, userId, command, execute }) => getDb().$transaction(async tx => {
    // Las llamadas internas sin clave conservan el contrato transaccional; HTTP exige UUID.
    if (!operationId) return execute(tx);

    const requestHash = createHash('sha256').update(JSON.stringify(canonicalize(command))).digest('hex');
    let claim;
    try {
        claim = await tx.wasteOperation.createMany({ data: { userId, operationId, requestHash }, skipDuplicates: true });
    } catch (err) {
        // La única FK del recibo es el actor autenticado; no se requiere otra lectura.
        if (err.code === PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT) throw new UserNotFound();
        throw err;
    }
    const { count } = claim;
    const where = { userId_operationId: { userId, operationId } };

    // ON CONFLICT espera el commit rival; el recibo y los efectos se confirman juntos.
    if (count === 0) {
        const saved = await tx.wasteOperation.findUniqueOrThrow({ where });
        if (saved.requestHash !== requestHash) throw new OperationKeyConflictError();
        return saved.result;
    }

    const result = await execute(tx);
    await tx.wasteOperation.update({ where, data: { result: JSON.parse(JSON.stringify(result)) } });
    return result;
});

// Sólo el servicio que ya observó el rollback puede confirmar que esta captura no se guardó.
// Un conflicto de clave corresponde a un recibo existente y no autoriza descartarlo.
export const markWasteOperationRejected = ({ err, operationId }) => {
    if (operationId && isAppError(err) && err.statusCode < 500 && !(err instanceof OperationKeyConflictError)) {
        err.meta = { ...err.meta, operationRejected: true };
    }
    return err;
};
