import { beforeEach, describe, expect, it, vi } from 'vitest';

const requests = vi.hoisted(() => ({
  getAll: vi.fn(),
  register: vi.fn(),
  edit: vi.fn()
}));

vi.mock('../../../../../../../src/public/js/services/admin/catalogService.js', () => ({
  getCatalogEntriesRequest: requests.getAll,
  createCatalogEntryRequest: requests.register,
  editCatalogEntryRequest: requests.edit
}));

const {
  editCatalogEntry,
  getCatalogEntries,
  registerCatalogEntry
} = await import('../../../../../../../src/public/js/application/admin/catalogs/catalogs.js');
const { createCatalogValidation } = await import(
  '../../../../../../../src/public/js/utils/validations/validators.js'
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('administración compartida de catálogos', () => {
  it('configura en la capa común las validaciones y el tipo de catálogo', () => {
    const validation = createCatalogValidation({
      entityLabel: 'unidad de medida',
      nameMaxLength: 20,
      symbolMaxLength: 10
    });

    expect(validation.name('x'.repeat(21))).toBe(
      'El nombre de unidad de medida no debe exceder los 20 caracteres'
    );
    expect(validation.symbol('')).toBe('El símbolo de unidad de medida es un valor requerido');
    expect(validation.symbol(undefined)).toBeNull();
  });

  it('conserva catálogo y parámetros de DataTable en el listado común', async () => {
    const response = { data: { data: [], recordsTotal: 0, recordsFiltered: 0 } };
    requests.getAll.mockResolvedValue(response);

    await expect(getCatalogEntries({ catalog: 'roles', draw: 1 })).resolves.toBe(response);
    expect(requests.getAll).toHaveBeenCalledWith({
      params: { catalog: 'roles', draw: 1 }
    });
  });

  it.each([
    ['crear', registerCatalogEntry, requests.register, { formData: { name: 'Operador' }, catalog: 'roles' }, { data: { name: 'Operador' }, catalog: 'roles' }, 'CREATED_CATALOG_ENTRY', '¡Entrada de catálogo creada exitosamente!'],
    ['editar', editCatalogEntry, requests.edit, { formData: { name: 'Supervisor' }, id: 'role-1', catalog: 'roles' }, { data: { name: 'Supervisor' }, id: 'role-1', catalog: 'roles' }, 'UPDATED_CATALOG_ENTRY', '¡Entrada de catálogo actualizada exitosamente!']
  ])('adapta la operación de %s mediante la fábrica CRUD', async (
    _case,
    operation,
    request,
    input,
    expected,
    code,
    message
  ) => {
    request.mockResolvedValue({ data: { data: input.formData, code } });

    await expect(operation(input)).resolves.toEqual({
      data: input.formData,
      message
    });
    expect(request).toHaveBeenCalledWith(expected);
  });
});
