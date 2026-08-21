import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '../../../../../');
const publicPagesRoot = join(projectRoot, 'src/public/js/pages');
const viewPagesRoot = join(projectRoot, 'src/views/pages');
const viewsRoot = join(projectRoot, 'src/views');
const sharedViewsRoot = join(viewsRoot, 'shared');

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

  it('ubica cada partial compartido dentro de una categoría', () => {
    const looseSharedPartials = readdirSync(sharedViewsRoot, { withFileTypes: true })
      .filter(entry => entry.isFile() && entry.name.endsWith('.ejs'))
      .map(entry => entry.name);

    expect(looseSharedPartials).toEqual([]);
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
  it.each([
    {
      entryPoint: 'warehouse/goodsIssues/goodsIssuesPage.js',
      formModule: 'warehouse/goodsIssues/goodsIssueForm.js',
      modalModule: 'warehouse/goodsIssues/goodsIssueModal.js',
      openMethod: 'openGoodsIssueModal',
      addMethod: 'addGoodsIssueMaterial'
    },
    {
      entryPoint: 'warehouse/goodsReceipts/goodsReceiptsPage.js',
      formModule: 'warehouse/goodsReceipts/goodsReceiptForm.js',
      modalModule: 'warehouse/goodsReceipts/goodsReceiptModal.js',
      openMethod: 'openGoodsReceiptModal',
      addMethod: 'addGoodsReceiptMaterial'
    },
    {
      entryPoint: 'warehouse/wasteIssues/wasteIssuesPage.js',
      formModule: 'warehouse/wasteIssues/wasteIssueForm.js',
      modalModule: 'warehouse/wasteIssues/wasteIssueModal.js',
      openMethod: 'openWasteIssueModal',
      addMethod: 'addWaste'
    }
  ])('separa entry point, formulario y modal CRUD de $entryPoint', ({ entryPoint, formModule, modalModule, openMethod, addMethod }) => {
    const entryPointSource = readFileSync(join(publicPagesRoot, entryPoint), 'utf8');
    const formModuleSource = readFileSync(join(publicPagesRoot, formModule), 'utf8');
    const modalModuleSource = readFileSync(join(publicPagesRoot, modalModule), 'utf8');

    expect(entryPointSource).toContain(`from './${ modalModule.split('/').at(-1) }'`);
    expect(entryPointSource).toContain(openMethod);
    expect(formModuleSource).toMatch(/use(Form|IssueForm)\(\{/);
    expect(formModuleSource).toContain(`const ${ addMethod }`);
    expect(formModuleSource).not.toContain(`export const ${ openMethod }`);
    expect(modalModuleSource).toContain(`export const ${ openMethod }`);
    expect(modalModuleSource).not.toMatch(/use(Form|IssueForm)\(\{/);
    expect(modalModuleSource).not.toContain(`const ${ addMethod }`);
  });

  it('reserva los archivos Page para composición y delega la lógica de formularios', () => {
    const pageFilesWithFormCoordination = collectFiles(publicPagesRoot, 'Page.js')
      .filter(file => /use(Form|IssueForm)\(\{/.test(readFileSync(file, 'utf8')))
      .map(file => relative(publicPagesRoot, file));

    expect(pageFilesWithFormCoordination).toEqual([]);
  });

  it('mantiene módulos Fields sólo cuando formulario y modal comparten grupos de campos', () => {
    const pageModules = collectFiles(publicPagesRoot, '.js');
    const fieldModulesWithoutSharedConsumers = pageModules
      .filter(file => file.endsWith('Fields.js'))
      .filter(fieldModule => {
        const localImport = `from './${ fieldModule.split(sep).at(-1) }'`;
        const consumers = pageModules.filter(file => readFileSync(file, 'utf8').includes(localImport));

        return consumers.length < 2;
      })
      .map(file => relative(publicPagesRoot, file));

    expect(fieldModulesWithoutSharedConsumers).toEqual([]);
  });

  it('evita entry points Page que sólo envuelven un import propietario', () => {
    const importOnlyPageFiles = collectFiles(publicPagesRoot, 'Page.js')
      .filter(file => /^import ['"]\.\/[^'"]+['"];?$/.test(readFileSync(file, 'utf8').trim()))
      .map(file => relative(publicPagesRoot, file));

    expect(importOnlyPageFiles).toEqual([]);
  });

});
