import { describe, expect, it } from 'vitest';
import {
    exportedDocumentTitle,
    externalDocumentLinkLabel,
    getHeadingTitle
} from '../../../scripts/documentExportContentUtils.js';

describe('documentExportContentUtils', () => {
    it('deriva un nombre legible del archivo exportado', () => {
        expect(exportedDocumentTitle('manuales/almacen/informacion-general-y-anexos.docx'))
            .toBe('Información general y anexos');
        expect(exportedDocumentTitle('manuales/almacen/almacen-materiales.pdf'))
            .toBe('Almacén de materiales');
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

    it('indica la sección cuando el enlace tiene ancla y el documento cuando no la tiene', () => {
        const targetContent = '# Compras\n\n## Registro de una compra';
        const linkedOutput = 'manuales/almacen/compras.docx';

        expect(externalDocumentLinkLabel({
            label: 'registro',
            linkedOutput,
            fragment: 'registro-de-una-compra',
            targetContent
        })).toBe('registro — sección «Registro de una compra» del documento «Compras»');
        expect(externalDocumentLinkLabel({
            label: 'compras',
            linkedOutput,
            fragment: undefined,
            targetContent
        })).toBe('compras — documento «Compras»');
    });
});
