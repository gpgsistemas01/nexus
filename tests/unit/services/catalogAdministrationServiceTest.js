import { beforeEach, describe, expect, it, vi } from 'vitest';

const model = {
    count: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn()
};

vi.mock('../../../src/repository/baseRepository.js', () => ({
    getDb: () => ({ presentation: model })
}));

const {
    createCatalogEntry,
    deleteCatalogEntry,
    findAllCatalogEntries,
    updateCatalogEntry
} = await import('../../../src/services/catalogAdministrationService.js');

describe('catalogAdministrationService', () => {
    beforeEach(() => vi.clearAllMocks());

    it('lista el modelo configurado con el contrato de DataTables', async () => {
        model.findMany.mockResolvedValue([{ id: '1', name: 'Caja' }]);
        model.count.mockResolvedValueOnce(2).mockResolvedValueOnce(1);

        await expect(findAllCatalogEntries({ catalog: 'presentations', search: 'caja' })).resolves.toEqual({
            data: [{ id: '1', name: 'Caja' }],
            recordsTotal: 2,
            recordsFiltered: 1
        });
    });

    it('crea, actualiza y elimina mediante el modelo permitido', async () => {
        model.create.mockResolvedValue({ id: '1', name: 'Caja' });
        model.update.mockResolvedValue({ id: '1', name: 'Rollo' });
        model.delete.mockResolvedValue({ id: '1', name: 'Rollo' });

        await createCatalogEntry({ catalog: 'presentations', data: { name: 'Caja' } });
        await updateCatalogEntry({ catalog: 'presentations', id: '1', data: { name: 'Rollo' } });
        await deleteCatalogEntry({ catalog: 'presentations', id: '1' });

        expect(model.create).toHaveBeenCalledWith({ data: { name: 'Caja' } });
        expect(model.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { name: 'Rollo' } });
        expect(model.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it.each([
        ['P2002', 'CATALOG_ENTRY_ALREADY_EXISTS'],
        ['P2003', 'CATALOG_ENTRY_IN_USE'],
        ['P2025', 'CATALOG_ENTRY_NOT_FOUND']
    ])('traduce el error Prisma %s', async (prismaCode, expectedCode) => {
        model.delete.mockRejectedValue({ code: prismaCode });

        await expect(deleteCatalogEntry({ catalog: 'presentations', id: '1' }))
            .rejects.toMatchObject({ code: expectedCode });
    });
});
