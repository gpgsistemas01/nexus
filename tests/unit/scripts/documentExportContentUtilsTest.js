import { describe, expect, it } from 'vitest';
import {
    documentExportAnchor,
    exportedDocumentTitle,
    externalDocumentAnchorFragment,
    externalDocumentLinkLabel,
    getHeadingTitle,
    prepareManualEntry,
    prepareManualImages
} from '../../../scripts/documentExportContentUtils.js';

describe('documentExportContentUtils', () => {
    it('genera anclas compatibles con marcadores de documentos', () => {
        const anchor = documentExportAnchor(
            'docs/user-manual/error-messages.md',
            'errores-de-validación-de-formularios'
        );

        expect(anchor).toMatch(/^nexus_[a-f0-9]{32}$/);
        expect(anchor.length).toBeLessThanOrEqual(40);
        expect(documentExportAnchor(
            'docs/user-manual/error-messages.md',
            'errores-catalogos'
        )).not.toBe(anchor);
    });

    it('deriva un nombre legible del archivo exportado', () => {
        expect(exportedDocumentTitle('manuales/almacen/informacion-general-y-anexos.docx'))
            .toBe('Información general y anexos');
        expect(exportedDocumentTitle('manuales/almacen/almacen-materiales.pdf'))
            .toBe('Almacén de materiales');
        expect(exportedDocumentTitle('manuales/almacen/almacen-consumibles.pdf'))
            .toBe('Almacén de consumibles');
    });

    it('evita repetir la introducción del actor en cada documento modular del manual', () => {
        const content = [
            '---',
            'title: Manual del personal de almacén',
            '---',
            '',
            '# Manual del personal de almacén',
            '',
            '## Datos generales del documento',
            '',
            '| Versión | Sistema | Estado | Fecha | Responsable |',
            '| --- | --- | --- | --- | --- |',
            '| 0.2 | 1.0 | Revisión | 2026-09-10 | Nexus |',
            '',
            '## Responsabilidades y límites',
            '',
            'Contenido común.'
        ].join('\n');

        const prepared = prepareManualEntry(content, 'manuales/almacen/compras.docx');

        expect(prepared).toContain('title: Manual del personal de almacén — Compras');
        expect(prepared).toContain('# Manual del personal de almacén — Compras');
        expect(prepared).not.toContain('Responsabilidades y límites');
        expect(prepareManualEntry(content, 'manuales/almacen/informacion-general-y-anexos.docx'))
            .toBe(content);
    });

    it('resuelve títulos implícitos y anclas explícitas', () => {
        const content = [
            '# Catálogo de mensajes',
            '',
            '<a id="errores-validacion"></a>',
            '## Errores de validación de formularios'
        ].join('\n');

        expect(getHeadingTitle(content, 'catálogo-de-mensajes')).toBe('Catálogo de mensajes');
        expect(getHeadingTitle(content, 'errores-validacion'))
            .toBe('Errores de validación de formularios');
    });

    it('deriva el ancla externa del título de la sección enlazada', () => {
        const targetContent = [
            '# Catálogo de mensajes',
            '',
            '<a id="errores-validacion"></a>',
            '## Errores de validación de formularios'
        ].join('\n');

        expect(externalDocumentAnchorFragment({
            fragment: 'errores-validacion',
            targetContent
        })).toBe('errores-de-validación-de-formularios');
        expect(externalDocumentAnchorFragment({
            fragment: 'ancla-sin-titulo',
            targetContent
        })).toBe('ancla-sin-titulo');
    });

    it('identifica el destino externo sin repetir la etiqueta del enlace fuente', () => {
        const targetContent = '# Compras\n\n## Registro de una compra';
        const linkedOutput = 'manuales/almacen/compras.docx';

        expect(externalDocumentLinkLabel({
            linkedOutput,
            fragment: 'registro-de-una-compra',
            targetContent
        })).toBe('Registro de una compra — Compras');
        expect(externalDocumentLinkLabel({
            linkedOutput,
            fragment: undefined,
            targetContent
        })).toBe('Compras');
    });
});

describe('prepareManualImages', () => {
  it('mantiene separadas las capturas de actores que comparten un procedimiento', () => {
    const content = '![Listado](../../images/materials/01-list-inventory.png)';

    expect(prepareManualImages(content, 'manuales/almacen'))
      .toBe('![Listado](../../images/areas/almacen/materials/01-list-inventory.png)');
    expect(prepareManualImages(content, 'manuales/administrador'))
      .toBe('![Listado](../../images/areas/sistemas/materials/01-list-inventory.png)');
  });

  it('corrige una referencia de otra área sin recurrir a una captura común', () => {
    const content = '![Menú](../../images/areas/sistemas/access/02-menu-main.png)';

    expect(prepareManualImages(content, 'manuales/almacen'))
      .toBe('![Menú](../../images/areas/almacen/access/02-menu-main.png)');
    expect(prepareManualImages(content, 'arquitectura')).toBe(content);
  });

  it('rechaza un actor sin selección explícita de capturas', () => {
    expect(() => prepareManualImages('![Menú](../images/menu.png)', 'manuales/desconocido'))
      .toThrow('Actor del manual sin área de capturas');
  });
});
