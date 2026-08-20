import { describe, expect, it, vi } from 'vitest';

import {
  createApplicationList,
  createApplicationMutation,
  createCrudApplication
} from '../../../../../src/public/js/application/createCrudApplication.js';

describe('fábrica de aplicaciones CRUD', () => {
  it.each([
    ['parámetros explícitos', { page: 2 }],
    ['parámetros predeterminados', undefined]
  ])('construye listados con %s', async (_case, params) => {
    const response = { data: { data: [{ id: 'resource-1' }] } };
    const request = vi.fn().mockResolvedValue(response);
    const getAll = createApplicationList(request);

    await expect(getAll(params)).resolves.toBe(response);
    expect(request).toHaveBeenCalledWith({ params: params ?? {} });
  });

  it('mantiene el contrato de listado del request', async () => {
    const response = { data: { data: [{ id: 'resource-1' }] } };
    const requests = {
      getAll: vi.fn().mockResolvedValue(response),
      register: vi.fn(),
      edit: vi.fn()
    };
    const application = createCrudApplication({ requests });

    await expect(application.getAll({ page: 2 })).resolves.toBe(response);
    expect(requests.getAll).toHaveBeenCalledWith({ params: { page: 2 } });
  });

  it.each([
    ['register', { formData: { name: 'Nuevo' }, creationContext: 'modal' }, { data: { name: 'Nuevo' }, creationContext: 'modal' }],
    ['edit', { formData: { name: 'Editado' }, id: 'resource-1' }, { data: { name: 'Editado' }, id: 'resource-1' }]
  ])('adapta %s sin perder las opciones del contexto', async (operation, input, expectedRequest) => {
    const requests = {
      getAll: vi.fn(),
      register: vi.fn().mockResolvedValue({ data: { code: 'OK', resource: input.formData } }),
      edit: vi.fn().mockResolvedValue({ data: { code: 'OK', resource: input.formData } })
    };
    const application = createCrudApplication({ requests, dataKey: 'resource' });

    await expect(application[operation](input)).resolves.toEqual({
      message: expect.any(String),
      data: input.formData
    });
    expect(requests[operation]).toHaveBeenCalledWith(expectedRequest);
  });

  it('propaga identificadores de detalle en las mutaciones adicionales', async () => {
    const request = vi.fn().mockResolvedValue({ data: { code: 'OK' } });
    const mutation = createApplicationMutation({ request });

    await mutation({ formData: { quantity: 1 }, id: 'issue-1', detailId: 'detail-1' });

    expect(request).toHaveBeenCalledWith({
      data: { quantity: 1 },
      id: 'issue-1',
      detailId: 'detail-1'
    });
  });

  it('construye mutaciones adicionales con claves de respuesta propias', async () => {
    const requests = {
      getAll: vi.fn(),
      register: vi.fn(),
      edit: vi.fn(),
      changeStatus: vi.fn().mockResolvedValue({
        data: { code: 'OK', statusChange: { status: 'INACTIVE' } }
      })
    };
    const application = createCrudApplication({
      requests,
      dataKey: 'resource',
      dataKeys: { changeStatus: 'statusChange' },
      additionalMutations: ['changeStatus']
    });

    await expect(application.changeStatus({ id: 'resource-1' })).resolves.toEqual({
      message: expect.any(String),
      data: { status: 'INACTIVE' }
    });
    expect(requests.changeStatus).toHaveBeenCalledWith({ id: 'resource-1' });
    expect(Object.isFrozen(application)).toBe(true);
  });

  it('permite que una mutación adicional omita la clave de datos común', async () => {
    const requests = {
      getAll: vi.fn(),
      register: vi.fn(),
      edit: vi.fn(),
      reset: vi.fn().mockResolvedValue({ data: { code: 'OK', resource: { id: 'resource-1' } } })
    };
    const application = createCrudApplication({
      requests,
      dataKey: 'resource',
      dataKeys: { reset: null },
      additionalMutations: ['reset']
    });

    await expect(application.reset({ id: 'resource-1' })).resolves.toEqual({
      message: expect.any(String)
    });
  });
});
