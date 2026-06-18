import { beforeEach, describe, expect, it, vi } from 'vitest';

const roleFindMany = vi.fn();
const roleCount = vi.fn();

vi.mock('../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    role: {
      findMany: roleFindMany,
      count: roleCount
    }
  })
}));

const { findAllRoles } = await import('../../../src/services/admin/roleService.js');

describe('roleService GET operations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista roles con filtros y paginación', async () => {
    const roles = [{ id: 'role-1', name: 'Admin' }];
    roleFindMany.mockResolvedValue(roles);
    roleCount.mockResolvedValueOnce(2).mockResolvedValueOnce(1);

    await expect(findAllRoles({ search: 'adm', orderBy: 'name', orderDir: 'desc' })).resolves.toEqual({
      data: roles,
      recordsTotal: 2,
      recordsFiltered: 1
    });

    const expectedWhere = { name: { contains: 'adm', mode: 'insensitive' } };
    expect(roleFindMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: expectedWhere,
      orderBy: { name: 'desc' },
      select: { id: true, name: true }
    });
    expect(roleCount).toHaveBeenNthCalledWith(2, { where: expectedWhere });
  });
});
