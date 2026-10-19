import { describe, expect, it } from 'vitest';
import {
  DatabaseColumnMissing,
  DatabaseTableMissing,
  RecordIdentifierInvalid,
  PrismaClientOutOfSync,
  normalizeDatabaseError
} from '../../../src/errors/databaseError.js';

describe('normalización de errores del esquema de base de datos', () => {
  it.each(['P2007', 'P2010'])('traduce un UUID mal formado de Prisma %s a un código público sin detalles SQL', code => {
    const error = { code, meta: { driverAdapterError: { cause: {
      originalCode: '22P02',
      originalMessage: 'invalid input syntax for type uuid: "invalid"'
    } } } };

    const result = normalizeDatabaseError(error);

    expect(result).toBeInstanceOf(RecordIdentifierInvalid);
    expect(result).toMatchObject({ code: 'RECORD_ID_INVALID', statusCode: 400 });
    expect(result.message).not.toMatch(/invalid input|SQL|22P02/);
    expect(result).not.toHaveProperty('meta');
  });

  it('no confunde un UUID inválido con un error numérico o de integridad', () => {
    const numericError = { code: 'P2007', meta: { driverAdapterError: { cause: {
      originalCode: '22P02', originalMessage: 'invalid input syntax for type integer: "invalid"'
    } } } };
    const integrityError = { code: 'P2003' };

    expect(normalizeDatabaseError(numericError)).toBe(numericError);
    expect(normalizeDatabaseError(integrityError)).toBe(integrityError);
  });

  it.each([
    ['P2021', DatabaseTableMissing, 'DATABASE_TABLE_MISSING', 'Falta una tabla requerida'],
    ['P2022', DatabaseColumnMissing, 'DATABASE_COLUMN_MISSING', 'Falta una columna requerida']
  ])('distingue el error conocido de Prisma %s', (prismaCode, ErrorType, code, message) => {
    const result = normalizeDatabaseError({ code: prismaCode });

    expect(result).toBeInstanceOf(ErrorType);
    expect(result).toEqual(expect.objectContaining({ code, statusCode: 503 }));
    expect(result.message).toContain(message);
  });

  it('reconoce un cliente Prisma generado con un esquema anterior', () => {
    const error = {
      name: 'PrismaClientValidationError',
      message: 'Unknown argument `type`. Available options are marked with ?.'
    };

    expect(normalizeDatabaseError(error)).toEqual(expect.objectContaining({
      code: 'PRISMA_CLIENT_OUT_OF_SYNC',
      statusCode: 503,
      message: 'El cliente de base de datos no está actualizado. Contacta a soporte.'
    }));
    expect(normalizeDatabaseError(error)).toBeInstanceOf(PrismaClientOutOfSync);
  });

  it('no reemplaza errores ajenos a una desincronización del esquema', () => {
    const error = new Error('fallo inesperado');

    expect(normalizeDatabaseError(error)).toBe(error);
    expect(normalizeDatabaseError(error)).not.toBeInstanceOf(PrismaClientOutOfSync);
  });
});
