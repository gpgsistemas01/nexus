import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProfileCreateDatabaseError, ProfileUpdateDatabaseError } from '../../../src/errors/admin/profileError.js';

const profileCreate = vi.fn();
const profileUpdate = vi.fn();
const profileFindUnique = vi.fn();
const profileFindMany = vi.fn();
const profileFindFirst = vi.fn();
const profileCount = vi.fn();
const departmentProfileCreateMany = vi.fn();
const departmentProfileDeleteMany = vi.fn();
const transaction = vi.fn(async (callback) => callback({
  profile: {
    create: profileCreate,
    update: profileUpdate,
    findUnique: profileFindUnique,
    findMany: profileFindMany,
    findFirst: profileFindFirst,
    count: profileCount
  },
  departmentProfile: {
    createMany: departmentProfileCreateMany,
    deleteMany: departmentProfileDeleteMany
  }
}));

vi.mock('../../../src/utils/logger.js', () => ({
  createServiceLogger: () => ({}),
  logServiceError: vi.fn()
}));

vi.mock('../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    $transaction: transaction,
    profile: {
      findUnique: profileFindUnique,
      findMany: profileFindMany,
      findFirst: profileFindFirst,
      count: profileCount
    }
  })
}));

const {
  createProfile,
  findAllProfiles,
  findProfileByUserId,
  updateProfile
} = await import('../../../src/services/admin/profileService.js');

describe('profileService submit operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (callback) => callback({
      profile: {
        create: profileCreate,
        update: profileUpdate,
        findUnique: profileFindUnique,
        findMany: profileFindMany,
        findFirst: profileFindFirst,
        count: profileCount
      },
      departmentProfile: {
        createMany: departmentProfileCreateMany,
        deleteMany: departmentProfileDeleteMany
      }
    }));
  });

  it('lista perfiles para GET con departamentos normalizados', async () => {
    profileFindMany.mockResolvedValue([
      {
        id: 'profile-1',
        fullName: 'Perfil Uno',
        departments: [{ department: { id: 'department-1', name: 'Ventas' } }]
      }
    ]);
    profileCount.mockResolvedValueOnce(5).mockResolvedValueOnce(1);

    await expect(findAllProfiles({
      departments: ['Ventas'],
      includeDepartments: true,
      search: 'perfil',
      orderBy: 'fullName',
      orderDir: 'desc'
    })).resolves.toEqual({
      data: [{ id: 'profile-1', fullName: 'Perfil Uno', departments: [{ id: 'department-1', name: 'Ventas' }] }],
      recordsTotal: 5,
      recordsFiltered: 1
    });

    expect(profileFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        isActive: true,
        fullName: { contains: 'perfil', mode: 'insensitive' }
      }),
      orderBy: { fullName: 'desc' }
    }));
  });

  it('obtiene el perfil activo asociado a un usuario para GET', async () => {
    profileFindFirst.mockResolvedValue({ id: 'profile-1' });

    await expect(findProfileByUserId({ userId: 'user-1' })).resolves.toBe('profile-1');
    expect(profileFindFirst).toHaveBeenCalledWith({
      where: {
        isActive: true,
        users: { some: { id: 'user-1' } }
      },
      select: { id: true }
    });
  });

  it('crea perfiles y relaciona departamentos enviados por submit', async () => {
    const profileDto = { fullName: 'Perfil Uno', departments: ['department-1', 'department-2'] };
    const createdProfile = { id: 'profile-1', fullName: 'Perfil Uno' };
    const profileWithDepartments = { ...createdProfile, departments: [] };

    profileCreate.mockResolvedValue(createdProfile);
    profileFindUnique.mockResolvedValue(profileWithDepartments);

    await expect(createProfile({ profileDto })).resolves.toEqual(profileWithDepartments);
    expect(profileCreate).toHaveBeenCalledWith({ data: { fullName: 'Perfil Uno' } });
    expect(departmentProfileCreateMany).toHaveBeenCalledWith({
      data: [
        { profileId: 'profile-1', departmentId: 'department-1' },
        { profileId: 'profile-1', departmentId: 'department-2' }
      ]
    });
  });

  it('crea perfiles sin relaciones cuando no se envían departamentos', async () => {
    const createdProfile = { id: 'profile-1', fullName: 'Perfil Uno' };

    profileCreate.mockResolvedValue(createdProfile);
    profileFindUnique.mockResolvedValue(createdProfile);

    await expect(createProfile({ profileDto: { fullName: 'Perfil Uno', departments: [] } })).resolves.toEqual(createdProfile);
    expect(departmentProfileCreateMany).not.toHaveBeenCalled();
  });

  it('envuelve errores de creación en ProfileCreateDatabaseError', async () => {
    transaction.mockRejectedValue(new Error('db failed'));

    await expect(createProfile({ profileDto: { fullName: 'Perfil Uno' } })).rejects.toThrow(ProfileCreateDatabaseError);
  });

  it('actualiza perfil, limpia relaciones anteriores y crea las nuevas', async () => {
    const profileDto = { fullName: 'Perfil Editado', departments: ['department-3'] };
    const updatedProfile = { id: 'profile-1', fullName: 'Perfil Editado', departments: [] };

    profileFindUnique.mockResolvedValueOnce({ id: 'profile-1', fullName: 'Perfil Uno' });
    profileFindUnique.mockResolvedValueOnce(updatedProfile);

    await expect(updateProfile({ id: 'profile-1', profileDto })).resolves.toEqual(updatedProfile);
    expect(profileUpdate).toHaveBeenCalledWith({
      where: { id: 'profile-1' },
      data: { fullName: 'Perfil Editado' }
    });
    expect(departmentProfileDeleteMany).toHaveBeenCalledWith({ where: { profileId: 'profile-1' } });
    expect(departmentProfileCreateMany).toHaveBeenCalledWith({
      data: [{ profileId: 'profile-1', departmentId: 'department-3' }]
    });
  });

  it('envuelve errores de actualización en ProfileUpdateDatabaseError', async () => {
    profileFindUnique.mockResolvedValue({ id: 'profile-1', fullName: 'Perfil Uno' });
    transaction.mockRejectedValue(new Error('db failed'));

    await expect(updateProfile({ id: 'profile-1', profileDto: { fullName: 'Perfil' } })).rejects.toThrow(ProfileUpdateDatabaseError);
  });
});
