import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { MANUALS } from '../../../scripts/manualPublicationConfig.js';
import { prepareManualNarration, prepareManualSource } from '../../../scripts/manualPublicationContent.js';
import { captures, validateInventory } from '../../../scripts/manualScreenshotInventory.js';

const source = 'docs/user-manual/cases/catalogs/07-cap-cat-sup-01-list.md';
const supplierContent = fs.readFileSync(source, 'utf8');

describe('publicación de manuales por perfil', () => {
  it('publica imágenes del área autorizada sin incorporar acciones administrativas a Almacén', () => {
    const warehouse = prepareManualSource(supplierContent, source, 'manuales/almacen/proveedores.docx');
    const administrator = prepareManualSource(supplierContent, source, 'manuales/administrador/proveedores.docx');

    expect(warehouse).toContain('images/areas/almacen/suppliers/01-list.png');
    expect(warehouse).toContain('<a id="CAP-CAT-SUP-01-LIST-ALMACEN"></a>');
    expect(warehouse).not.toContain('CAP-CAT-SUP-04-EXPORT');
    expect(warehouse).not.toContain('Editar registro');
    expect(administrator).toContain('images/areas/sistemas/suppliers/04-export-report.png');
    expect(administrator).toContain('Editar registro');
  });

  it('rechaza una captura ajena al perfil en vez de reutilizar una imagen común', () => {
    expect(() => prepareManualSource(
      '![CAP-CAT-MAT-04-STOCK: ajuste](../../images/materials/04-adjustment-stock.png)',
      source,
      'manuales/almacen/almacen-materiales.docx'
    )).toThrow('CAP-CAT-MAT-04-STOCK-ALMACEN');
  });

  it('selecciona los módulos visibles y deja los ajustes sólo en Sistemas', () => {
    const warehouse = MANUALS['manual-almacen'].parts;
    const administrator = MANUALS['manual-administrador'].parts;

    for (const module of ['personas', 'clientes', 'proveedores', 'compras-materiales', 'compras-consumibles', 'salidas-consumibles']) {
      expect(warehouse[module], module).toBeDefined();
      expect(administrator[module], module).toBeDefined();
    }
    const isAdjustment = file => /(?:mat-04|con-05|was-04)-stock\.md$/.test(file);
    expect(Object.values(warehouse).flat().some(isAdjustment)).toBe(false);
    expect(Object.values(administrator).flat().filter(isAdjustment)).toHaveLength(3);
  });

  it('mantiene identificadores y destinos únicos en el inventario compartido', () => {
    expect(() => validateInventory()).not.toThrow();
    expect(new Set(captures.map(capture => capture.id)).size).toBe(captures.length);
    const warehouseCases = captures.filter(capture => capture.area === 'almacen')
      .flatMap(capture => capture.useCases);
    expect(warehouseCases).not.toContain('CU-CAT-04');
    expect(warehouseCases).not.toContain('CU-CAT-08');
  });

  it('relaciona cada captura requerida con el inventario del perfil y cubre cada módulo', () => {
    for (const { directory, parts } of Object.values(MANUALS)) {
      for (const [module, sources] of Object.entries(parts)) {
        let images = 0;
        for (const document of sources) {
          const content = fs.readFileSync(path.resolve(document), 'utf8');
          const prepared = prepareManualSource(content, document, `${directory}/${module}.docx`);
          images += [...prepared.matchAll(/!\[/g)].length;
        }
        if (module !== 'informacion-general-y-anexos') expect(images, `${directory}/${module}`).toBeGreaterThan(0);
      }
    }
  });

  it('conserva las anclas de trazabilidad y publica una explicación sin códigos técnicos', () => {
    const content = '<a id="CAP-AUT-01-LOGIN"></a>\n# 1. CAP-AUT-01-LOGIN — Iniciar sesión\n\n**Casos de uso:** `CU-AUT-01`\n\n![CAP-AUT-01-LOGIN-ALMACEN: acceso](imagen.png)';
    const prepared = prepareManualNarration(content);

    expect(prepared).toContain('# Iniciar sesión');
    expect(prepared).toContain('<a id="CAP-AUT-01-LOGIN"></a>');
    expect(prepared).toContain('![acceso]');
    expect(prepared).not.toContain('CU-AUT-01');
  });
});
