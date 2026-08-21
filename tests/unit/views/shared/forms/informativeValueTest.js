import { describe, expect, it } from 'vitest';
import ejs from 'ejs';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '../../../../../');
const componentPath = resolve(projectRoot, 'src/views/shared/forms/informativeValue.ejs');

describe('valor informativo reutilizado por los CRUD operativos', () => {
  it('replica la tarjeta visual de los costos sin crear un control de formulario', async () => {
    const html = await ejs.renderFile(componentPath, {
      value: { id: 'materialValue', label: 'Material a corregir' }
    });

    expect(html).toContain('border rounded p-3 h-100 bg-light');
    expect(html).toContain('d-block small text-muted mb-1');
    expect(html).toContain('<span id="materialValue" class="fw-semibold"');
    expect(html).toContain('Material a corregir');
    expect(html).not.toMatch(/<(input|select|textarea)\b/);
  });
});
