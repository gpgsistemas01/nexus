import { describe, expect, it } from 'vitest';
import ejs from 'ejs';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '../../../../../');
const viewPath = resolve(projectRoot, 'src/views/shared/layout/modal.ejs');

describe('layout compartido de modales CRUD', () => {
  it('solicita a MDB el fondo oscuro para todos los modales que lo reutilizan', async () => {
    const html = await ejs.renderFile(viewPath, {
      modalId: 'crudModal',
      modalTitle: 'Operación CRUD',
      form: { id: 'crudForm', inputs: [] }
    });

    expect(html).toContain('id="crudModal"');
    expect(html).toContain('data-mdb-backdrop="true"');
  });
});
