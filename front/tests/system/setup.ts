import { randomUUID, createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { requireSystemTestDatabase } from './environment.js';
import { systemFixturePath } from './fixture.js';

const backendRequire = createRequire(new URL('../../../back/package.json', import.meta.url));

export default async () => {
  requireSystemTestDatabase();
  // Sólo el arnés Node importa Prisma; el cliente Vue y sus bundles no lo conocen.
  const { prisma } = await import(new URL('../../../back/src/lib/prisma.js', import.meta.url).href);
  const { ROLE_KEYS } = await import(
    new URL('../../../back/src/constants/roles.js', import.meta.url).href
  );
  const { DEPARTMENT_KEYS } = await import(
    new URL('../../../back/src/constants/departments.js', import.meta.url).href
  );
  const suffix = createHash('sha256').update(randomUUID()).digest('hex').slice(0, 8);
  const fixture = {
    userId: '',
    userName: `vue${suffix}`,
    excludedUser: `otro${suffix}`,
    password: `Prueba-${randomUUID()}`,
    clientName: `Cliente Vue ${suffix}`,
    excludedClient: `Cliente excluido ${suffix}`,
    supplierName: `Proveedor Vue ${suffix}`,
    excludedSupplier: `Proveedor excluido ${suffix}`,
  };
  const users: string[] = [];
  const suppliers: string[] = [];
  let excludedClientId: string | undefined;
  let createdRole = false;
  let createdDepartment = false;
  let roleId: string | undefined;
  let departmentId: string | undefined;
  const cleanup = async () => {
    await prisma.client.deleteMany({
      where: {
        OR: [{ name: fixture.clientName }, ...(excludedClientId ? [{ id: excludedClientId }] : [])],
      },
    });
    await prisma.supplier.deleteMany({ where: { id: { in: suppliers } } });
    await prisma.criticalWriteAudit.deleteMany({ where: { actorId: { in: users } } });
    await prisma.userRoleDepartment.deleteMany({ where: { userId: { in: users } } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
    if (createdRole) await prisma.role.delete({ where: { id: roleId } });
    if (createdDepartment) await prisma.department.delete({ where: { id: departmentId } });
    await prisma.$disconnect();
    await rm(systemFixturePath, { force: true });
  };
  try {
    let role = await prisma.role.findUnique({ where: { key: ROLE_KEYS.SYSTEM_ADMIN } });
    if (!role) {
      role = await prisma.role.create({
        data: { name: 'Administrador del sistema', key: ROLE_KEYS.SYSTEM_ADMIN },
      });
      createdRole = true;
    }
    roleId = role.id;
    let department = await prisma.department.findUnique({
      where: { key: DEPARTMENT_KEYS.SYSTEMS },
    });
    if (!department) {
      department = await prisma.department.create({
        data: { name: 'SISTEMAS', key: DEPARTMENT_KEYS.SYSTEMS },
      });
      createdDepartment = true;
    }
    departmentId = department.id;
    const password = await backendRequire('bcrypt').hash(fixture.password, 4);
    const user = await prisma.user.create({
      data: { name: fixture.userName, password, accesses: { create: { roleId, departmentId } } },
    });
    fixture.userId = user.id;
    users.push(user.id);
    users.push((await prisma.user.create({ data: { name: fixture.excludedUser, password } })).id);
    excludedClientId = (await prisma.client.create({ data: { name: fixture.excludedClient } })).id;
    for (const [index, name] of [fixture.supplierName, fixture.excludedSupplier].entries())
      suppliers.push(
        (
          await prisma.supplier.create({
            data: {
              codeNumber: index + 1,
              code: `${suffix}${index}`,
              legalName: name,
              tradeName: name,
            },
          })
        ).id,
      );
    await mkdir(new URL('.', systemFixturePath), { recursive: true });
    await writeFile(systemFixturePath, JSON.stringify(fixture));
    return cleanup;
  } catch (error) {
    await cleanup();
    throw error;
  }
};
