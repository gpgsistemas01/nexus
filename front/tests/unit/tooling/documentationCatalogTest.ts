import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, expect, it } from 'vitest';
import {
  loadDocumentationCatalog,
  parseDocumentationExportArgs,
} from '../../../scripts/documentationCatalog.mjs';

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const createFixture = async (sources: string[]) => {
  const root = await mkdtemp(path.join(tmpdir(), 'nexus-doc-catalog-'));
  roots.push(root);
  await mkdir(path.join(root, 'appendix'));
  for (const name of [
    'index.md',
    'z-intro.md',
    'a-detail.md',
    'appendix/index.md',
    'appendix/code.md',
  ])
    await writeFile(path.join(root, name), `# ${name}\n`);
  await writeFile(
    path.join(root, 'publications.json'),
    JSON.stringify({ sections: { inicio: { title: 'Inicio', sources } } }),
  );
  return root;
};

it('respeta el orden de lectura declarado y expande los anexos con su índice primero', async () => {
  const root = await createFixture(['z-intro.md', 'a-detail.md', 'appendix/']);
  const result = await loadDocumentationCatalog(root);
  expect(result.sections.inicio.sources).toEqual([
    'index.md',
    'z-intro.md',
    'a-detail.md',
    'appendix/index.md',
    'appendix/code.md',
  ]);
  expect(result.completeSources).toEqual(result.sections.inicio.sources);
});

it('detecta una guía nueva que no tiene ubicación en las publicaciones', async () => {
  const root = await createFixture(['z-intro.md', 'appendix/']);
  await expect(loadDocumentationCatalog(root)).rejects.toThrow('a-detail.md');
});

it('impide publicar rutas fuera de docs o incluir dos veces la misma fuente', async () => {
  const outside = await createFixture(['../private.md']);
  await expect(loadDocumentationCatalog(outside)).rejects.toThrow('Fuente documental no permitida');
  const duplicate = await createFixture(['z-intro.md', 'z-intro.md']);
  await expect(loadDocumentationCatalog(duplicate)).rejects.toThrow('Fuente repetida');
});

it('organiza el catálogo real con contexto antes de arquitectura y plan antes de casos', async () => {
  const root = path.resolve('docs');
  const { sections, completeSources } = await loadDocumentationCatalog(root);
  expect(completeSources.indexOf('development/01-getting-started.md')).toBeLessThan(
    completeSources.indexOf('architecture/index.md'),
  );
  expect(
    completeSources.indexOf('requirements/requirements-specification/client-specification.md'),
  ).toBeLessThan(completeSources.indexOf('architecture/index.md'));
  expect(sections.pruebas.sources.indexOf('testing/01-test-plan.md')).toBeLessThan(
    sections.pruebas.sources.indexOf('testing/03-test-cases.md'),
  );
  expect(sections.arquitectura.sources).not.toContain(
    'architecture/views/development/code-reference.md',
  );
  expect(sections.referencia.sources).toContain('architecture/views/development/code-reference.md');
  expect(sections.manual.sources[0]).toBe('user-manual/index.md');
  expect(sections.manual.sources).not.toContain('index.md');
  expect(completeSources.some((source) => source.startsWith('user-manual/'))).toBe(false);
});

it('publica un manual con entrada propia y comprueba sus fuentes sin añadirlo al libro técnico', async () => {
  const root = await createFixture(['z-intro.md', 'a-detail.md', 'appendix/']);
  await mkdir(path.join(root, 'user-manual'));
  await writeFile(path.join(root, 'user-manual/index.md'), '# Manual\n');
  await writeFile(path.join(root, 'user-manual/01-access.md'), '# Acceso\n');
  await writeFile(
    path.join(root, 'publications.json'),
    JSON.stringify({
      sections: {
        inicio: { title: 'Inicio', sources: ['z-intro.md', 'a-detail.md', 'appendix/'] },
        manual: {
          title: 'Manual de usuario',
          entry: 'user-manual/index.md',
          includeInComplete: false,
          sources: ['user-manual/'],
        },
      },
    }),
  );
  const { sections, completeSources } = await loadDocumentationCatalog(root);
  expect(sections.manual.sources).toEqual(['user-manual/index.md', 'user-manual/01-access.md']);
  expect(completeSources).not.toContain('user-manual/index.md');
  await writeFile(path.join(root, 'unlisted.md'), '# Sin catálogo\n');
  await expect(loadDocumentationCatalog(root)).rejects.toThrow('unlisted.md');
});

it.each([
  [[], { section: null, format: 'ambos' }],
  [['pdf'], { section: null, format: 'pdf' }],
  [['completo', 'docx'], { section: null, format: 'docx' }],
  [['inicio'], { section: 'inicio', format: 'ambos' }],
  [['pruebas', 'pdf'], { section: 'pruebas', format: 'pdf' }],
])('resuelve el comando de publicación %j', (args, expected) => {
  expect(parseDocumentationExportArgs(args, ['inicio', 'pruebas'])).toEqual(expected);
});

it.each([['desconocido'], ['pdf', 'inicio'], ['inicio', 'zip'], ['inicio', 'pdf', 'extra']])(
  'rechaza argumentos de publicación ambiguos o inválidos: %j',
  (...args) => {
    expect(() => parseDocumentationExportArgs(args, ['inicio', 'pruebas'])).toThrow('docs:export');
  },
);
