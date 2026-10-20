import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../../../src/errors/AppError.js';

const { create, errorLog } = vi.hoisted(() => ({ create: vi.fn(), errorLog: vi.fn() }));
vi.mock('../../../src/repository/baseRepository.js', () => ({
    getDb: () => ({ $transaction: async () => create(), person: { create }, client: { create }, supplier: { create }, user: { create } })
}));
vi.mock('../../../src/utils/logger.js', () => ({
    createServiceLogger: () => ({}), logServiceError: errorLog,
    logServiceInfo: vi.fn(), getModelLogContext: () => ({})
}));
vi.mock('../../../src/utils/encryptionUtils.js', () => ({ encryptPassword: async () => 'hash', verifyPassword: vi.fn() }));

import { createPerson } from '../../../src/services/admin/person/personService.js';
import { createClient } from '../../../src/services/sales/clientService.js';
import { createSupplier } from '../../../src/services/warehouse/supplierService.js';
import { createUser } from '../../../src/services/admin/userService.js';

beforeEach(() => vi.clearAllMocks());
const operations = [
    ['persona', () => createPerson({ personDto: { fullName: 'Persona', accesses: [] } }), 'PERSON_CREATE_DB_ERROR'],
    ['cliente', () => createClient({ clientDto: { name: 'Cliente' } }), 'CLIENT_CREATE_DB_ERROR'],
    ['proveedor', () => createSupplier({ tradeName: 'Proveedor' }), 'SUPPLIER_CREATE_DB_ERROR'],
    ['usuario', () => createUser({ userDto: { name: 'Usuario', password: 'Clave1' } }), 'USER_CREATE_DATABASE_ERROR']
];

describe('contrato común de errores en altas', () => {
    it.each(operations)('conserva el código de negocio de %s y registra el fallo una vez', async (label, execute) => {
        const error = new AppError('Conflicto', 'DOMAIN_CONFLICT', 409);
        create.mockRejectedValue(error);
        await expect(execute()).rejects.toBe(error);
        expect(errorLog).toHaveBeenCalledTimes(1);
    });

    it.each(operations)('normaliza un esquema no disponible al crear %s', async (label, execute) => {
        create.mockRejectedValue({ code: 'P2021' });
        await expect(execute()).rejects.toMatchObject({ code: 'DATABASE_TABLE_MISSING', statusCode: 503 });
    });

    it.each(operations)('traduce un fallo desconocido al código propio de %s', async (label, execute, code) => {
        create.mockRejectedValue(new Error('driver error'));
        await expect(execute()).rejects.toMatchObject({ code, statusCode: 500 });
    });
});
