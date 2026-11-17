import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { DEMO_PROFILES, demoSession } from '../../../scripts/manual/profiles.mjs';
import { prepareManual } from '../../../scripts/manual/publication.mjs';
import { isManualAccountPath } from '../../../scripts/manual/paths.mjs';

const temporary: string[] = [];
afterEach(async () => {
  await Promise.all(temporary.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const fixture = async (mode = 'dev') => {
  const root = await mkdtemp(path.join(tmpdir(), 'nexus-manual-commands-'));
  temporary.push(root);
  const frontRoot = path.join(root, 'front');
  await writeFile(path.join(root, 'package.json'), '{"type":"module"}');
  await cp(path.resolve('scripts/manual'), path.join(frontRoot, 'scripts/manual'), {
    recursive: true,
  });
  await cp(path.resolve('scripts/manuals.mjs'), path.join(frontRoot, 'scripts/manuals.mjs'));
  for (const directory of ['constants', 'shared']) {
    await cp(path.resolve('../back/src', directory), path.join(root, 'back/src', directory), {
      recursive: true,
    });
  }
  await cp(path.resolve('docs/user-manual'), path.join(frontRoot, 'docs/user-manual'), {
    recursive: true,
    filter: (source) =>
      !isManualAccountPath(path.relative(path.resolve('docs'), source).split(path.sep).join('/')) &&
      (source.endsWith('.md') || !path.extname(source)),
  });
  const profile = { ...DEMO_PROFILES.find(({ id }) => id === 'impresion-coordinador')!, mode };
  const manifest = await prepareManual(frontRoot, profile, demoSession(profile));
  const bytes = Buffer.from('capture-fixture');
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  for (const image of manifest.images)
    await writeFile(path.join(manifest.root, 'images', image), bytes);
  await writeFile(
    path.join(manifest.root, 'manifest.json'),
    JSON.stringify({
      ...manifest,
      status: 'ready',
      captures: Object.fromEntries(
        manifest.images.map((image) => [image, { status: 'complete', sha256 }]),
      ),
    }),
  );
  const accounts = [
    {
      id: profile.id,
      label: profile.label,
      usernameEnv: 'DOCS_FRONT_UNUSED_MANUAL_USER',
      passwordEnv: 'DOCS_FRONT_UNUSED_MANUAL_PASSWORD',
    },
  ];
  const configFile = path.join(frontRoot, 'accounts.json');
  await writeFile(configFile, JSON.stringify({ baseUrl: 'http://127.0.0.1:1', accounts }));
  await mkdir(path.join(frontRoot, 'node_modules/@playwright/test'), { recursive: true });
  await writeFile(
    path.join(frontRoot, 'node_modules/@playwright/test/cli.js'),
    `
    import { writeFileSync } from 'node:fs';
    writeFileSync('browser-started', 'capture');
  `,
  );
  await mkdir(path.join(root, 'back/scripts'), { recursive: true });
  await writeFile(
    path.join(root, 'back/scripts/exportDocs.js'),
    `
    import { mkdirSync, writeFileSync } from 'node:fs';
    import { loadManualModulePublications } from '../../front/scripts/manual/publication.mjs';
    const output = '../front/build/exports';
    mkdirSync(output, { recursive: true });
    const format = process.argv[3];
    if (!['pdf', 'docx', 'ambos'].includes(format)) throw new Error('La exportación debe pedir los módulos, sin documento general.');
    const id = process.env.DOCS_FRONT_MANUAL_PROFILE;
    const parts = await loadManualModulePublications('../front', id);
    for (const extension of format === 'ambos' ? ['docx', 'pdf'] : [format]) {
      writeFileSync(output + '/' + id + '.' + extension, 'exported');
      const folder = '../front/build/docs/' + extension + '/manuales-vue/' + id;
      mkdirSync(folder, { recursive: true });
      for (const module of Object.keys(parts)) writeFileSync(folder + '/' + module + '.' + extension, 'exported');
    }
  `,
  );
  return { root, frontRoot, manifest, profile, configFile, accounts, bytes };
};

const run = (frontRoot: string, args: string[]) =>
  spawnSync(process.execPath, [path.join(frontRoot, 'scripts/manuals.mjs'), ...args], {
    cwd: frontRoot,
    encoding: 'utf8',
    timeout: 10_000,
    env: { ...process.env, NODE_ENV: 'test' },
  });

it('capturar no genera Word/PDF aunque haya una edición completa', async () => {
  const { frontRoot, profile } = await fixture('demo');
  const result = run(frontRoot, ['capture', '--mode', 'demo', '--profile', profile.id]);
  expect(result.error).toBeUndefined();
  expect(result.status, result.stderr).toBe(0);
  expect(await readFile(path.join(frontRoot, 'browser-started'), 'utf8')).toBe('capture');
  await expect(
    readFile(path.join(frontRoot, 'build/exports', profile.id + '.pdf')),
  ).rejects.toMatchObject({ code: 'ENOENT' });
  await expect(
    readFile(path.join(frontRoot, 'build/exports', profile.id + '.docx')),
  ).rejects.toMatchObject({ code: 'ENOENT' });
});

it('exporta sin credenciales ni servicios y conserva las capturas verificadas', async () => {
  const { frontRoot, manifest, profile, configFile, bytes } = await fixture();
  const result = run(frontRoot, [
    'export',
    '--profile',
    profile.id,
    '--accounts',
    configFile,
    '--format',
    'pdf',
  ]);
  expect(result.error).toBeUndefined();
  expect(result.status, result.stderr).toBe(0);
  expect(await readFile(path.join(frontRoot, 'build/exports', profile.id + '.pdf'), 'utf8')).toBe(
    'exported',
  );
  await expect(readFile(path.join(frontRoot, 'browser-started'))).rejects.toMatchObject({
    code: 'ENOENT',
  });
  await expect(
    readFile(path.join(frontRoot, 'build/exports', profile.id + '.docx')),
  ).rejects.toMatchObject({ code: 'ENOENT' });
  for (const image of manifest.images)
    expect(await readFile(path.join(manifest.root, 'images', image))).toEqual(bytes);
});

it.each(['pending', 'missing-image', 'mode'])(
  'exportar rechaza %s sin iniciar captura ni publicar',
  async (condition) => {
    const { frontRoot, manifest, profile, configFile } = await fixture();
    const filename = path.join(manifest.root, 'manifest.json');
    const saved = JSON.parse(await readFile(filename, 'utf8'));
    if (condition === 'pending') saved.status = 'pending';
    else if (condition === 'mode') saved.mode = 'demo';
    else await rm(path.join(manifest.root, 'images', manifest.images[0]!));
    await writeFile(filename, JSON.stringify(saved));
    const result = run(frontRoot, ['export', '--profile', profile.id, '--accounts', configFile]);
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('docs:screenshots');
    await expect(readFile(path.join(frontRoot, 'browser-started'))).rejects.toMatchObject({
      code: 'ENOENT',
    });
    await expect(
      readFile(path.join(frontRoot, 'build/exports', profile.id + '.pdf')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  },
);

it('--all informa las cuentas sin capturas y publica las ediciones listas', async () => {
  const { frontRoot, profile, configFile, accounts } = await fixture();
  await writeFile(
    configFile,
    JSON.stringify({
      baseUrl: 'http://127.0.0.1:1',
      accounts: [...accounts, { ...accounts[0], id: 'sin-capturas' }],
    }),
  );
  const result = run(frontRoot, ['export', '--all', '--accounts', configFile]);
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain('Cuenta omitida: sin-capturas (sin capturas generadas).');
  expect(await readFile(path.join(frontRoot, 'build/exports', profile.id + '.pdf'), 'utf8')).toBe(
    'exported',
  );
  expect(await readFile(path.join(frontRoot, 'build/exports', profile.id + '.docx'), 'utf8')).toBe(
    'exported',
  );
});

it('valida todas las cuentas antes de exportar si hay una edición incompleta', async () => {
  const { frontRoot, profile, configFile, accounts } = await fixture();
  await writeFile(
    configFile,
    JSON.stringify({
      baseUrl: 'http://127.0.0.1:1',
      accounts: [...accounts, { ...accounts[0], id: 'pendiente' }],
    }),
  );
  const pending = path.join(frontRoot, 'docs/user-manual/accounts/pendiente');
  await mkdir(pending, { recursive: true });
  await writeFile(
    path.join(pending, 'manifest.json'),
    JSON.stringify({ id: 'pendiente', mode: 'dev', status: 'pending' }),
  );
  const result = run(frontRoot, ['export', '--all', '--accounts', configFile]);
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('pendiente');
  await expect(
    readFile(path.join(frontRoot, 'build/exports', profile.id + '.pdf')),
  ).rejects.toMatchObject({ code: 'ENOENT' });
  await expect(readFile(path.join(frontRoot, 'browser-started'))).rejects.toMatchObject({
    code: 'ENOENT',
  });
});

it('publica archivos por módulo y retira sólo resultados generados fuera del acceso actual', async () => {
  const { frontRoot, profile, configFile } = await fixture();
  const folder = path.join(frontRoot, 'build/docs/pdf/manuales-vue', profile.id);
  await mkdir(folder, { recursive: true });
  for (const name of [`manual-${profile.id}`, 'compras-materiales', 'notas'])
    await writeFile(path.join(folder, name + '.pdf'), 'anterior');
  const result = run(frontRoot, [
    'export',
    '--profile',
    profile.id,
    '--accounts',
    configFile,
    '--format',
    'pdf',
  ]);
  expect(result.status, result.stderr).toBe(0);
  for (const name of [
    'inicio',
    'almacen-materiales',
    'almacen-consumibles',
    'almacen-mermas',
    'salidas-materiales',
    'salidas-consumibles',
    'salidas-mermas',
  ])
    expect(await readFile(path.join(folder, name + '.pdf'), 'utf8')).toBe('exported');
  for (const name of [`manual-${profile.id}`, 'compras-materiales'])
    await expect(readFile(path.join(folder, name + '.pdf'))).rejects.toMatchObject({
      code: 'ENOENT',
    });
  expect(await readFile(path.join(folder, 'notas.pdf'), 'utf8')).toBe('anterior');
});
