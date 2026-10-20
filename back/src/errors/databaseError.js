import { AppError } from './AppError.js';
import { errorMap } from '../messages/codeMessages.js';

const PRISMA_VALIDATION_ERROR_NAME = 'PrismaClientValidationError';
const UNKNOWN_SCHEMA_MEMBER_PATTERN = /Unknown (?:argument|field)\b/;
const INVALID_TEXT_REPRESENTATION = '22P02';
const INVALID_UUID_INPUT_PATTERN = /^invalid input syntax for type uuid\b/i;

export class RecordIdentifierInvalid extends AppError {
    constructor() {
        super('El identificador del registro no es válido.', errorMap.id.INVALID_UUID, 400);
    }
}

export class DatabaseTableMissing extends AppError {

    constructor() {
        super(
            'Falta una tabla requerida en la base de datos. Contacta a soporte.',
            'DATABASE_TABLE_MISSING',
            503
        );
    }
}

export class DatabaseColumnMissing extends AppError {

    constructor() {
        super(
            'Falta una columna requerida en la base de datos. Contacta a soporte.',
            'DATABASE_COLUMN_MISSING',
            503
        );
    }
}

export class PrismaClientOutOfSync extends AppError {

    constructor() {
        super(
            'El cliente de base de datos no está actualizado. Contacta a soporte.',
            'PRISMA_CLIENT_OUT_OF_SYNC',
            503
        );
    }
}

export const normalizeDatabaseError = error => {
    const cause = error?.meta?.driverAdapterError?.cause;
    if (cause?.originalCode === INVALID_TEXT_REPRESENTATION
        && INVALID_UUID_INPUT_PATTERN.test(cause.originalMessage ?? '')) {
        return new RecordIdentifierInvalid();
    }

    if (error?.code === 'P2021') return new DatabaseTableMissing();
    if (error?.code === 'P2022') return new DatabaseColumnMissing();
    if (
        error?.name === PRISMA_VALIDATION_ERROR_NAME &&
        UNKNOWN_SCHEMA_MEMBER_PATTERN.test(error?.message ?? '')
    ) return new PrismaClientOutOfSync();

    return error;
};
