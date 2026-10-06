import { AppError } from './AppError.js';

const PRISMA_VALIDATION_ERROR_NAME = 'PrismaClientValidationError';
const UNKNOWN_SCHEMA_MEMBER_PATTERN = /Unknown (?:argument|field)\b/;

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
    if (error?.code === 'P2021') return new DatabaseTableMissing();
    if (error?.code === 'P2022') return new DatabaseColumnMissing();
    if (
        error?.name === PRISMA_VALIDATION_ERROR_NAME &&
        UNKNOWN_SCHEMA_MEMBER_PATTERN.test(error?.message ?? '')
    ) return new PrismaClientOutOfSync();

    return error;
};
