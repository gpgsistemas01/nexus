import { RecordVersionConflictError } from '../errors/concurrencyError.js';
import { PRISMA_ERROR_CODES } from '../constants/prisma.js';

// La condición se comprueba en la misma escritura. La BD incrementa version,
// también para los UPDATE SQL de existencias y costos.
export const updateVersionedRecord = async ({ model, expectedVersion, where, ...query }) => {
    try {
        return await model.update({
            ...query,
            where: { ...where, ...(expectedVersion !== undefined && { version: expectedVersion }) }
        });
    } catch (err) {
        if (err.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND && expectedVersion !== undefined
            && await model.findUnique({ where, select: { id: true } })) {
            throw new RecordVersionConflictError();
        }
        throw err;
    }
};

// Para comandos que ya tienen el saldo bloqueado antes de crear el documento.
export const assertRecordVersion = (record, expectedVersion) => {
    if (expectedVersion !== undefined && record.version !== expectedVersion) throw new RecordVersionConflictError();
};
