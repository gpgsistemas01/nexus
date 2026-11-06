import { afterEach, expect, it, vi } from 'vitest';
import { apiClient } from '../../../../src/shared/http/apiClient.js';
import { inventoryReportService } from '../../../../src/modules/warehouse/services/inventoryReportService.js';
import { mockHttpAdapter } from '../../../helpers/httpAdapter.js';

const originalAdapter = apiClient.http.defaults.adapter;
afterEach(() => {
  apiClient.http.defaults.adapter = originalAdapter;
});

it('no descarga una página HTML presentada como reporte con HTTP 200', async () => {
  apiClient.http.defaults.adapter = mockHttpAdapter(() => ({
    data: new Blob(['<h1>Login</h1>'], { type: 'text/html' }),
  }));
  await expect(
    inventoryReportService.export(
      'materials',
      { page: 1, length: 10, search: '', supplierId: '', direction: 'asc' },
      'active',
    ),
  ).rejects.toThrow('Excel válido');
});

it('exporta con tipo, alcance y orden del listado, sin descargar toda la tabla en el navegador', async () => {
  const file = new Blob(['archivo de prueba'], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const transport = vi.fn((config) => {
    expect(config.responseType).toBe('blob');
    return { data: file };
  });
  apiClient.http.defaults.adapter = mockHttpAdapter(transport);
  await expect(
    inventoryReportService.export(
      'consumables',
      { page: 1, length: 20, search: 'Cinta', supplierId: '', direction: 'desc', orderColumn: 0 },
      'inStock',
    ),
  ).resolves.toBe(file);
  const query = new URL(transport.mock.calls[0]![0].url!, 'http://frontend.test').searchParams;
  expect(Object.fromEntries(query)).toMatchObject({
    type: 'CONSUMABLE',
    search: 'Cinta',
    inventoryScope: 'inStock',
    'order[0][dir]': 'desc',
  });
});
