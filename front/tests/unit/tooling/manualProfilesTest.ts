import { mkdtemp, rm, writeFile, readFile, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, expect, it } from 'vitest';
import {
  DEMO_PROFILES,
  demoSession,
  readAccounts,
  readCredentials,
  verifyConfiguredAccess,
} from '../../../scripts/manual/profiles.mjs';
import { filterManualContent, selectedChapters } from '../../../scripts/manual/model.mjs';
import { prepareManual, loadManualPublication } from '../../../scripts/manual/publication.mjs';
import { APP_NAVIGATION_GROUPS } from '../../../src/app/navigation.js';

const temporary: string[] = [];
afterEach(async () => {
  await Promise.all(temporary.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});
const tempRoot = async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'nexus-manual-'));
  temporary.push(root);
  return root;
};

it('define seis áreas operativas con Instalador en Instalaciones y Operador en las otras cinco', async () => {
  expect(DEMO_PROFILES).toHaveLength(15);
  expect(DEMO_PROFILES.filter((profile) => profile.departmentKey === 'router')).toHaveLength(2);
  expect(
    DEMO_PROFILES.filter((profile) => profile.departmentKey === 'workshop_3d').map(
      (profile) => profile.label,
    ),
  ).toEqual(['Taller/Herrería · Coordinador', 'Taller/Herrería · Operador']);
  expect(DEMO_PROFILES.filter((profile) => profile.departmentKey === 'installations')).toEqual([
    expect.objectContaining({
      id: 'instalaciones-coordinador',
      label: 'Instalaciones · Coordinador',
      roleKey: 'coordinator',
    }),
    expect.objectContaining({
      id: 'instalaciones-instalador',
      label: 'Instalaciones · Instalador',
      roleKey: 'installer',
    }),
  ]);
  const { accounts } = await readAccounts(path.resolve('manual.accounts.example.json'));
  const installerAccount = accounts.find(
    ({ id }: { id: string }) => id === 'instalaciones-instalador',
  );
  expect(installerAccount?.expectedAccess).toEqual({
    roleKey: 'installer',
    departmentKey: 'installations',
  });
  expect(() =>
    verifyConfiguredAccess(installerAccount!, {
      accesses: [{ roleKey: 'operator', departmentKey: 'installations' }],
    }),
  ).toThrow('no coincide');
});

it.each(
  DEMO_PROFILES.filter(
    (profile) => !['systems', 'warehouse_and_supply'].includes(profile.departmentKey),
  ),
)(
  '$id limita las lecciones y el menú a Almacén y Salidas, sin operaciones de entrega',
  async (profile) => {
    const session = demoSession(profile);
    const groups = APP_NAVIGATION_GROUPS.filter(({ links }) =>
      links.some(({ permission }) => session.permissions.includes(permission)),
    ).map(({ id }) => id);
    expect(groups).toEqual(['warehouse', 'issues']);
    expect(selectedChapters(session.permissions).map(({ file }) => file)).not.toContain(
      '14-reports.md',
    );
    expect(selectedChapters(session.permissions).map(({ file }) => file)).toContain(
      '16-glossary.md',
    );
    const glossary = filterManualContent(
      await readFile(path.resolve('docs/user-manual/16-glossary.md'), 'utf8'),
      session.permissions,
    );
    expect(glossary).toContain('Estado de cumplimiento');
    expect(glossary).toContain('Almacén registra la devolución');
    expect(glossary).not.toContain('### Referencias para surtir o devolver');
    expect(glossary).not.toContain('## Compras');
    expect(glossary).not.toContain('### Costos');
    for (const filename of [
      '03-materials.md',
      '04-consumables.md',
      '05-wastes.md',
      '12-issues.md',
    ]) {
      const content = filterManualContent(
        await readFile(path.resolve('docs/user-manual', filename), 'utf8'),
        session.permissions,
      );
      expect(content).not.toMatch(
        /## (Ajustar el saldo|Surtir|Devolver una entrega|Registrar una merma|Registrar un material)/,
      );
      expect(content).not.toContain('24-issue-supply.png');
      expect(content).not.toContain('25-issue-return.png');
      expect(content).not.toContain('utilice la devolución');
      expect(content).not.toContain('Cuando aparezca **Registrar cliente**');
    }
  },
);

it('Almacén conserva surtido y devolución, mientras sólo administración recibe ajustes y usuarios', async () => {
  const warehouse = demoSession(DEMO_PROFILES.find(({ id }) => id === 'almacen-auxiliar')!);
  const admin = demoSession(DEMO_PROFILES[0]!);
  const issues = await readFile(path.resolve('docs/user-manual/12-issues.md'), 'utf8');
  expect(filterManualContent(issues, warehouse.permissions)).toContain('## Devolver una entrega');
  const glossary = await readFile(path.resolve('docs/user-manual/16-glossary.md'), 'utf8');
  expect(filterManualContent(glossary, warehouse.permissions)).toContain(
    '### Referencias para surtir o devolver',
  );
  expect(filterManualContent(glossary, warehouse.permissions)).not.toContain('el saldo queda en 3');
  expect(filterManualContent(glossary, admin.permissions)).toContain('el saldo queda en 3');
  expect(warehouse.permissions).not.toContain('materials:adjust-stock');
  expect(selectedChapters(warehouse.permissions).map(({ file }) => file)).not.toContain(
    '08-users.md',
  );
  expect(admin.permissions).toContain('materials:adjust-stock');
  expect(selectedChapters(admin.permissions)).toHaveLength(17);
});

it.each(['almacen-auxiliar', 'almacen-coordinador', 'impresion-operador'])(
  'el índice de %s explica el alcance de consulta y registro en Salidas',
  async (id) => {
    const root = await tempRoot();
    const profile = DEMO_PROFILES.find((candidate) => candidate.id === id)!;
    await cp(path.resolve('docs/user-manual'), path.join(root, 'docs/user-manual'), {
      recursive: true,
    });
    const manifest = await prepareManual(root, { ...profile, mode: 'demo' }, demoSession(profile));
    const index = await readFile(path.join(manifest.root, 'sources/index.md'), 'utf8');
    expect(index).toContain('Materiales, Consumibles y Mermas');
    expect(index).toContain(
      id.startsWith('almacen-')
        ? 'puede consultar y registrar documentos para todas las áreas'
        : 'sólo puede consultar y registrar solicitudes para las áreas asignadas',
    );
  },
);

it('evalúa condiciones anidadas y rechaza directivas desconocidas o desbalanceadas', () => {
  const source =
    'base\n<!-- manual:any materials:read -->\nlectura\n<!-- manual:all materials:write -->\nescritura\n<!-- manual:end -->\n<!-- manual:end -->';
  expect(filterManualContent(source, ['materials:read'])).toBe('base\nlectura');
  expect(() => filterManualContent('<!-- manual:any unknown:grant -->', [])).toThrow('desconocido');
  expect(() => filterManualContent('<!-- manual:end -->', [])).toThrow('sin apertura');
  expect(() => filterManualContent('<!-- manual:any materials:read -->', [])).toThrow('sin cerrar');
});

it('carga secretos desde variables o archivo local, sin incluir valores en errores', async () => {
  const account = {
    id: 'almacen',
    usernameEnv: 'DOCS_FRONT_USER',
    passwordEnv: 'DOCS_FRONT_PASSWORD',
  };
  const root = await tempRoot();
  const filename = path.join(root, 'credentials.local');
  await writeFile(filename, 'DOCS_FRONT_USER=demo\nDOCS_FRONT_PASSWORD=" clave de prueba "\n');
  expect(await readCredentials(account, filename, {})).toEqual({
    name: 'demo',
    password: ' clave de prueba ',
  });
  expect(
    await readCredentials(account, path.join(root, 'absent'), {
      DOCS_FRONT_USER: 'env',
      DOCS_FRONT_PASSWORD: 'fixture',
    }),
  ).toEqual({ name: 'env', password: 'fixture' });
  await expect(readCredentials(account, filename, { DOCS_FRONT_PASSWORD: '' })).rejects.toThrow(
    'DOCS_FRONT_PASSWORD',
  );
});

it('rechaza credenciales en URL o configuración y perfiles duplicados', async () => {
  const root = await tempRoot();
  const filename = path.join(root, 'accounts.json');
  const account = {
    id: 'auxiliar',
    label: 'Almacén',
    usernameEnv: 'DOCS_FRONT_USER',
    passwordEnv: 'DOCS_FRONT_PASSWORD',
  };
  for (const data of [
    { baseUrl: 'http://example.com', accounts: [account] },
    { baseUrl: 'https://user:fixture@example.com', accounts: [account] },
    { baseUrl: 'http://localhost:5173', accounts: [account, account] },
    { baseUrl: 'http://localhost:5173', accounts: [{ ...account, password: 'fixture' }] },
  ]) {
    await writeFile(filename, JSON.stringify(data));
    await expect(readAccounts(filename)).rejects.toThrow();
  }
});

it('comprueba el rol y área esperados en la misma asignación de la cuenta', () => {
  const account = {
    id: 'router-operador',
    expectedAccess: { roleKey: 'operator', departmentKey: 'router' },
  };
  expect(() =>
    verifyConfiguredAccess(account, {
      accesses: [{ roleKey: 'operator', departmentKey: 'router' }],
    }),
  ).not.toThrow();
  expect(() =>
    verifyConfiguredAccess(account, {
      accesses: [
        { roleKey: 'operator', departmentKey: 'printing' },
        { roleKey: 'coordinator', departmentKey: 'router' },
      ],
    }),
  ).toThrow('no coincide');
});

it('bloquea la exportación de un perfil incompleto y las rutas fuera de su directorio', async () => {
  const root = await tempRoot();
  await expect(loadManualPublication(root, '../private')).rejects.toThrow('inválido');
  const profile = DEMO_PROFILES.find(({ id }) => id === 'impresion-operador')!;
  await cp(path.resolve('docs/user-manual'), path.join(root, 'docs/user-manual'), {
    recursive: true,
  });
  const manifest = await prepareManual(root, { ...profile, mode: 'demo' }, demoSession(profile));
  const index = await readFile(path.join(manifest.root, 'sources/index.md'), 'utf8');
  expect(index).not.toContain('08-users.md');
  expect(manifest.images).not.toContain('25-issue-return.png');
  await writeFile(path.join(manifest.root, 'manifest.json'), JSON.stringify(manifest));
  await expect(loadManualPublication(root, profile.id)).rejects.toThrow('no está completo');
  await writeFile(
    path.join(manifest.root, 'manifest.json'),
    JSON.stringify({ ...manifest, status: 'ready', sources: ['index.md', '../private.md'] }),
  );
  await expect(loadManualPublication(root, profile.id)).rejects.toThrow(
    'Fuente de manual inválida',
  );
});
