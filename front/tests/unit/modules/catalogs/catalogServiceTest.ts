import { afterEach, expect, it } from 'vitest';
import { apiClient } from '../../../../src/shared/http/apiClient.js';
import { catalogService } from '../../../../src/modules/catalogs/services/catalogService.js';
import { mockHttpAdapter } from '../../../helpers/httpAdapter.js';
const entry = { id: 'entry-1', name: 'Operador', isActive: false, version: 3 };
const original = apiClient.http.defaults.adapter;
afterEach(() => {
  apiClient.http.defaults.adapter = original;
});
it('el contrato paginado conserva búsqueda/página y no publica claves internas', async () => {
  apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
    const query = new URL(config.url!, 'http://front.test').searchParams;
    expect(config.url).toContain('/api/admin/catalogs/roles?');
    expect(Object.fromEntries(query)).toEqual({
      start: '20',
      length: '20',
      search: 'Opera',
    });
    return {
      data: { data: [{ ...entry, key: 'ADMINISTRATOR' }], recordsTotal: 21, recordsFiltered: 21 },
    };
  });
  const result = await catalogService.list('roles', {
    page: 2,
    length: 20,
    search: 'Opera',
  });
  expect(result.data).toEqual([{ ...entry, symbol: '' }]);
});
it('editar usa PUT y expectedVersion sin cambiar la versión original', async () => {
  apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
    expect(config.method).toBe('put');
    expect(config.url).toBe('/api/admin/catalogs/roles/entry-1');
    expect(JSON.parse(config.data)).toEqual({
      name: 'Operador',
      isActive: false,
      expectedVersion: 3,
    });
    return { data: { data: { ...entry, version: 4 }, code: 'UPDATED_CATALOG_ENTRY' } };
  });
  await expect(
    catalogService.save(
      'roles',
      { action: 'edit', row: { ...entry, symbol: '' } },
      { name: 'Operador', isActive: false, expectedVersion: 3 },
    ),
  ).resolves.toMatchObject({ version: 4 });
});
it.each([
  '<h1>Login</h1>',
  { data: [], recordsFiltered: '0', recordsTotal: 0 },
  { data: [{ ...entry, version: undefined }], recordsFiltered: 1, recordsTotal: 1 },
])('una respuesta incompleta no se presenta como catálogo válido', async (data) => {
  apiClient.http.defaults.adapter = mockHttpAdapter(() => ({ data }));
  await expect(catalogService.list('roles', { search: '', page: 1, length: 10 })).rejects.toThrow();
});
it('un código de éxito inesperado no confirma una escritura', async () => {
  apiClient.http.defaults.adapter = mockHttpAdapter(() => ({
    data: { data: entry, code: 'SUCCESS' },
  }));
  await expect(
    catalogService.save('roles', { action: 'create' }, { name: 'Operador', isActive: false }),
  ).rejects.toThrow('confirmar');
});

it('Material devuelve identidad, tipo y medidas sin exigir ni inventar proveedor o estado', async () => {
  apiClient.http.defaults.adapter = mockHttpAdapter(() => ({
    data: {
      data: [
        {
          id: 'm',
          version: 0,
          name: 'Consumible',
          type: 'CONSUMABLE',
          presentationId: 'p',
          unitMeasureId: 'u',
          presentation: { name: 'PIEZA' },
          unitMeasure: { name: 'PIEZA', symbol: 'PZA.' },
          base: null,
          height: null,
          minStock: '0',
        },
      ],
      recordsTotal: 1,
      recordsFiltered: 1,
    },
  }));
  const result = await catalogService.list('materials', { search: '', page: 1, length: 10 });
  expect(result.data[0]).toMatchObject({
    id: 'm',
    type: 'CONSUMABLE',
    presentation: 'PIEZA',
    unitSymbol: 'PZA.',
    base: '',
    height: '',
    minStock: '0',
  });
  expect(result.data[0]).not.toHaveProperty('isActive');
});

it('el alta contextual rechaza una respuesta de otro tipo de artículo', async () => {
  apiClient.http.defaults.adapter = mockHttpAdapter(() => ({
    data: {
      code: 'CREATED_CATALOG_ENTRY',
      data: {
        id: 'm',
        version: 0,
        name: 'Consumible',
        type: 'CONSUMABLE',
        presentationId: 'p',
        unitMeasureId: 'u',
        presentation: { name: 'PIEZA' },
        unitMeasure: { name: 'PIEZA', symbol: 'PZA.' },
        base: null,
        height: null,
        minStock: '0',
      },
    },
  }));
  await expect(
    catalogService.save('materials', { action: 'create', materialType: 'MATERIAL' }, {}),
  ).rejects.toThrow('otro catálogo');
});
