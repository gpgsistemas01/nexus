import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserCreateDatabaseError, UserNotFound, UserUpdateDatabaseError } from '../../../src/errors/admin/userError.js';

const userCreate = vi.fn();
const userFindUnique = vi.fn();
const userUpdate = vi.fn();
const userFindMany = vi.fn();
const userCount = vi.fn();
const userRoleDepartmentFindMany = vi.fn();
const txUserUpdate = vi.fn();
const userRoleDepartmentDeleteMany = vi.fn();
const userRoleDepartmentCreate = vi.fn();
const transaction = vi.fn(async (callback) => callback({
  user: { update: txUserUpdate },
  userRoleDepartment: {
    deleteMany: userRoleDepartmentDeleteMany,
    create: userRoleDepartmentCreate
  }
}));

vi.mock('../../../src/utils/encryptionUtils.js', () => ({
  encryptPassword: vi.fn(async (password) => `hashed:${password}`),
  verifyPassword: vi.fn(async (password, hash) => password === `valid:${hash}`)
}));

vi.mock('../../../src/utils/logger.js', () => ({
  createServiceLogger: () => ({}),
  logServiceError: vi.fn()
}));

vi.mock('../../../src/repository/baseRepository.js', () => ({
  getDb: () => ({
    $transaction: transaction,
    user: {
      create: userCreate,
      findUnique: userFindUnique,
      update: userUpdate,
      findMany: userFindMany,
      count: userCount
    },
    userRoleDepartment: {
      findMany: userRoleDepartmentFindMany
    }
  })
}));

const {
  createUser,
  findAllUsers,
  getLoggedUser,
  getUserIdByLogin,
  updateUser,
  updateUserPassword
} = await import('../../../src/services/admin/userService.js');

describe('userService submit operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (callback) => callback({
      user: { update: txUserUpdate },
      userRoleDepartment: {
        deleteMany: userRoleDepartmentDeleteMany,
        create: userRoleDepartmentCreate
      }
    }));
  });

  it('lista usuarios para GET y normaliza el primer acceso', async () => {
    userFindMany.mockResolvedValue([
      {
        id: 'user-1',
        name: 'usuario',
        profileId: 'profile-1',
        profile: { fullName: 'Perfil Uno' },
        accesses: [{
          roleId: 'role-1',
          departmentId: 'department-1',
          role: { name: 'Admin' },
          department: { name: 'Ventas' }
        }]
      }
    ]);
    userCount.mockResolvedValueOnce(3).mockResolvedValueOnce(1);

    await expect(findAllUsers({ search: 'usu', orderBy: 'name', orderDir: 'desc' })).resolves.toEqual({
      data: [{
        id: 'user-1',
        name: 'usuario',
        profileId: 'profile-1',
        profile: { fullName: 'Perfil Uno' },
        accesses: [{
          roleId: 'role-1',
          departmentId: 'department-1',
          role: { name: 'Admin' },
          department: { name: 'Ventas' }
        }],
        roleId: 'role-1',
        roleName: 'Admin',
        departmentId: 'department-1',
        departmentName: 'Ventas'
      }],
      recordsTotal: 3,
      recordsFiltered: 1
    });

    expect(userFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { isActive: true, name: { contains: 'usu', mode: 'insensitive' } },
      orderBy: { name: 'desc' }
    }));
  });

  it('resuelve login y usuario autenticado para GET/session', async () => {
    userFindUnique.mockResolvedValue({ id: 'user-1', password: 'hash' });
    userRoleDepartmentFindMany.mockResolvedValue([
      {
        user: { id: 'user-1', name: 'usuario' },
        role: { id: 'role-1', name: 'Admin' },
        department: { id: 'department-1', name: 'Ventas' }
      }
    ]);

    await expect(getUserIdByLogin('usuario', 'valid:hash')).resolves.toBe('user-1');
    await expect(getLoggedUser('user-1')).resolves.toEqual({
      id: 'user-1',
      name: 'usuario',
      accesses: [{
        roleId: 'role-1',
        role: 'Admin',
        departmentId: 'department-1',
        department: 'Ventas'
      }]
    });
  });

  it('retorna null cuando login o usuario autenticado no tienen datos', async () => {
    userFindUnique.mockResolvedValue(null);
    userRoleDepartmentFindMany.mockResolvedValue([]);

    await expect(getUserIdByLogin('usuario', 'password')).resolves.toBeNull();
    await expect(getLoggedUser('user-1')).resolves.toBeNull();
  });

  it('crea usuarios con contraseña encriptada y acceso inicial', async () => {
    const userDto = {
      name: 'usuario',
      password: 'secret',
      profileId: 'profile-1',
      roleId: 'role-1',
      departmentId: 'department-1'
    };
    const createdUser = { id: 'user-1', name: 'usuario', profileId: 'profile-1' };

    userCreate.mockResolvedValue(createdUser);

    await expect(createUser({ userDto })).resolves.toEqual(createdUser);
    expect(userCreate).toHaveBeenCalledWith({
      data: {
        name: 'usuario',
        password: 'hashed:secret',
        profile: { connect: { id: 'profile-1' } },
        accesses: {
          create: {
            role: { connect: { id: 'role-1' } },
            department: { connect: { id: 'department-1' } }
          }
        }
      },
      select: {
        id: true,
        name: true,
        profileId: true
      }
    });
  });

  it('envuelve errores de creación en UserCreateDatabaseError', async () => {
    userCreate.mockRejectedValue(new Error('db failed'));

    await expect(createUser({ userDto: { name: 'usuario', password: 'secret' } })).rejects.toThrow(UserCreateDatabaseError);
  });

  it('actualiza usuario y reemplaza su acceso en transacción', async () => {
    const userDto = {
      name: 'usuario-editado',
      profileId: 'profile-2',
      roleId: 'role-2',
      departmentId: 'department-2'
    };
    const updatedUser = { id: 'user-1', name: 'usuario-editado', profileId: 'profile-2' };

    userFindUnique.mockResolvedValue({ id: 'user-1' });
    txUserUpdate.mockResolvedValue(updatedUser);

    await expect(updateUser({ id: 'user-1', userDto })).resolves.toEqual(updatedUser);
    expect(userRoleDepartmentDeleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(userRoleDepartmentCreate).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        roleId: 'role-2',
        departmentId: 'department-2'
      }
    });
  });

  it('falla con UserNotFound al actualizar usuario inexistente', async () => {
    userFindUnique.mockResolvedValue(null);

    await expect(updateUser({ id: 'missing-user', userDto: { name: 'usuario' } })).rejects.toThrow(UserNotFound);
    expect(transaction).not.toHaveBeenCalled();
  });

  it('actualiza contraseña con hash', async () => {
    userFindUnique.mockResolvedValue({ id: 'user-1' });
    userUpdate.mockResolvedValue({ id: 'user-1' });

    await expect(updateUserPassword({ id: 'user-1', userDto: { password: 'new-secret' } })).resolves.toEqual({ id: 'user-1' });
    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { password: 'hashed:new-secret' },
      select: { id: true }
    });
  });

  it('envuelve errores de actualización en UserUpdateDatabaseError', async () => {
    userFindUnique.mockResolvedValue({ id: 'user-1' });
    transaction.mockRejectedValue(new Error('db failed'));

    await expect(updateUser({ id: 'user-1', userDto: { name: 'usuario' } })).rejects.toThrow(UserUpdateDatabaseError);
  });
});
