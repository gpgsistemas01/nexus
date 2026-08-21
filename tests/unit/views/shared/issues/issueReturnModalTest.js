import { describe, expect, it } from 'vitest';
import ejs from 'ejs';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '../../../../../');
const viewPath = resolve(projectRoot, 'src/views/shared/issues/issueReturnModal.ejs');

describe('devolución compartida de los CRUD de salidas', () => {
  it('muestra el material a devolver como información no editable compartida', async () => {
    const html = await ejs.renderFile(viewPath);

    expect(html).toContain('<span id="issueReturnMaterialValue"');
    expect(html).toContain('Material a devolver');
    expect(html).toContain('border rounded p-2 h-100 bg-light');
    expect(html).toContain('d-block small text-muted mb-1');
    expect(html).not.toContain('name="issueReturnMaterialDisplay"');
  });

  it('solicita a MDB el fondo oscuro al abrir la devolución', async () => {
    const html = await ejs.renderFile(viewPath);

    expect(html).toContain('id="issueReturnModal"');
    expect(html).toContain('data-mdb-backdrop="true"');
  });
});
