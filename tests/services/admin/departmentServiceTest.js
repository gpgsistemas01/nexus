import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DepartmentNotFound } from '../../../src/errors/admin/departmentError.js';

const departmentFindMany = vi.fn();
const departmentCount = vi.fn();
const departmentFindFirst = vi.fn();

vi.mock('../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    department: {
      findMany: departmentFindMany,
      count: departmentCount,
      findFirst: departmentFindFirst
    }
  })
}));

const { findAllDepartments, findDepartmentById } = await import('../../../src/services/admin/departmentService.js');

describe('departmentService GET operations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista departamentos con filtros y paginación', async () => {
    const departments = [{ id: 'department-1', name: 'Ventas' }];
    departmentFindMany.mockResolvedValue(departments);
    departmentCount.mockResolvedValueOnce(4).mockResolvedValueOnce(1);

    await expect(findAllDepartments({ search: 'ven', orderBy: 'name', orderDir: 'desc' })).resolves.toEqual({
      data: departments,
      recordsTotal: 4,
      recordsFiltered: 1
    });

    const expectedWhere = { name: { contains: 'ven', mode: 'insensitive' } };
    expect(departmentFindMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: expectedWhere,
      orderBy: { name: 'desc' },
      select: { id: true, name: true }
    });
    expect(departmentCount).toHaveBeenNthCalledWith(2, { where: expectedWhere });
  });

  it('obtiene departamento por id y falla si no existe', async () => {
    departmentFindFirst.mockResolvedValueOnce({ id: 'department-1', name: 'Ventas' }).mockResolvedValueOnce(null);

    await expect(findDepartmentById({ id: 'department-1' })).resolves.toEqual({ id: 'department-1', name: 'Ventas' });
    await expect(findDepartmentById({ id: 'missing-department' })).rejects.toThrow(DepartmentNotFound);
  });
});
