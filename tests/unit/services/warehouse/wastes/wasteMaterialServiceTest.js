import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../src/repository/baseRepository.js', () => ({ getDb: vi.fn() }));
const findWasteTemplatePage = vi.hoisted(() => vi.fn());
vi.mock('../../../../../src/repository/warehouse/wasteTemplateRepository.js', () => ({ findWasteTemplatePage }));
const { findWasteMaterialTemplates } = await import('../../../../../src/services/warehouse/wastes/wasteMaterialService.js');

describe('límite de consulta de plantillas', () => {
    it('sin proveedor no consulta ni devuelve plantillas', async () => {
        expect(await findWasteMaterialTemplates()).toEqual({ data: [], recordsTotal: 0, recordsFiltered: 0 });
        expect(findWasteTemplatePage).not.toHaveBeenCalled();
    });
});
// Agrupación, costo, filtros y paginación se comprueban con SQL real en
// inventoryWriteConcurrencyDbTest.js (DP-PERF-001), sin reproducir el algoritmo en mocks.
