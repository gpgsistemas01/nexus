import { afterEach, expect, it } from 'vitest';
import { apiClient } from '../../../../src/shared/http/apiClient.js';
import { requestPage } from '../../../../src/shared/http/pageRequest.js';
import { mockHttpAdapter } from '../../../helpers/httpAdapter.js';
const original = apiClient.http.defaults.adapter;
afterEach(() => {
  apiClient.http.defaults.adapter = original;
});

it.each([
  { recordsFiltered: -1, recordsTotal: 10 },
  { recordsFiltered: 0, recordsTotal: 0.5 },
  { recordsFiltered: Number.MAX_SAFE_INTEGER + 1, recordsTotal: Number.MAX_SAFE_INTEGER + 1 },
])('rechaza conteos que no representan una paginación válida: %o', async (counts) => {
  apiClient.http.defaults.adapter = mockHttpAdapter(() => ({ data: { data: [], ...counts } }));
  await expect(requestPage('/api/warehouse/materials')).rejects.toThrow('listado inesperado');
});
it('un listado vacío con conteos cero conserva el contrato válido', async () => {
  const page = { data: [], recordsFiltered: 0, recordsTotal: 0 };
  apiClient.http.defaults.adapter = mockHttpAdapter(() => ({ data: page }));
  await expect(requestPage('/api/warehouse/materials')).resolves.toEqual(page);
});
