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
  person: `Persona integración ${testSuffix}`,
  updatedPerson: `Persona integración actualizado ${testSuffix}`,
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
  const persons = await prisma.person.findMany({
    where: { fullName: { startsWith: 'Persona integración' } },
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
  await prisma.personRoleDepartment.deleteMany({
    where: {
      OR: [
        { personId: { in: persons.map(({ id }) => id) } },
        { departmentId: { in: departments.map(({ id }) => id) } }
      ]
    }
  });
  await prisma.person.deleteMany({ where: { id: { in: persons.map(({ id }) => id) } } });
  await prisma.role.deleteMany({ where: { id: { in: roles.map(({ id }) => id) } } });
  await prisma.department.deleteMany({ where: { id: { in: departments.map(({ id }) => id) } } });
};

describeDb('admin services database integration', () => {
  beforeAll(async () => {
    [{ prisma }, services] = await Promise.all([
      import('../../../src/lib/prisma.js'),
      Promise.all([
        import('../../../src/services/admin/person/personService.js'),
        import('../../../src/services/admin/userService.js')
      ]).then(([personService, userService]) => ({
        ...personService,
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

  it('guarda personas y usuarios con sus relaciones en la base de pruebas', async () => {
    const createdPerson = await services.createPerson({
      personDto: {
        fullName: names.person,
        accesses: [{ roleId: role.id, departmentId: department.id }]
      }
    });

    expect(createdPerson).toMatchObject({ fullName: names.person });
    expect(createdPerson.accesses).toEqual([
      expect.objectContaining({
        department: expect.objectContaining({ id: department.id, name: names.department }),
        role: expect.objectContaining({ id: role.id, name: names.role })
      })
    ]);

    const updatedPerson = await services.updatePerson({
      id: createdPerson.id,
      personDto: {
        fullName: names.updatedPerson,
        accesses: [{ roleId: role.id, departmentId: updatedDepartment.id }]
      }
    });

    expect(updatedPerson).toMatchObject({ id: createdPerson.id, fullName: names.updatedPerson });
    expect(updatedPerson.accesses).toEqual([
      expect.objectContaining({
        department: expect.objectContaining({ id: updatedDepartment.id, name: names.updatedDepartment }),
        role: expect.objectContaining({ id: role.id, name: names.role })
      })
    ]);

    const createdUser = await services.createUser({
      userDto: {
        name: names.user,
        password: 'A%54321',
        personId: createdPerson.id,
        roleId: role.id,
        departmentId: updatedDepartment.id
      }
    });

    expect(createdUser).toEqual({
      id: expect.any(String),
      name: names.user,
      personId: createdPerson.id
    });

    await expect(services.findAllUsers({ search: names.user })).resolves.toMatchObject({
      recordsFiltered: 1,
      data: [expect.objectContaining({
        id: createdUser.id,
        name: names.user,
        personId: createdPerson.id,
        roleId: role.id,
        departmentId: updatedDepartment.id
      })]
    });

    await expect(services.updateUser({
      id: createdUser.id,
      userDto: {
        name: names.updatedUser,
        personId: createdPerson.id,
        roleId: role.id,
        departmentId: department.id
      }
    })).resolves.toMatchObject({
      id: createdUser.id,
      name: names.updatedUser,
      personId: createdPerson.id
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
