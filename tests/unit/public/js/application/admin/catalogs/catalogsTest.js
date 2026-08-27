import { beforeEach, describe, expect, it, vi } from 'vitest';

const requests = vi.hoisted(() => ({
  departments: vi.fn(),
  roles: vi.fn()
}));

vi.mock('../../../../../../../src/public/js/services/admin/departmentService.js', () => ({
  getAllDepartmentsRequest: requests.departments
}));
vi.mock('../../../../../../../src/public/js/services/admin/roleService.js', () => ({
  getAllRolesRequest: requests.roles
}));

const { getAllDepartments } = await import(
  '../../../../../../../src/public/js/application/admin/catalogs/departments.js'
);
const { getAllRoles } = await import(
  '../../../../../../../src/public/js/application/admin/catalogs/roles.js'
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('lectura de catálogos administrativos en la capa de aplicación', () => {
  it.each([
    ['departamentos', getAllDepartments, requests.departments],
    ['roles', getAllRoles, requests.roles]
  ])('conserva el contrato de listado de %s', async (_catalog, getAll, request) => {
    const response = { data: { data: [{ id: 'catalog-1' }] } };
    request.mockResolvedValue(response);

    await expect(getAll({ search: 'ventas' })).resolves.toBe(response);
    expect(request).toHaveBeenCalledWith({ params: { search: 'ventas' } });
  });
});
