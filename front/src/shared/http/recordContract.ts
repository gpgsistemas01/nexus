import { ResponseContractError } from '../clientError.js';
import { getSuccessMessage } from '@nexus/api-messages';
import { isRecord } from '../utils/isRecord.js';

export const readRecord = (
    value: unknown,
): Record<string, unknown> & { id: string; version: number } => {
    if (
        !isRecord(value) ||
        typeof value.id !== 'string' ||
        !value.id ||
        !Number.isInteger(value.version) ||
        Number(value.version) < 0
    ) {
        throw new ResponseContractError(
            'El servidor devolvió un registro incompleto. Actualiza el listado.',
        );
    }

    return { ...value, id: value.id, version: Number(value.version) };
};

export const readText = (record: Record<string, unknown>, field: string): string => {
    if (typeof record[field] !== 'string')
        throw new ResponseContractError('El servidor devolvió datos incompletos.');

    return record[field];
};

export const readState = (record: Record<string, unknown>): boolean => {
    if (typeof record.isActive !== 'boolean')
        throw new ResponseContractError('El servidor devolvió un estado incompleto.');

    return record.isActive;
};

export const mapUniqueRecords = <T extends { id: string }>(
    values: unknown[],
    read: (value: unknown) => T,
    invalidResponse: () => ResponseContractError,
): T[] => {
    const ids = new Set<string>();
    return values.map((value) => {
        const record = read(value);
        if (ids.has(record.id)) throw invalidResponse();

        ids.add(record.id);
        return record;
    });
};

export interface MutationConfirmation {
    code: string;
    message: string;
}

export const confirmMutation = (
    value: unknown,
    expected: string,
    errorMessage = 'No se pudo confirmar la operación. Actualiza el listado antes de reintentar.',
): MutationConfirmation => {
    if (!isRecord(value) || value.code !== expected) {
        throw new ResponseContractError(errorMessage);
    }

    return { code: value.code, message: getSuccessMessage(value.code) };
};
