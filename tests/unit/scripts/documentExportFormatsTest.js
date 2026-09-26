import { describe, expect, it } from 'vitest';
import {
    getDocumentExportRequest,
    getDocumentOutputPlan
} from '../../../scripts/documentExportFormats.js';

describe('getDocumentOutputPlan', () => {
    it('genera todos los paquetes en ambos formatos de forma predeterminada', () => {
        expect(getDocumentExportRequest([])).toEqual({
            publication: 'todos',
            format: 'ambos',
            checkOnly: false
        });
        expect(getDocumentOutputPlan()).toEqual({
            generateDocx: true,
            generatePdf: true
        });
    });

    it('conserva los filtros de paquete, formato y validación', () => {
        expect(getDocumentExportRequest(['arquitectura', 'docx', '--check'])).toEqual({
            publication: 'arquitectura',
            format: 'docx',
            checkOnly: true
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
