import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '../../../../../');
const publicPagesRoot = join(projectRoot, 'src/public/js/pages');
const viewPagesRoot = join(projectRoot, 'src/views/pages');
const viewsRoot = join(projectRoot, 'src/views');

const collectFiles = (directory, extension) => readdirSync(directory, { withFileTypes: true })
  .flatMap(entry => {
    const entryPath = join(directory, entry.name);

    return entry.isDirectory()
      ? collectFiles(entryPath, extension)
      : entry.name.endsWith(extension) ? [entryPath] : [];
  });

const findLooseFiles = ({ root, extension }) => collectFiles(root, extension)
  .map(file => relative(root, file))
  .filter(file => file.split(sep).length < 3);

describe('page structure', () => {
  it('ubica cada módulo público dentro de dominio y recurso', () => {
    expect(findLooseFiles({ root: publicPagesRoot, extension: '.js' })).toEqual([]);
  });

  it('ubica cada vista o partial propietario dentro de dominio y recurso', () => {
    expect(findLooseFiles({ root: viewPagesRoot, extension: '.ejs' })).toEqual([]);
  });

  it('mantiene válidas las rutas de entry points declaradas por las vistas', () => {
    const missingEntryPoints = collectFiles(viewsRoot, '.ejs')
      .flatMap(file => [...readFileSync(file, 'utf8').matchAll(/src="(\/js\/pages\/[^"]+\.js)"/g)])
      .map(match => match[1])
      .filter(publicPath => !existsSync(join(projectRoot, 'src/public', publicPath)));

    expect(missingEntryPoints).toEqual([]);
  });

  it('mantiene válidas las rutas relativas de partials EJS', () => {
    const missingPartials = collectFiles(viewsRoot, '.ejs').flatMap(file => (
      [...readFileSync(file, 'utf8').matchAll(/include\(['"]([^'"]+)['"]/g)]
        .map(match => resolve(dirname(file), `${ match[1] }.ejs`))
        .filter(partialPath => !existsSync(partialPath))
        .map(partialPath => relative(projectRoot, partialPath))
    ));

    expect(missingPartials).toEqual([]);
  });
});
