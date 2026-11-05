import { describe, expect, it } from 'vitest';
import {
    getDocumentExportRequest,
    getDocumentOutputPlan
} from '../../../scripts/documentExportFormats.js';

describe('getDocumentOutputPlan', () => {
    it('genera todos los paquetes en ambos formatos de forma predeterminada', () => {
        expect(getDocumentExportRequest([])).toEqual({
            publication: 'todos',
            document: null,
            format: 'ambos',
            checkOnly: false,
            checkSourcesOnly: false
        });
        expect(getDocumentOutputPlan()).toEqual({
            generateDocx: true,
            generatePdf: true
        });
    });

    it('conserva los filtros de paquete, formato y validación', () => {
        expect(getDocumentExportRequest(['arquitectura', 'docx', '--check'])).toEqual({
            publication: 'arquitectura',
            document: null,
            format: 'docx',
            checkOnly: true,
            checkSourcesOnly: false
        });
    });

    it('conserva la sección para generar únicamente ese documento', () => {
        expect(getDocumentExportRequest(['arquitectura', 'backend', 'pdf'])).toEqual({
            publication: 'arquitectura',
            document: 'backend',
            format: 'pdf',
            checkOnly: false,
            checkSourcesOnly: false
        });
        expect(getDocumentExportRequest(['arquitectura', 'backend', '--check'])).toEqual({
            publication: 'arquitectura',
            document: 'backend',
            format: 'ambos',
            checkOnly: true,
            checkSourcesOnly: false
        });
    });

    it('valida sólo fuentes sin publicar cuando las capturas se preparan aparte', () => {
        expect(getDocumentExportRequest(['manual-vue', 'manual-usuario', 'ambos', '--check-sources'])).toEqual({
            publication: 'manual-vue',
            document: 'manual-usuario',
            format: 'ambos',
            checkOnly: true,
            checkSourcesOnly: true
        });
    });

    it('genera sólo el entregable DOCX cuando se solicita docx', () => {
        expect(getDocumentOutputPlan('docx')).toEqual({
            generateDocx: true,
            generatePdf: false
        });
    });

    it('conserva el DOCX usado para generar un PDF', () => {
        expect(getDocumentOutputPlan('pdf')).toEqual({
            generateDocx: true,
            generatePdf: true
        });
    });

    it('genera explícitamente DOCX y PDF cuando se solicitan ambos', () => {
        expect(getDocumentOutputPlan('ambos')).toEqual({
            generateDocx: true,
            generatePdf: true
        });
    });
});
