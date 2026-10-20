import { describe, expect, it, vi } from 'vitest';
import { validatePdfOutput } from '../../../scripts/pdfExportUtils.js';

describe('validatePdfOutput', () => {
    it('acepta un PDF con encabezado y marcador final', async () => {
        const readFileContent = vi.fn(async () => Buffer.from(
            '%PDF-1.7\n1 0 obj\n<<>>\nendobj\nstartxref\n9\n%%EOF\n'
        ));

        await expect(validatePdfOutput('/tmp/documento.pdf', readFileContent))
            .resolves.toBe('/tmp/documento.pdf');
    });

    it('rechaza una salida que no es PDF', async () => {
        const readFileContent = vi.fn(async () => Buffer.from('error de conversión'));

        await expect(validatePdfOutput('/tmp/documento.pdf', readFileContent))
            .rejects.toThrow('estructura PDF completa');
    });

    it('rechaza un PDF truncado', async () => {
        const readFileContent = vi.fn(async () => Buffer.from('%PDF-1.7\n1 0 obj\n'));

        await expect(validatePdfOutput('/tmp/documento.pdf', readFileContent))
            .rejects.toThrow('estructura PDF completa');
    });
});
