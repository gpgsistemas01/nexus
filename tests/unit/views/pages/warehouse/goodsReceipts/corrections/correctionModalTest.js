import { describe, expect, it } from 'vitest';
import ejs from 'ejs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '../../../../../../../');
const viewPath = resolve(
  projectRoot,
  'src/views/pages/warehouse/goodsReceipts/corrections/correctionModal.ejs'
);
const coordinatorPath = resolve(
  projectRoot,
  'src/public/js/pages/warehouse/goodsReceipts/corrections/correctionModal.js'
);

describe('corrección de detalles del CRUD de entradas de compra', () => {
  it('muestra el material corregido como información no editable', async () => {
    const html = await ejs.renderFile(viewPath);

    expect(html).toContain('<span id="correctionMaterialValue"');
    expect(html).toContain('Material a corregir');
    expect(html).toContain('border rounded p-3 h-100 bg-light');
    expect(html).toContain('d-block small text-muted mb-1');
    expect(html).not.toContain('name="correctionMaterialDisplay"');
  });

  it('carga en el campo visible la identidad normalizada de la fila seleccionada', () => {
    const coordinator = readFileSync(coordinatorPath, 'utf8');

    expect(coordinator).toContain(
      "document.querySelector('#correctionMaterialValue').textContent = detail.name;"
    );
  });
});
