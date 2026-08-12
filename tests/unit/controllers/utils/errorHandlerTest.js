import { describe, expect, it, vi } from 'vitest';

import { AppError } from '../../../../src/errors/AppError.js';
import {
    executeServiceOperation,
    handleServiceError
} from '../../../../src/services/serviceErrorHandler.js';

const logger = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
};

describe('serviceErrorHandler', () => {
    it('conserva los errores de dominio', () => {
        const domainError = new AppError('Conflicto', 'DOMAIN_CONFLICT', 409);

        expect(() => handleServiceError({
            logger,
            error: domainError,
            operation: 'test.operation',
            model: 'testModel',
            data: { id: 'test-id' },
            fallbackError: new Error('fallback')
        })).toThrow(domainError);
    });

    it('traduce errores inesperados al error de respaldo', async () => {
        const databaseError = new Error('database failure');
        const fallbackError = new AppError('Error controlado', 'DATABASE_ERROR', 500);

        await expect(executeServiceOperation({
            logger,
            operation: 'test.operation',
            model: 'testModel',
            data: { id: 'test-id' },
            fallbackError,
            action: async () => {
                throw databaseError;
            }
        })).rejects.toBe(fallbackError);
    });

    it('devuelve el resultado cuando la operación es exitosa', async () => {
        const result = await executeServiceOperation({
            logger,
            operation: 'test.operation',
            model: 'testModel',
            data: {},
            fallbackError: new Error('fallback'),
            action: async () => ({ id: 'result-id' })
        });

        expect(result).toEqual({ id: 'result-id' });
    });
});
