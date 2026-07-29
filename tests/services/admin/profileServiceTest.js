import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProfileCreateDatabaseError, ProfileUpdateDatabaseError } from '../../../src/errors/admin/profileError.js';

const profileCreate = vi.fn();
const profileUpdate = vi.fn();
const profileFindUnique = vi.fn();
const profileFindMany = vi.fn();
const profileCount = vi.fn();

vi.mock('../../../src/utils/logger.js', () => ({
  createServiceLogger: () => ({}),
  logServiceError: vi.fn()
}));

vi.mock('../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    profile: {
      create: profileCreate,
      update: profileUpdate,
      findUnique: profileFindUnique,
      findMany: profileFindMany,
      count: profileCount
    }
  })
}));

const {
  createProfile,
  findAllProfiles,
  findProfileById,
  updateProfile
} = await import('../../../src/services/admin/profile/profileService.js');

describe('profileService submit operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista perfiles para GET con departamentos normalizados', async () => {
    profileFindMany.mockResolvedValue([
      {
        id: 'profile-1',
        fullName: 'Perfil Uno',
        accesses: [{
          department: { id: 'department-1', name: 'Ventas' },
          role: { id: 'role-1', name: 'Coordinador' }
        }]
      }
    ]);
    profileCount.mockResolvedValueOnce(5).mockResolvedValueOnce(1);

    await expect(findAllProfiles({
      departments: ['Ventas'],
      roles: ['Coordinador'],
      includeDepartments: true,
      search: 'perfil',
      orderBy: 'fullName',
      orderDir: 'desc'
    })).resolves.toEqual({
      data: [{
        id: 'profile-1',
        fullName: 'Perfil Uno',
        departments: [{ id: 'department-1', name: 'Ventas' }],
        roleId: 'role-1',
        roleName: 'Coordinador'
      }],
      recordsTotal: 5,
      recordsFiltered: 1
    });

    expect(profileFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        isActive: true,
        fullName: { contains: 'perfil', mode: 'insensitive' },
        accesses: {
          some: {
            department: { name: { in: ['Ventas'] } },
            role: { name: { in: ['Coordinador'] } }
          }
        }
      }),
      orderBy: { fullName: 'desc' }
    }));
  });

  it('incluye accesos solamente cuando se solicitan al buscar por id', async () => {
    profileFindUnique.mockResolvedValue({ id: 'profile-1' });

    await findProfileById({ id: 'profile-1' });
    await findProfileById({ id: 'profile-1', includeAccesses: true });

    expect(profileFindUnique.mock.calls[0][0].select).toEqual({ id: true, fullName: true });
    expect(profileFindUnique.mock.calls[1][0].select).toEqual({
      id: true,
      fullName: true,
      accesses: { select: { department: true, role: true } }
    });
  });

  it('crea perfiles y relaciona departamentos enviados por submit', async () => {
    const profileDto = { fullName: 'Perfil Uno', roleId: 'role-1', departments: ['department-1', 'department-2'] };
    const profileWithAccesses = { id: 'profile-1', fullName: 'Perfil Uno', accesses: [] };

    profileCreate.mockResolvedValue(profileWithAccesses);

    await expect(createProfile({ profileDto })).resolves.toEqual(profileWithAccesses);
    expect(profileCreate).toHaveBeenCalledWith({
      data: {
        fullName: 'Perfil Uno',
        accesses: {
          createMany: {
            data: [
              { roleId: 'role-1', departmentId: 'department-1' },
              { roleId: 'role-1', departmentId: 'department-2' }
            ]
          }
        }
      },
      select: expect.any(Object)
    });
  });

  it('crea perfiles sin relaciones cuando no se envían departamentos', async () => {
    const createdProfile = { id: 'profile-1', fullName: 'Perfil Uno' };

    profileCreate.mockResolvedValue(createdProfile);

    await expect(createProfile({ profileDto: { fullName: 'Perfil Uno', departments: [] } })).resolves.toEqual(createdProfile);
    expect(profileCreate).toHaveBeenCalledWith({
      data: { fullName: 'Perfil Uno' },
      select: expect.any(Object)
    });
  });

  it('envuelve errores de creación en ProfileCreateDatabaseError', async () => {
    profileCreate.mockRejectedValue(new Error('db failed'));

    await expect(createProfile({ profileDto: { fullName: 'Perfil Uno' } })).rejects.toThrow(ProfileCreateDatabaseError);
  });

  it('actualiza perfil, limpia relaciones anteriores y crea las nuevas', async () => {
    const profileDto = { fullName: 'Perfil Editado', roleId: 'role-2', departments: ['department-3'] };
    const updatedProfile = { id: 'profile-1', fullName: 'Perfil Editado', accesses: [] };

    profileUpdate.mockResolvedValue(updatedProfile);

    await expect(updateProfile({ id: 'profile-1', profileDto })).resolves.toEqual(updatedProfile);
    expect(profileUpdate).toHaveBeenCalledWith({
      where: { id: 'profile-1' },
      data: {
        fullName: 'Perfil Editado',
        accesses: {
          deleteMany: {},
          createMany: {
            data: [{ roleId: 'role-2', departmentId: 'department-3' }]
          }
        }
      },
      select: expect.any(Object)
    });
  });

  it('envuelve errores de actualización en ProfileUpdateDatabaseError', async () => {
    profileUpdate.mockRejectedValue(new Error('db failed'));

    await expect(updateProfile({ id: 'profile-1', profileDto: { fullName: 'Perfil' } })).rejects.toThrow(ProfileUpdateDatabaseError);
  });
});
