import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

const hasGeneratedPrismaClient = existsSync(resolve('generated/prisma/client.ts'));
const describeDb = process.env.DATABASE_TEST_URL && hasGeneratedPrismaClient ? describe : describe.skip;

const testSuffix = Math.random().toString(36).slice(2, 8);
const names = {
  department: `IT Admin Department ${testSuffix}`,
  updatedDepartment: `IT Admin Department Updated ${testSuffix}`,
  role: `IT Admin Role ${testSuffix}`,
  profile: `Perfil integración ${testSuffix}`,
  updatedProfile: `Perfil integración actualizado ${testSuffix}`,
  user: `UsuarioIntegracion${testSuffix}`.slice(0, 50),
  updatedUser: `UsuarioEditado${testSuffix}`.slice(0, 50)
};

let prisma;
let services;
let department;
let updatedDepartment;
let role;

const cleanupAdminData = async () => {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { startsWith: 'UsuarioIntegracion' } },
        { name: { startsWith: 'UsuarioEditado' } }
      ]
    },
    select: { id: true }
  });
  const profiles = await prisma.profile.findMany({
    where: { fullName: { startsWith: 'Perfil integración' } },
    select: { id: true }
  });
  const roles = await prisma.role.findMany({
    where: { name: { startsWith: 'IT Admin Role ' } },
    select: { id: true }
  });
  const departments = await prisma.department.findMany({
    where: { name: { startsWith: 'IT Admin Department' } },
    select: { id: true }
  });

  await prisma.userRoleDepartment.deleteMany({
    where: {
      OR: [
        { userId: { in: users.map(({ id }) => id) } },
        { roleId: { in: roles.map(({ id }) => id) } },
        { departmentId: { in: departments.map(({ id }) => id) } }
      ]
    }
  });
  await prisma.user.deleteMany({ where: { id: { in: users.map(({ id }) => id) } } });
  await prisma.departmentProfile.deleteMany({
    where: {
      OR: [
        { profileId: { in: profiles.map(({ id }) => id) } },
        { departmentId: { in: departments.map(({ id }) => id) } }
      ]
    }
  });
  await prisma.profile.deleteMany({ where: { id: { in: profiles.map(({ id }) => id) } } });
  await prisma.role.deleteMany({ where: { id: { in: roles.map(({ id }) => id) } } });
  await prisma.department.deleteMany({ where: { id: { in: departments.map(({ id }) => id) } } });
};

describeDb('admin services database integration', () => {
  beforeAll(async () => {
    [{ prisma }, services] = await Promise.all([
      import('../../../src/lib/prisma.js'),
      Promise.all([
        import('../../../src/services/admin/profileService.js'),
        import('../../../src/services/admin/userService.js')
      ]).then(([profileService, userService]) => ({
        ...profileService,
        ...userService
      }))
    ]);

    await cleanupAdminData();

    [department, updatedDepartment, role] = await Promise.all([
      prisma.department.create({ data: { name: names.department } }),
      prisma.department.create({ data: { name: names.updatedDepartment } }),
      prisma.role.create({ data: { name: names.role } })
    ]);
  });

  it('guarda perfiles y usuarios con sus relaciones en la base de pruebas', async () => {
    const createdProfile = await services.createProfile({
      profileDto: {
        fullName: names.profile,
        departments: [department.id]
      }
    });

    expect(createdProfile).toMatchObject({ fullName: names.profile });
    expect(createdProfile.departments).toEqual([
      expect.objectContaining({ department: expect.objectContaining({ id: department.id, name: names.department }) })
    ]);

    const updatedProfile = await services.updateProfile({
      id: createdProfile.id,
      profileDto: {
        fullName: names.updatedProfile,
        departments: [updatedDepartment.id]
      }
    });

    expect(updatedProfile).toMatchObject({ id: createdProfile.id, fullName: names.updatedProfile });
    expect(updatedProfile.departments).toEqual([
      expect.objectContaining({ department: expect.objectContaining({ id: updatedDepartment.id, name: names.updatedDepartment }) })
    ]);

    const createdUser = await services.createUser({
      userDto: {
        name: names.user,
        password: 'A%54321',
        profileId: createdProfile.id,
        roleId: role.id,
        departmentId: updatedDepartment.id
      }
    });

    expect(createdUser).toEqual({
      id: expect.any(String),
      name: names.user,
      profileId: createdProfile.id
    });

    await expect(services.findAllUsers({ search: names.user })).resolves.toMatchObject({
      recordsFiltered: 1,
      data: [expect.objectContaining({
        id: createdUser.id,
        name: names.user,
        profileId: createdProfile.id,
        roleId: role.id,
        departmentId: updatedDepartment.id
      })]
    });

    await expect(services.updateUser({
      id: createdUser.id,
      userDto: {
        name: names.updatedUser,
        profileId: createdProfile.id,
        roleId: role.id,
        departmentId: department.id
      }
    })).resolves.toMatchObject({
      id: createdUser.id,
      name: names.updatedUser,
      profileId: createdProfile.id
    });

    await expect(services.updateUserPassword({
      id: createdUser.id,
      userDto: { password: 'B%54321' }
    })).resolves.toEqual({ id: createdUser.id });

    const storedAccess = await prisma.userRoleDepartment.findFirst({
      where: { userId: createdUser.id },
      select: { roleId: true, departmentId: true }
    });

    expect(storedAccess).toEqual({
      roleId: role.id,
      departmentId: department.id
    });
  });
});
