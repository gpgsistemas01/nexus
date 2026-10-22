import { ApiError } from './apiError.js';
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
        throw new ApiError('El servidor devolvió un registro incompleto. Actualiza el listado.');
    }

    return { ...value, id: value.id, version: Number(value.version) };
};

export const readText = (record: Record<string, unknown>, field: string): string => {
    if (typeof record[field] !== 'string')
        throw new ApiError('El servidor devolvió datos incompletos.');

    return record[field];
};

export const readState = (record: Record<string, unknown>): boolean => {
    if (typeof record.isActive !== 'boolean')
        throw new ApiError('El servidor devolvió un estado incompleto.');

    return record.isActive;
};

export const confirmMutation = (value: unknown, expected: string) => {
    if (!isRecord(value) || value.code !== expected) {
        throw new ApiError(
            'No se pudo confirmar la operación. Actualiza el listado antes de reintentar.',
        );
    }
};
