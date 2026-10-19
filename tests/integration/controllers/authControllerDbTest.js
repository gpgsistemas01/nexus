import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';
import { ROLE_KEYS } from '../../../src/constants/roles.js';
import { DEPARTMENT_KEYS } from '../../../src/constants/departments.js';

let app;
let prisma;
let user;
let previousAccessSecret;
let previousRefreshSecret;
const suffix = randomUUID().slice(0, 8);
const name = `itlogin${suffix}`;
const password = 'AccessTest1';

describe('captura de acceso separada del rechazo de credenciales', () => {
  beforeAll(async () => {
    previousAccessSecret = process.env.JWT_SECRET_ACCESS;
    previousRefreshSecret = process.env.JWT_SECRET_REFRESH;
    process.env.JWT_SECRET_ACCESS = randomUUID();
    process.env.JWT_SECRET_REFRESH = randomUUID();
    ({ prisma } = await import('../../../src/lib/prisma.js'));
    const { default: router } = await import('../../../src/routes/api/authApiRoute.js');
    const role = await prisma.role.upsert({
      where: { name: 'Administrador del sistema' }, update: {},
      create: { name: 'Administrador del sistema', key: ROLE_KEYS.SYSTEM_ADMIN }
    });
    const department = await prisma.department.upsert({
      where: { name: 'SISTEMAS' }, update: {}, create: { name: 'SISTEMAS', key: DEPARTMENT_KEYS.SYSTEMS }
    });
    user = await prisma.user.create({ data: {
      name, password: await bcrypt.hash(password, 4),
      accesses: { create: { roleId: role.id, departmentId: department.id } }
    } });
    app = createControllerTestApp({ registerRoutes: server => server.use('/api/auth', router) });
  });

  afterAll(async () => {
    if (user) {
      await prisma.userRoleDepartment.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    if (previousAccessSecret === undefined) delete process.env.JWT_SECRET_ACCESS;
    else process.env.JWT_SECRET_ACCESS = previousAccessSecret;
    if (previousRefreshSecret === undefined) delete process.env.JWT_SECRET_REFRESH;
    else process.env.JWT_SECRET_REFRESH = previousRefreshSecret;
  });

  it('devuelve 400 por campo para una captura inválida sin establecer sesión ni modificar la cuenta', async () => {
    const response = await request(app).post('/api/auth/login').send({ name: '', password }).expect(400);

    expect(response.body).toMatchObject({ code: 'VALIDATION_ERROR', errors: { name: { code: 'USERNAME_REQUIRED' } } });
    expect(response.headers['set-cookie']).toBeUndefined();
    expect(await prisma.user.findUnique({ where: { id: user.id } })).toEqual(user);
  });

  it('el servicio responde el mismo 401 para usuario inexistente y contraseña incorrecta', async () => {
    const unknown = await request(app).post('/api/auth/login').send({ name: `missing${suffix}`, password }).expect(401);
    const wrong = await request(app).post('/api/auth/login').send({ name, password: 'WrongPass1' }).expect(401);

    expect(unknown.body).toEqual(wrong.body);
    expect(wrong.body).toMatchObject({ code: 'LOGIN_ERROR', message: 'Usuario o contraseña incorrectos.' });
    expect(wrong.body).not.toHaveProperty('errors');
    expect(wrong.headers['set-cookie']).toBeUndefined();
    expect(unknown.headers['set-cookie']).toBeUndefined();
    expect(await prisma.user.findUnique({ where: { id: user.id } })).toEqual(user);
  });

  it('conserva el acceso válido y sus cookies sin modificar la cuenta', async () => {
    const response = await request(app).post('/api/auth/login').send({ name, password }).expect(200);

    expect(response.body).toMatchObject({ code: 'SUCCESS_LOGIN' });
    expect(response.headers['set-cookie']).toHaveLength(2);
    expect(await prisma.user.findUnique({ where: { id: user.id } })).toEqual(user);
  });
});
