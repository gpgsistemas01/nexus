import { mkdtemp, rm, writeFile, readFile, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, expect, it } from 'vitest';
import {
  DEMO_PROFILES,
  demoSession,
  readAccounts,
  readCredentials,
  selectAccountsWithCredentials,
  verifyConfiguredAccess,
} from '../../../scripts/manual/profiles.mjs';
import {
  filterManualContent,
  filterManualModule,
  MANUAL_MODULES,
  selectedChapters,
} from '../../../scripts/manual/model.mjs';
import { parseManualBaseUrl } from '../../../scripts/manual/environment.mjs';
import {
  prepareManual,
  loadManualPublication,
  loadManualModulePublications,
  recoverManualCaptures,
  finalizeManualSources,
} from '../../../scripts/manual/publication.mjs';
import { DOCUMENT_STATE_CAPTURES } from '../../../scripts/manual/documentCaptures.mjs';
import { isManualAccountPath } from '../../../scripts/manual/paths.mjs';
import { APP_NAVIGATION_GROUPS } from '../../../src/app/navigation.js';

const temporary: string[] = [];

it.each([
  ['03-materials.md', 'materials', '03b-material-import.png'],
  ['04-consumables.md', 'materials', '06a-consumable-import.png'],
  ['05-wastes.md', 'wastes', '08a-waste-import.png'],
])(
  'la importación de %s se documenta sólo para lectura y la operación autorizada',
  async (file, resource, image) => {
    const source = await readFile(path.resolve('docs/user-manual', file), 'utf8');
    const read = `${resource}:read`;
    const write = `${resource}:write`;
    const adjust = `${resource}:adjust-stock`;
    const costs = 'inventory:costs-read';
    const decisions: [string[], boolean][] = [
      [[read, write, costs], true],
      [[read, adjust], true],
      [[read], false],
      [[read, write], false],
      [[write, costs], false],
      [[read, costs], false],
    ];
    for (const [permissions, available] of decisions) {
      const content = filterManualContent(source, permissions);
      expect(/^## Importar/m.test(content), permissions.join(', ')).toBe(available);
      expect(content.includes(`images/${image}`), permissions.join(', ')).toBe(available);
    }
  },
);

it('incluye la captura del histórico sólo con permiso de regularización y el manual usa escritorio', async () => {
  const issues = await readFile(path.resolve('docs/user-manual/12-issues.md'), 'utf8');
  expect(filterManualContent(issues, ['goods:issues-page-view', 'issues:reconcile'])).toContain(
    'images/25g-issue-historical.png',
  );
  expect(filterManualContent(issues, ['goods:issues-page-view'])).not.toContain(
    'images/25g-issue-historical.png',
  );
  const materials = await readFile(path.resolve('docs/user-manual/03-materials.md'), 'utf8');
  expect(materials).not.toContain('03a-material-mobile.png');
});

it('conserva capturas posteriores completas aunque otra pendiente falle de nuevo', () => {
  const previous = {
    revision: 'cuenta-a-vigente',
    captures: {
      'primera.png': { status: 'complete', sha256: 'primera' },
      'pendiente.png': { status: 'pending', reason: 'Consulta fallida' },
      'posterior.png': { status: 'complete', sha256: 'posterior' },
      'retirada.png': { status: 'complete', sha256: 'retirada' },
    },
  };
  const progress = recoverManualCaptures(previous, 'cuenta-a-vigente', [
    'primera.png',
    'pendiente.png',
    'posterior.png',
  ]);
  const saved = JSON.parse(
    JSON.stringify({
      ...progress,
      'pendiente.png': { status: 'pending', reason: 'El servicio sigue sin responder' },
    }),
  );
  expect(saved['posterior.png']).toEqual({ status: 'complete', sha256: 'posterior' });
  expect(saved['primera.png']).toEqual({ status: 'complete', sha256: 'primera' });
  expect(saved).not.toHaveProperty('retirada.png');
  expect(previous.captures['pendiente.png'].reason).toBe('Consulta fallida');
});

it('el primer uso y una revisión de otra cuenta no reutilizan capturas', () => {
  expect(recoverManualCaptures(undefined, 'cuenta-nueva', ['primera.png'])).toEqual({});
  expect(
    recoverManualCaptures(
      {
        revision: 'cuenta-anterior',
        captures: { 'primera.png': { status: 'complete', sha256: 'anterior' } },
      },
      'cuenta-nueva',
      ['primera.png'],
    ),
  ).toEqual({});
});
afterEach(async () => {
  await Promise.all(temporary.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});
const tempRoot = async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'nexus-manual-'));
  temporary.push(root);
  return root;
};

const manualRoot = async () => {
  const root = await tempRoot();
  await cp(path.resolve('docs/user-manual'), path.join(root, 'docs/user-manual'), {
    recursive: true,
    filter: (source) =>
      !isManualAccountPath(path.relative(path.resolve('docs'), source).split(path.sep).join('/')),
  });
  return root;
};

it.each(DEMO_PROFILES)(
  '$id excluye acciones ajenas también de notas, glosario e imágenes',
  async (profile) => {
    const root = await manualRoot();
    const session = demoSession(profile);
    const manifest = await prepareManual(root, { ...profile, mode: 'demo' }, session);
    const content = (
      await Promise.all(
        manifest.sources.map((file: string) =>
          readFile(path.join(manifest.root, 'sources', file), 'utf8'),
        ),
      )
    ).join('\n');
    const isAdmin = profile.id === 'sistemas-admin';
    const isWarehouse = profile.departmentKey === 'warehouse_and_supply';
    expect(content.includes('**Ajustar stock**')).toBe(isAdmin);
    expect(content.includes('**Cambiar contraseña**')).toBe(isAdmin);
    expect(content.includes('**Usuarios**')).toBe(isAdmin);
    expect(content.includes('**Exportar Excel**')).toBe(isAdmin || isWarehouse);
    expect(content.includes('**Descargar Excel**')).toBe(isAdmin || isWarehouse);
    expect(manifest.images.includes('05-material-stock.png')).toBe(isAdmin);
    expect(manifest.images.includes('15-user-password.png')).toBe(isAdmin);
    expect(manifest.images.includes('27-report.png')).toBe(isAdmin || isWarehouse);
    expect(manifest.images).not.toContain('20a-purchase-mixed.png');
    expect(manifest.images).not.toContain('20b-purchase-mixed.png');
    expect(content).not.toContain('purchase-mixed.png');
    expect(content).not.toContain('<!-- manual:');
    const index = await readFile(path.join(manifest.root, 'sources/index.md'), 'utf8');
    expect(index).toContain('## Para empezar');
    expect(index).toContain('## Sus tareas');
    expect(index).toContain('## Ayuda y consulta');
    expect(index.indexOf('## Para empezar')).toBeLessThan(index.indexOf('## Sus tareas'));
    expect(index.indexOf('## Sus tareas')).toBeLessThan(index.indexOf('## Ayuda y consulta'));
  },
);

it.each(['sistemas-admin', 'almacen-coordinador'])(
  'prepara los mismos capítulos e imágenes para %s con LF y CRLF',
  async (id) => {
    const root = await manualRoot();
    const profile = { ...DEMO_PROFILES.find((candidate) => candidate.id === id)!, mode: 'demo' };
    const session = demoSession(profile);
    const original = await prepareManual(root, profile, session);
    const originalSources = await Promise.all(
      original.sources.map((file: string) =>
        readFile(path.join(original.root, 'sources', file), 'utf8'),
      ),
    );
    for (const { file } of selectedChapters(session.permissions)) {
      const filename = path.join(root, 'docs/user-manual', file);
      const content = await readFile(filename, 'utf8');
      await writeFile(filename, content.replace(/\r\n?/g, '\n').replaceAll('\n', '\r\n'));
    }

    const windows = await prepareManual(root, profile, session);
    expect(windows.sources).toEqual(original.sources);
    expect(windows.images).toEqual(original.images);
    expect(
      await Promise.all(
        windows.sources.map((file: string) =>
          readFile(path.join(windows.root, 'sources', file), 'utf8'),
        ),
      ),
    ).toEqual(originalSources);
  },
);

it('identifica el capítulo y la línea de una directiva inválida antes de publicar fuentes', async () => {
  const root = await manualRoot();
  const profile = { ...DEMO_PROFILES[0]!, mode: 'demo' };
  await writeFile(
    path.join(root, 'docs/user-manual/03-materials.md'),
    '# Materiales\r\n\r\n<!-- manual:invalid materials:read -->\r\n',
  );

  await expect(prepareManual(root, profile, demoSession(profile))).rejects.toMatchObject({
    message: 'No se pudo preparar 03-materials.md: Directiva de manual inválida (línea 3).',
    cause: expect.any(Error),
  });
  await expect(
    readFile(path.join(root, 'docs/user-manual/accounts', profile.id, 'sources/index.md')),
  ).rejects.toMatchObject({ code: 'ENOENT' });
});

it('ordena el acceso antes de la navegación y los tres cortes de Mermas antes de Agregar stock', async () => {
  const root = await manualRoot();
  const profile = { ...DEMO_PROFILES[0]!, mode: 'demo' };
  const manifest = await prepareManual(root, profile, demoSession(profile));
  expect(manifest.images.slice(0, 2)).toEqual(['01-login.png', '02-navigation.png']);
  expect(
    manifest.images.filter((name: string) => name.startsWith('09') || name.startsWith('10')),
  ).toEqual([
    '09-waste-create.png',
    '09a-waste-measurements.png',
    '09b-waste-stock.png',
    '10-waste-add-stock.png',
  ]);
});

it('dos cuentas del mismo env y con igual rol y área reciben manuales y carpetas propios', async () => {
  const root = await manualRoot();
  const envFile = path.join(root, '.env.manual.local');
  const accountsFile = path.join(root, 'manual.accounts.local.json');
  await writeFile(
    envFile,
    'DOCS_FRONT_UNO_USER=almacenista_uno\nDOCS_FRONT_UNO_PASSWORD=clave-ficticia-uno\n' +
      'DOCS_FRONT_DOS_USER=almacenista_dos\nDOCS_FRONT_DOS_PASSWORD=clave-ficticia-dos\n',
  );
  await writeFile(
    accountsFile,
    JSON.stringify({
      baseUrl: 'http://127.0.0.1:5173',
      accounts: ['uno', 'dos'].map((name) => ({
        id: `cuenta-${name}`,
        label: 'Almacén',
        usernameEnv: `DOCS_FRONT_${name.toUpperCase()}_USER`,
        passwordEnv: `DOCS_FRONT_${name.toUpperCase()}_PASSWORD`,
      })),
    }),
  );
  const { accounts } = await readAccounts(accountsFile);
  const [one, two] = await Promise.all([
    readCredentials(accounts[0], envFile, {}),
    readCredentials(accounts[1], envFile, {}),
  ]);
  const profile = DEMO_PROFILES.find(({ id }) => id === 'almacen-auxiliar')!;
  const session = demoSession(profile);
  const first = await prepareManual(
    root,
    { ...accounts[0], mode: 'dev' },
    {
      ...session,
      id: 'user-uno',
      name: one!.name,
    },
  );
  const second = await prepareManual(
    root,
    { ...accounts[1], mode: 'dev' },
    {
      ...session,
      id: 'user-dos',
      name: two!.name,
    },
  );
  const index = await readFile(path.join(first.root, 'sources/index.md'), 'utf8');
  const other = await readFile(path.join(second.root, 'sources/index.md'), 'utf8');
  expect(index).toContain('# Manual de Nexus — almacenista\\_uno');
  expect(other).toContain('# Manual de Nexus — almacenista\\_dos');
  expect(index).toContain('| ALMACÉN Y PROVEDURÍA | Auxiliar |');
  expect(first.sources).toEqual(second.sources);
  expect(first.images).toEqual(second.images);
  expect(index).not.toContain('almacenista\\_dos');
  expect(other).not.toContain('almacenista\\_uno');
  expect(index + other).not.toContain('clave-ficticia');
  expect(first.root).toBe(path.join(root, 'docs/user-manual/accounts/cuenta-uno'));
  expect(second.root).toBe(path.join(root, 'docs/user-manual/accounts/cuenta-dos'));
  expect(first.accessFingerprint).not.toBe(second.accessFingerprint);
});

it('al reducir el acceso retira capítulos e imágenes anteriores y conserva los permitidos', async () => {
  const root = await manualRoot();
  const profile = { id: 'cuenta-uno', label: 'Cuenta 01', mode: 'dev' };
  const admin = demoSession(DEMO_PROFILES[0]!);
  const previous = await prepareManual(root, profile, admin);
  await writeFile(path.join(previous.root, 'images/15-user-password.png'), 'captura anterior');
  await writeFile(path.join(previous.root, 'images/03-materials-list.png'), 'captura permitida');
  const warehouse = demoSession(DEMO_PROFILES.find(({ id }) => id === 'almacen-auxiliar')!);
  const current = await prepareManual(root, profile, { ...warehouse, id: admin.id });
  expect(current.sources).not.toContain('08-users.md');
  expect(current.images).not.toContain('15-user-password.png');
  await expect(readFile(path.join(current.root, 'sources/08-users.md'))).rejects.toMatchObject({
    code: 'ENOENT',
  });
  await expect(
    readFile(path.join(current.root, 'images/15-user-password.png')),
  ).rejects.toMatchObject({ code: 'ENOENT' });
  expect(await readFile(path.join(current.root, 'images/03-materials-list.png'), 'utf8')).toBe(
    'captura permitida',
  );
  expect(await readFile(path.join(current.root, 'sources/03-materials.md'), 'utf8')).not.toContain(
    '**Ajustar stock**',
  );
});

it('los capítulos comunes separan cada tipo de reporte por su permiso y página', async () => {
  const report = await readFile(path.resolve('docs/user-manual/14-reports.md'), 'utf8');
  const persons = filterManualContent(report, ['persons:page-view', 'person:reports-read']);
  expect(persons).toContain('En **Personas**');
  expect(persons).not.toContain('En **Usuarios**');
  expect(persons).not.toContain('En **Movimientos**');
  expect(persons).not.toContain('**Incluir en Excel**');
  expect(persons).not.toContain('## Elegir periodo');
  const users = await readFile(path.resolve('docs/user-manual/08-users.md'), 'utf8');
  expect(filterManualContent(users, ['users:manage'])).not.toContain('**Exportar Excel**');
  expect(filterManualContent(users, ['users:manage', 'admin:reports-read'])).toContain(
    '**Exportar Excel**',
  );
  const movements = await readFile(path.resolve('docs/user-manual/13-movements.md'), 'utf8');
  expect(filterManualContent(movements, ['movements:read'])).not.toContain('**Exportar Excel**');
  expect(filterManualContent(movements, ['movements:read', 'admin:reports-read'])).toContain(
    '**Exportar Excel**',
  );
});

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
    expect(
      selectedChapters(session.permissions)
        .filter(({ section }) => section === 'tasks')
        .map(({ file }) => file),
    ).toEqual(['03-materials.md', '04-consumables.md', '05-wastes.md', '12-issues.md']);
    const navigation = filterManualContent(
      await readFile(path.resolve('docs/user-manual/02-navigation-and-controls.md'), 'utf8'),
      session.permissions,
    );
    expect(navigation).toContain('### Áreas operativas: Almacén y Salidas');
    expect(navigation).toContain('no registran clientes ni proveedores');
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
      expect(content).not.toContain('**Registrar cliente «Cliente nuevo»**');
      expect(content).not.toContain('**Detalles de peso**');
    }
  },
);

it('Almacén conserva surtido y devolución, mientras sólo administración recibe ajustes y usuarios', async () => {
  const warehouse = demoSession(DEMO_PROFILES.find(({ id }) => id === 'almacen-auxiliar')!);
  const admin = demoSession(DEMO_PROFILES[0]!);
  const issues = await readFile(path.resolve('docs/user-manual/12-issues.md'), 'utf8');
  expect(filterManualContent(issues, warehouse.permissions)).toContain('## Devolver una entrega');
  expect(filterManualContent(issues, warehouse.permissions)).toContain(
    '**Registrar cliente «Cliente nuevo»**',
  );
  for (const permission of ['clients:create', 'clients:read']) {
    expect(
      filterManualContent(
        issues,
        warehouse.permissions.filter((value) => value !== permission),
      ),
    ).not.toContain('**Registrar cliente «Cliente nuevo»**');
  }
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
  const wastes = await readFile(path.resolve('docs/user-manual/05-wastes.md'), 'utf8');
  expect(filterManualContent(wastes, admin.permissions)).toContain('## Ajustar el saldo');
  expect(filterManualContent(wastes, warehouse.permissions)).not.toContain('## Ajustar el saldo');
});

it.each([
  { manage: false, report: false },
  { manage: false, report: true },
  { manage: true, report: false },
])(
  'el manual de Compras separa lectura, gestión y reporte: $manage/$report',
  async ({ manage, report }) => {
    const permissions = [
      'goods:receipts-page-view',
      ...(manage ? ['goods:receipts-manage'] : []),
      ...(report ? ['warehouse:reports-read'] : []),
    ];
    const content = filterManualContent(
      await readFile(path.resolve('docs/user-manual/11-purchases.md'), 'utf8'),
      permissions,
    );
    expect(content).toContain('## Consultar una compra');
    expect(content).toContain('20-purchase-view.png');
    for (const section of ['Registrar una compra', 'Editar o corregir'])
      expect(content.includes('## ' + section)).toBe(manage);
    expect(content.includes('19-purchase-create.png')).toBe(manage);
    expect(content.includes('21-purchase-correction.png')).toBe(manage);
    expect(content.includes('## Exportar compras')).toBe(report);
  },
);

it('el reporte de Proveedores se incluye con permiso de reporte sin conceder alta', async () => {
  const source = await readFile(path.resolve('docs/user-manual/10-suppliers.md'), 'utf8');
  const reader = filterManualContent(source, ['suppliers:page-view', 'supplier:reports-read']);
  expect(reader).toContain('## Consulta independiente');
  expect(reader).toContain('## Exportar proveedores');
  expect(reader).not.toContain('## Registrar un proveedor');
  const creator = filterManualContent(source, [
    'suppliers:page-view',
    'suppliers:manage',
    'suppliers:read',
  ]);
  expect(creator).toContain('## Registrar un proveedor');
  expect(creator).not.toContain('## Exportar proveedores');
});

it.each(['almacen-auxiliar', 'almacen-coordinador'])(
  '%s conserva altas contextuales en el manual sin páginas independientes de Directorio',
  async (id) => {
    const session = demoSession(DEMO_PROFILES.find((profile) => profile.id === id)!);
    const chapters = selectedChapters(session.permissions).map(({ file }) => file);
    expect(chapters).toContain('09-clients.md');
    expect(chapters).toContain('10-suppliers.md');
    const groups = APP_NAVIGATION_GROUPS.filter(({ links }) =>
      links.some(({ permission }) => session.permissions.includes(permission)),
    ).map(({ id }) => id);
    expect(groups).not.toContain('directory');
    for (const file of ['09-clients.md', '10-suppliers.md']) {
      const content = filterManualContent(
        await readFile(path.resolve('docs/user-manual', file), 'utf8'),
        session.permissions,
      );
      expect(content).toContain('desde el selector');
      expect(content).not.toContain('## Consulta independiente');
      expect(content).not.toContain('## Editar y desactivar');
      expect(content).not.toContain('Directorio comercial');
      expect(content).toMatch(/images\/(16-client-form|17-supplier-form)\.png/);
    }
  },
);

it.each(['almacen-auxiliar', 'almacen-coordinador', 'impresion-operador'])(
  'el índice de %s explica el alcance de consulta en Salidas',
  async (id) => {
    const root = await manualRoot();
    const profile = DEMO_PROFILES.find((candidate) => candidate.id === id)!;
    const manifest = await prepareManual(root, { ...profile, mode: 'demo' }, demoSession(profile));
    const index = await readFile(path.join(manifest.root, 'sources/index.md'), 'utf8');
    expect(index).toContain(
      id.startsWith('almacen-')
        ? 'Puede consultar las salidas de todas las áreas'
        : 'Sólo puede consultar las salidas de las áreas asignadas',
    );
  },
);

it.each(['goods:issues-page-view', 'waste:issues-page-view'])(
  'una cuenta de sólo consulta %s no recibe instrucciones ni capturas para registrar o surtir',
  async (permission) => {
    const root = await manualRoot();
    const manifest = await prepareManual(
      root,
      { id: 'consulta', label: 'Administración', mode: 'dev' },
      { id: 'lector', permissions: [permission], accesses: [] },
    );
    const content = (
      await Promise.all(
        manifest.sources.map((file: string) =>
          readFile(path.join(manifest.root, 'sources', file), 'utf8'),
        ),
      )
    ).join('\n');
    expect(manifest.sources).toContain('12-issues.md');
    expect(content).toContain('Sólo puede consultar las salidas');
    expect(content).not.toContain('puede consultar y registrar');
    expect(content).not.toContain('## Registrar');
    expect(content).not.toContain('## Surtir');
    expect(manifest.images).not.toContain('23-issue-create.png');
    expect(manifest.images).not.toContain('24-issue-supply.png');
    expect(manifest.images).not.toContain('25-issue-return.png');
  },
);

it.each([
  { format: 'LF', separator: '\n' },
  { format: 'CRLF', separator: '\r\n' },
])('evalúa condiciones anidadas y rechaza directivas inválidas con $format', ({ separator }) => {
  const source = [
    'base  ',
    '<!-- manual:any materials:read wastes:page-view -->',
    'lectura',
    '<!-- manual:all materials:read materials:write -->',
    'escritura',
    '<!-- manual:end -->',
    '<!-- manual:end -->',
    '',
  ].join(separator);
  expect(filterManualContent(source, [])).toBe('base  \n');
  expect(filterManualContent(source, ['materials:read'])).toBe('base  \nlectura\n');
  expect(filterManualContent(source, ['wastes:page-view'])).toBe('base  \nlectura\n');
  expect(filterManualContent(source, ['materials:read', 'materials:write'])).toBe(
    'base  \nlectura\nescritura\n',
  );
  expect(() =>
    filterManualContent(`base${separator}<!-- manual:any unknown:grant -->${separator}`, []),
  ).toThrow('desconocido (línea 2)');
  expect(() => filterManualContent(`<!-- manual:end -->${separator}`, [])).toThrow(
    'sin apertura (línea 1)',
  );
  expect(() => filterManualContent(`<!-- manual:any materials:read -->${separator}`, [])).toThrow(
    'sin cerrar',
  );
  expect(() =>
    filterManualContent(`<!-- manual:invalid materials:read -->${separator}`, []),
  ).toThrow('Directiva de manual inválida (línea 1)');
  expect(() =>
    filterManualContent(
      [
        '<!-- manual:any materials:read -->',
        '<!-- manual:any unknown:grant -->',
        '<!-- manual:end -->',
        '<!-- manual:end -->',
      ].join(separator),
      [],
    ),
  ).toThrow('desconocido (línea 2)');
});

it('admite saltos LF y CRLF mezclados sin alterar los espacios del texto', () => {
  const source =
    'base  \r\n<!-- manual:any materials:read -->\nlectura\r\n<!-- manual:end -->\nfin\r\n';
  expect(filterManualContent(source, ['materials:read'])).toBe('base  \nlectura\nfin\n');
  expect(filterManualContent(source, [])).toBe('base  \nfin\n');
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
  await expect(readCredentials(account, filename, { DOCS_FRONT_PASSWORD: '' })).resolves.toBeNull();
  await expect(readCredentials(account, root, {})).rejects.toThrow(
    'No se pudo leer el archivo local de credenciales.',
  );
});

it.each([
  {},
  { DOCS_FRONT_USER: '', DOCS_FRONT_PASSWORD: '' },
  { DOCS_FRONT_PASSWORD: 'clave-ficticia' },
  { DOCS_FRONT_USER: 'usuario-ficticio' },
  { DOCS_FRONT_USER: '   ', DOCS_FRONT_PASSWORD: 'clave-ficticia' },
  { DOCS_FRONT_USER: 'usuario-ficticio', DOCS_FRONT_PASSWORD: '' },
])('omite credenciales incompletas sin intentar autenticar: %j', async (environment) => {
  expect(
    await readCredentials(
      { id: 'cuenta-01', usernameEnv: 'DOCS_FRONT_USER', passwordEnv: 'DOCS_FRONT_PASSWORD' },
      undefined,
      environment,
    ),
  ).toBeNull();
});

it('selecciona sólo cuentas completas del mismo env y conserva la prioridad del proceso', async () => {
  const root = await tempRoot();
  const file = path.join(root, '.env.manual.local');
  const accounts = ['UNO', 'DOS', 'TRES', 'CUATRO'].map((name) => ({
    id: name.toLowerCase(),
    usernameEnv: `DOCS_FRONT_${name}_USER`,
    passwordEnv: `DOCS_FRONT_${name}_PASSWORD`,
  }));
  await writeFile(
    file,
    'DOCS_FRONT_UNO_USER=usuario-uno\nDOCS_FRONT_UNO_PASSWORD=clave-ficticia-uno\n' +
      'DOCS_FRONT_DOS_USER=usuario-dos\n' +
      'DOCS_FRONT_TRES_PASSWORD=clave-ficticia-tres\n' +
      'DOCS_FRONT_CUATRO_USER=usuario-cuatro\nDOCS_FRONT_CUATRO_PASSWORD=clave-ficticia-cuatro\n',
  );
  const selection = await selectAccountsWithCredentials(accounts, file, {
    DOCS_FRONT_DOS_PASSWORD: 'clave-ficticia-dos',
    DOCS_FRONT_CUATRO_PASSWORD: '',
  });
  expect(selection.accounts).toEqual([accounts[0], accounts[1]]);
  expect(selection.omitted).toEqual(['tres', 'cuatro']);
  expect(JSON.stringify(selection)).not.toContain('clave-ficticia');
  await expect(selectAccountsWithCredentials(accounts, root, {})).rejects.toThrow(
    'No se pudo leer el archivo local de credenciales.',
  );
});

it.each([['--all'], ['--profile', 'cuenta-01']])(
  'termina sin navegador ni exportación si no hay credenciales: %j',
  async (...selection) => {
    const root = await tempRoot();
    const configFile = path.join(root, 'accounts.json');
    const envFile = path.join(root, '.env.manual.local');
    await writeFile(
      configFile,
      JSON.stringify({
        baseUrl: 'http://127.0.0.1:1',
        accounts: [
          {
            id: 'cuenta-01',
            label: 'Cuenta de prueba',
            usernameEnv: 'DOCS_FRONT_EMPTY_FIXTURE_USER',
            passwordEnv: 'DOCS_FRONT_EMPTY_FIXTURE_PASSWORD',
          },
        ],
      }),
    );
    await writeFile(
      envFile,
      'DOCS_FRONT_EMPTY_FIXTURE_USER=\nDOCS_FRONT_EMPTY_FIXTURE_PASSWORD=\n',
    );
    const result = spawnSync(
      process.execPath,
      [
        path.resolve('scripts/manuals.mjs'),
        'capture',
        ...selection,
        '--accounts',
        configFile,
        '--env-file',
        envFile,
      ],
      {
        cwd: root,
        encoding: 'utf8',
        timeout: 10_000,
        env: {
          ...process.env,
          DOCS_FRONT_EMPTY_FIXTURE_USER: '',
          DOCS_FRONT_EMPTY_FIXTURE_PASSWORD: '',
        },
      },
    );
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('Cuenta omitida: cuenta-01');
    expect(result.stdout).toContain('No hay cuentas con credenciales completas.');
    expect(result.stdout).not.toContain('Running');
  },
);

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
    { baseUrl: 'https://example.com', accounts: [account] },
    { baseUrl: 'https://user:fixture@example.com', accounts: [account] },
    { baseUrl: 'http://localhost:5173', accounts: [account, account] },
    { baseUrl: 'http://localhost:5173', accounts: [{ ...account, password: 'fixture' }] },
  ]) {
    await writeFile(filename, JSON.stringify(data));
    await expect(readAccounts(filename)).rejects.toThrow();
  }
});

it.each([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://[::1]:5173',
  'https://localhost:5173',
])('admite el origen local de desarrollo %s', (baseUrl) => {
  expect(parseManualBaseUrl(baseUrl)).toBe(baseUrl);
});

it.each([
  'https://nexus.example.com',
  'http://10.0.0.104:5173',
  'http://localhost.example.com:5173',
  'ftp://localhost:5173',
])('rechaza capturas fuera del origen local de desarrollo: %s', (baseUrl) => {
  expect(() => parseManualBaseUrl(baseUrl)).toThrow('sólo de desarrollo local');
});

it.each(['capture', 'export'])(
  'bloquea %s en producción antes de leer credenciales',
  async (command) => {
    const root = await tempRoot();
    const result = spawnSync(
      process.execPath,
      [
        path.resolve('scripts/manuals.mjs'),
        command,
        '--all',
        '--accounts',
        path.join(root, 'no-existe.json'),
      ],
      {
        encoding: 'utf8',
        timeout: 10_000,
        env: { ...process.env, NODE_ENV: 'production' },
      },
    );
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(1);
    expect(result.stderr).toContain('sólo para desarrollo');
    expect(result.stdout).not.toContain('Running');
  },
);

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

it('selecciona el manual por la sesión sin declarar acceso esperado ni confiar en la etiqueta', async () => {
  const root = await manualRoot();
  const account = {
    id: 'cuenta-01',
    label: 'Administración del sistema',
    usernameEnv: 'DOCS_FRONT_CUENTA_01_USER',
    passwordEnv: 'DOCS_FRONT_CUENTA_01_PASSWORD',
  };
  const filename = path.join(root, 'accounts.json');
  await writeFile(
    filename,
    JSON.stringify({ baseUrl: 'http://localhost:5173', accounts: [account] }),
  );
  const configuration = await readAccounts(filename);
  const session = demoSession(DEMO_PROFILES.find(({ id }) => id === 'instalaciones-instalador')!);
  expect(() => verifyConfiguredAccess(configuration.accounts[0], session)).not.toThrow();
  const manifest = await prepareManual(root, { ...account, mode: 'dev' }, session);
  expect(manifest.sources).toContain('12-issues.md');
  expect(manifest.sources).not.toContain('08-users.md');
  expect(manifest.sources).not.toContain('11-purchases.md');
  expect(manifest.images).not.toContain('25-issue-return.png');
  expect(manifest.id).toBe(account.id);
  const index = await readFile(path.join(manifest.root, 'sources/index.md'), 'utf8');
  expect(index).toContain('| INSTALACIONES | Instalador |');
  expect(index).toContain('## Su cuenta');
});

it('publica los nombres de acceso como texto y no atribuye operaciones ausentes de la sesión', async () => {
  const root = await manualRoot();
  const session = {
    id: 'fixture',
    permissions: [],
    accesses: [{ role: '[Rol](https://example.invalid)', department: 'Área | <b>nombre</b>' }],
  };
  const manifest = await prepareManual(
    root,
    { id: 'cuenta-01', label: 'Cuenta 01', mode: 'dev' },
    session,
  );
  const index = await readFile(path.join(manifest.root, 'sources/index.md'), 'utf8');
  expect(index).toContain('\\[Rol\\]');
  expect(index).toContain('Área \\| &lt;b&gt;nombre&lt;/b&gt;');
  expect(index).not.toContain('[Rol](https://example.invalid)');
  expect(index).not.toContain('puede consultar y registrar');
  expect(manifest.sources).not.toContain('12-issues.md');
});

it('bloquea la exportación de un perfil incompleto y las rutas fuera de su directorio', async () => {
  const root = await manualRoot();
  await expect(loadManualPublication(root, '../private')).rejects.toThrow('inválido');
  const profile = DEMO_PROFILES.find(({ id }) => id === 'impresion-operador')!;
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

const publicationWithoutExamples = async (mode = 'dev') => {
  const root = await manualRoot();
  const manifest = await prepareManual(
    root,
    { id: 'lector', label: 'Lectura', mode },
    {
      id: 'lector',
      permissions: ['goods:receipts-page-view'],
      accesses: [],
    },
  );
  const bytes = Buffer.from('capture-fixture');
  const captures: Record<string, { status: string; reason?: string; sha256?: string }> = {};
  for (const image of manifest.images) {
    if (Object.hasOwn(DOCUMENT_STATE_CAPTURES, image))
      captures[image] = {
        status: 'unavailable',
        reason: 'No existe un documento con este estado.',
      };
    else {
      await writeFile(path.join(manifest.root, 'images', image), bytes);
      captures[image] = {
        status: 'complete',
        sha256: createHash('sha256').update(bytes).digest('hex'),
      };
    }
  }
  await finalizeManualSources(manifest, captures);
  await writeFile(
    path.join(manifest.root, 'manifest.json'),
    JSON.stringify({ ...manifest, revision: 'vigente', status: 'ready', captures }),
  );
  return { root, manifest, captures };
};

it('publica las acciones y la tabla de estados aunque falten ejemplos históricos condicionales', async () => {
  const { root, manifest } = await publicationWithoutExamples();
  const content = await readFile(path.join(manifest.root, 'sources/11-purchases.md'), 'utf8');
  expect(content).toContain('Partidas activas y canceladas');
  expect(content).toContain('images/20-purchase-view.png');
  expect(content).not.toContain('images/20c-purchase-canceled.png');
  expect(await loadManualPublication(root, 'lector')).toHaveLength(manifest.sources.length);
});

it('conserva los ejemplos sin datos al reanudar y no repite su búsqueda hasta --fresh', async () => {
  const { manifest, captures } = await publicationWithoutExamples();
  const progress = recoverManualCaptures(
    { ...manifest, captures, revision: 'vigente' },
    'vigente',
    manifest.images,
  );
  expect(progress['20c-purchase-canceled.png']).toEqual(captures['20c-purchase-canceled.png']);
  expect(
    recoverManualCaptures(
      { ...manifest, captures, revision: 'anterior' },
      'nueva',
      manifest.images,
    ),
  ).toEqual({});
});

it('rechaza una referencia de imagen omitida que todavía está en las fuentes publicables', async () => {
  const { root, manifest } = await publicationWithoutExamples();
  const source = path.join(manifest.root, 'sources/11-purchases.md');
  await writeFile(
    source,
    (await readFile(source, 'utf8')) + '\n![Ejemplo](../images/20c-purchase-canceled.png)\n',
  );
  await expect(loadManualPublication(root, 'lector')).rejects.toThrow('referencia sin captura');
});

it('mantiene obligatorias las capturas de acciones y los ejemplos del modo demo', async () => {
  const { root, manifest, captures } = await publicationWithoutExamples();
  captures['20-purchase-view.png'] = { status: 'unavailable', reason: 'No hay compra.' };
  await writeFile(
    path.join(manifest.root, 'manifest.json'),
    JSON.stringify({ ...manifest, status: 'ready', captures }),
  );
  await expect(loadManualPublication(root, 'lector')).rejects.toThrow('debe volver a verificarse');
  const demo = await publicationWithoutExamples('demo');
  await expect(loadManualPublication(demo.root, 'lector')).rejects.toThrow(
    'debe volver a verificarse',
  );
});

it.each(DEMO_PROFILES)(
  '$id publica sólo los capítulos y capturas de su selección',
  async (profile) => {
    const root = await manualRoot();
    const manifest = await prepareManual(root, { ...profile, mode: 'demo' }, demoSession(profile));
    const bytes = Buffer.from('capture-fixture');
    const captures: Record<string, { status: string; sha256: string }> = {};
    for (const image of manifest.images) {
      await writeFile(path.join(manifest.root, 'images', image), bytes);
      captures[image] = {
        status: 'complete',
        sha256: createHash('sha256').update(bytes).digest('hex'),
      };
    }
    await writeFile(
      path.join(manifest.root, 'manifest.json'),
      JSON.stringify({ ...manifest, status: 'ready', captures }),
    );

    const sources = await loadManualPublication(root, profile.id);
    expect(sources).toEqual(
      manifest.sources.map((file: string) =>
        path
          .relative(path.resolve(root, '../back'), path.join(manifest.root, 'sources', file))
          .split(path.sep)
          .join('/'),
      ),
    );
    const parts = await loadManualModulePublications(root, profile.id);
    expect(Object.keys(parts)).toEqual(
      expect.arrayContaining([
        'inicio',
        'almacen-materiales',
        'almacen-consumibles',
        'almacen-mermas',
      ]),
    );
    const readGlossary = (id: string) =>
      readFile(path.join(manifest.root, 'modules', id, '16-glossary.md'), 'utf8');
    const materials = await readGlossary('almacen-materiales');
    const consumables = await readGlossary('almacen-consumibles');
    const wastes = await readGlossary('almacen-mermas');
    expect(materials).toContain('| Material |');
    expect(materials).not.toContain('| Merma |');
    expect(materials).not.toContain('| Consumible |');
    expect(materials).not.toContain('## Compras');
    expect(materials).not.toContain('## Salidas');
    expect(consumables).toContain('| Consumible |');
    expect(consumables).not.toContain('Base y Altura');
    expect(wastes).toContain('| Merma |');
    expect(wastes).not.toContain('| Material |');
    expect(wastes).not.toContain('## Compras');
    const consumableFiles = parts['almacen-consumibles'].join('\n');
    if (materials.includes('Plantilla operativa'))
      expect(consumableFiles).toContain('03-materials.md');
    const issue = await readGlossary('salidas-materiales');
    expect(issue).toContain('Cantidad solicitada');
    expect(issue).not.toContain('## Compras');
    expect(issue).not.toContain('Stock mínimo');
    if (profile.departmentKey !== 'warehouse_and_supply' && profile.id !== 'sistemas-admin') {
      expect(parts).not.toHaveProperty('compras-materiales');
      expect(parts).not.toHaveProperty('usuarios');
      expect(materials).not.toContain('Plantilla operativa');
      expect(issue).not.toContain('### Referencias para surtir o devolver');
      expect(parts['salidas-materiales'].join('\n')).not.toContain('14-reports.md');
    }
  },
);

it('rechaza un capítulo anterior que ya no corresponde a los permisos del usuario', async () => {
  const { root, manifest, captures } = await publicationWithoutExamples();
  await writeFile(path.join(manifest.root, 'sources/08-users.md'), '# Usuarios\n');
  await writeFile(
    path.join(manifest.root, 'manifest.json'),
    JSON.stringify({
      ...manifest,
      status: 'ready',
      captures,
      sources: [...manifest.sources, '08-users.md'],
    }),
  );
  await expect(loadManualPublication(root, 'lector')).rejects.toThrow(
    'El capítulo 08-users.md no corresponde al acceso',
  );
});

it.each(['omitido', 'repetido'])(
  'rechaza un capítulo permitido %s en la publicación',
  async (change) => {
    const { root, manifest, captures } = await publicationWithoutExamples();
    const sources =
      change === 'omitido'
        ? manifest.sources.filter((file: string) => file !== '11-purchases.md')
        : [...manifest.sources, '11-purchases.md'];
    await writeFile(
      path.join(manifest.root, 'manifest.json'),
      JSON.stringify({ ...manifest, status: 'ready', sources, captures }),
    );
    await expect(loadManualPublication(root, 'lector')).rejects.toThrow('selección de capítulos');
  },
);

it.each(['omitida', 'repetida'])(
  'rechaza una captura requerida %s aunque se retire también su referencia',
  async (change) => {
    const { root, manifest, captures } = await publicationWithoutExamples();
    const image = '20-purchase-view.png';
    const source = path.join(manifest.root, 'sources/11-purchases.md');
    await writeFile(
      source,
      (await readFile(source, 'utf8')).replace(/^!.*20-purchase-view\.png.*$/gm, ''),
    );
    const images =
      change === 'omitida'
        ? manifest.images.filter((name: string) => name !== image)
        : [...manifest.images, image];
    await writeFile(
      path.join(manifest.root, 'manifest.json'),
      JSON.stringify({ ...manifest, status: 'ready', images, captures }),
    );
    await expect(loadManualPublication(root, 'lector')).rejects.toThrow('selección de capturas');
  },
);

it('rechaza una captura completa que se retiró del contenido del manual', async () => {
  const { root, manifest } = await publicationWithoutExamples();
  const source = path.join(manifest.root, 'sources/11-purchases.md');
  await writeFile(
    source,
    (await readFile(source, 'utf8')).replace(/^!.*20-purchase-view\.png.*$/gm, ''),
  );
  await expect(loadManualPublication(root, 'lector')).rejects.toThrow('falta en el contenido');
});

it('rechaza imágenes de acciones sin permiso aunque se agreguen al manifiesto', async () => {
  const { root, manifest, captures } = await publicationWithoutExamples();
  await writeFile(
    path.join(manifest.root, 'manifest.json'),
    JSON.stringify({
      ...manifest,
      status: 'ready',
      captures,
      images: [...manifest.images, '15-user-password.png'],
    }),
  );
  await expect(loadManualPublication(root, 'lector')).rejects.toThrow(
    'La imagen 15-user-password.png no corresponde al acceso',
  );
});

it('rechaza referencias a capturas que no forman parte de la selección de esa cuenta', async () => {
  const { root, manifest } = await publicationWithoutExamples();
  await writeFile(
    path.join(manifest.root, 'sources/11-purchases.md'),
    '![Otra acción](../images/15-user-password.png)\n',
  );
  await expect(loadManualPublication(root, 'lector')).rejects.toThrow(
    'no pertenece a las capturas de la cuenta lector',
  );
});

it.each(['../../otra/images/20-purchase-view.png', 'https://example.com/imagen.png'])(
  'rechaza imágenes fuera de la carpeta de la cuenta: %s',
  async (reference) => {
    const { root, manifest } = await publicationWithoutExamples();
    await writeFile(
      path.join(manifest.root, 'sources/11-purchases.md'),
      `![Otra cuenta](${reference})\n`,
    );
    await expect(loadManualPublication(root, 'lector')).rejects.toThrow(
      'sólo admite imágenes de su propia carpeta',
    );
  },
);

it('una captura disponible en otra cuenta no sustituye la que falta en la cuenta seleccionada', async () => {
  const { root, manifest } = await publicationWithoutExamples();
  await cp(path.join(manifest.root, 'images'), path.resolve(manifest.root, '../otra/images'), {
    recursive: true,
  });
  await rm(path.join(manifest.root, 'images/20-purchase-view.png'));
  await expect(loadManualPublication(root, 'lector')).rejects.toThrow(
    'Falta la captura 20-purchase-view.png de lector',
  );
});

it('rechaza una captura modificada después de verificarla', async () => {
  const { root, manifest } = await publicationWithoutExamples();
  await writeFile(path.join(manifest.root, 'images/20-purchase-view.png'), 'imagen posterior');
  await expect(loadManualPublication(root, 'lector')).rejects.toThrow('debe volver a verificarse');
});

it('rechaza contextos de módulo desconocidos o bloques incompletos', () => {
  const module = MANUAL_MODULES.find((item) => item.id === 'almacen-materiales')!;
  expect(() =>
    filterManualModule('<!-- module:any desconocido -->\ntexto\n<!-- module:end -->', module),
  ).toThrow('contexto desconocido');
  expect(() => filterManualModule('<!-- module:any materials -->\ntexto', module)).toThrow(
    'sin cerrar',
  );
});

it('una edición anterior debe preparar las fuentes por módulo antes de publicar', async () => {
  const { root, manifest, captures } = await publicationWithoutExamples();
  await writeFile(
    path.join(manifest.root, 'manifest.json'),
    JSON.stringify({ ...manifest, status: 'ready', captures, moduleEditionVersion: 0 }),
  );
  await expect(loadManualModulePublications(root, manifest.id)).rejects.toThrow('docs:screenshots');
});
