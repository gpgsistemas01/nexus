import { validationResult } from 'express-validator';
import { describe, expect, it } from 'vitest';

import { errorMap } from '../../../src/messages/codeMessages.js';
import {
  catalogEntryEditValidation,
  catalogEntryValidation
} from '../../../src/validators/forms/catalogValidations.js';

const runValidation = async ({ rules = catalogEntryValidation, catalog, id, body }) => {
  const req = { body, params: { catalog, ...(id ? { id } : {}) } };

  for (const rule of rules) await rule.run(req);

  return { errors: validationResult(req).array(), body: req.body };
};

describe('validación HTTP de catálogos administrables', () => {
  it.each([
    [
      'departments',
      { name: ' Ventas ', isActive: 'true' },
      { name: 'Ventas', isActive: true }
    ],
    ['roles', { name: ' Operador ', isActive: 'true' }, { name: 'Operador', isActive: true }],
    [
      'presentations',
      { name: ' Caja ', isActive: 'true' },
      { name: 'Caja', isActive: true }
    ],
    [
      'unit-measures',
      { name: ' Metro ', symbol: ' m ', isActive: 'true' },
      { name: 'Metro', symbol: 'm', isActive: true }
    ],
    ['reasons', { name: ' Ajuste ', isActive: 'true' }, { name: 'Ajuste', isActive: true }],
    [
      'fulfillment-statuses',
      { name: ' Pendiente ', isActive: 'true' },
      { name: 'Pendiente', isActive: true }
    ]
  ])('acepta y normaliza los campos válidos de %s', async (catalog, body, expected) => {
    const result = await runValidation({ catalog, body });

    expect(result.errors).toEqual([]);
    expect(result.body).toMatchObject(expected);
  });

  it.each([
    ['unit-measures', { name: 'Metro', isActive: true }, 'symbol', errorMap.name.REQUIRED],
    ['departments', { name: 'Ventas' }, 'isActive', errorMap.isActive.REQUIRED],
    ['reasons', { name: 'Ajuste' }, 'isActive', errorMap.isActive.REQUIRED],
    ['reasons', { name: 'Ajuste', isActive: 'not-boolean' }, 'isActive', errorMap.isActive.INVALID_BOOLEAN]
  ])('rechaza el contrato inválido de %s', async (catalog, body, path, code) => {
    const { errors } = await runValidation({ catalog, body });

    expect(errors).toContainEqual(expect.objectContaining({ path, msg: code }));
  });

  it.each([
    ['departments', 51],
    ['roles', 51],
    ['presentations', 51],
    ['unit-measures', 21],
    ['reasons', 101],
    ['fulfillment-statuses', 51]
  ])('respeta el límite persistente de nombre para %s', async (catalog, length) => {
    const body = {
      name: 'x'.repeat(length),
      ...(catalog === 'unit-measures' ? { symbol: 'u' } : {}),
      isActive: true
    };
    const { errors } = await runValidation({ catalog, body });

    expect(errors).toContainEqual(expect.objectContaining({
      path: 'name',
      msg: errorMap.name.TOO_LONG(length - 1)
    }));
  });

  it('rechaza un catálogo fuera de la lista blanca', async () => {
    const { errors } = await runValidation({ catalog: 'users', body: { name: 'No permitido' } });

    expect(errors).toContainEqual(expect.objectContaining({
      path: 'catalog',
      msg: {
        code: errorMap.catalog.NOT_FOUND,
        meta: { catalogName: 'users' }
      }
    }));
  });

  it('delega al servicio la resolución del identificador de una edición', async () => {
    const { errors } = await runValidation({
      rules: catalogEntryEditValidation,
      catalog: 'roles',
      id: 'not-a-uuid',
      body: { name: 'Operador', isActive: true }
    });

    expect(errors).toEqual([]);
  });
});
