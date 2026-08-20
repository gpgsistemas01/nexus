import { describe, expect, it } from 'vitest';
import ejs from 'ejs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '../../../../../');
const componentPath = resolve(projectRoot, 'src/views/shared/forms/materialSelect.ejs');

describe('select de material reutilizado por los CRUD de inventario', () => {
  it('renderiza siempre el contrato de material dentro de una columna completa', async () => {
    const html = await ejs.renderFile(componentPath);

    expect(html).toContain('<div class="col-12">');
    expect(html).toContain('id="materialInput"');
    expect(html).toContain('name="materialId"');
    expect(html).toContain('material-select');
  });

  it.each([
    'src/views/pages/warehouse/goodsIssues/goodsIssuesPage.ejs',
    'src/views/pages/warehouse/goodsReceipts/goodsReceiptsPage.ejs'
  ])('el CRUD consumidor activa el componente sin redefinir sus datos: %s', (relativePath) => {
    const view = readFileSync(resolve(projectRoot, relativePath), 'utf8');

    expect(view).toContain('materialSelect: true');
    expect(view).not.toMatch(/itemSelect:\s*\{[^}]*name:\s*'materialId'/s);
    expect(view).not.toMatch(/select:\s*\{[^}]*name:\s*'materialId'/s);
  });
});
