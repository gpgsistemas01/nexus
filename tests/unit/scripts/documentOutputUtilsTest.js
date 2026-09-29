import { describe, expect, it, vi } from 'vitest';
import { removeDocumentOutput } from '../../../scripts/documentOutputUtils.js';

describe('documentOutputUtils', () => {
    it('reintenta la eliminación cuando Windows informa que el documento está ocupado', async () => {
        const busy = Object.assign(new Error('busy'), { code: 'EBUSY' });
        const remove = vi.fn().mockRejectedValueOnce(busy).mockResolvedValueOnce();

        await removeDocumentOutput('build/docs/documento.docx', {
            remove,
            retries: 1,
            retryDelay: 0
        });

        expect(remove).toHaveBeenCalledTimes(2);
    });

    it('explica cómo liberar un documento que permanece bloqueado', async () => {
        const busy = Object.assign(new Error('busy'), { code: 'EBUSY' });

        await expect(removeDocumentOutput('build/docs/documento.docx', {
            remove: vi.fn().mockRejectedValue(busy),
            retries: 0
        })).rejects.toThrow('Cierre el documento en Word, LibreOffice o el Explorador de archivos');
    });
});
