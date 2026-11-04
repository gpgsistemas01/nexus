import { mkdtemp, mkdir, writeFile, readFile, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { manualAccountDirectory, prepareManualDirectory } from '../../../scripts/manual/paths.mjs';

const roots: string[] = [];
const temporaryRoot = async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'nexus-manual-path-'));
  roots.push(root);
  return root;
};
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

it('guarda cada cuenta bajo el manual y rechaza salir de ese directorio', async () => {
  const root = await temporaryRoot();
  expect(manualAccountDirectory(root, 'cuenta-uno')).toBe(
    path.join(root, 'docs/user-manual/accounts/cuenta-uno'),
  );
  expect(() => manualAccountDirectory(root, '../privado')).toThrow('inválido');
});

it('traslada una edición anterior conservando imágenes, estado y huellas', async () => {
  const root = await temporaryRoot();
  const previous = path.join(root, 'build/manuals/cuenta-uno');
  await mkdir(path.join(previous, 'images'), { recursive: true });
  await writeFile(path.join(previous, 'images/01-login.png'), 'captura anterior');
  await writeFile(
    path.join(previous, 'manifest.json'),
    JSON.stringify({
      root: previous,
      id: 'cuenta-uno',
      status: 'pending',
      revision: 'revision-anterior',
    }),
  );
  const current = await prepareManualDirectory(root, 'cuenta-uno');
  expect(await readFile(path.join(current, 'images/01-login.png'), 'utf8')).toBe(
    'captura anterior',
  );
  expect(JSON.parse(await readFile(path.join(current, 'manifest.json'), 'utf8'))).toEqual({
    root: current,
    id: 'cuenta-uno',
    status: 'pending',
    revision: 'revision-anterior',
  });
  await expect(access(previous)).rejects.toMatchObject({ code: 'ENOENT' });
  expect(await prepareManualDirectory(root, 'cuenta-uno')).toBe(current);
});

it('no sobrescribe una edición nueva si aún existe otra en build', async () => {
  const root = await temporaryRoot();
  const current = manualAccountDirectory(root, 'cuenta-uno');
  const previous = path.join(root, 'build/manuals/cuenta-uno');
  for (const directory of [current, previous]) await mkdir(directory, { recursive: true });
  await writeFile(path.join(current, 'manifest.json'), 'edición nueva');
  await writeFile(path.join(previous, 'manifest.json'), 'edición anterior');
  expect(await prepareManualDirectory(root, 'cuenta-uno')).toBe(current);
  expect(await readFile(path.join(current, 'manifest.json'), 'utf8')).toBe('edición nueva');
  expect(await readFile(path.join(previous, 'manifest.json'), 'utf8')).toBe('edición anterior');
});
