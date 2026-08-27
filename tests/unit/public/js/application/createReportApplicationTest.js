import { describe, expect, it, vi } from 'vitest';

import { createReportApplication } from '../../../../../src/public/js/application/createReportApplication.js';

describe('factory de exportación de reportes de los CRUD', () => {
    it('reutiliza el mismo caso de uso y conserva los parámetros del reporte', async () => {
        const request = vi.fn().mockResolvedValue({ data: new Blob(['report']) });
        const exportReport = createReportApplication(request);
        const input = { context: 'material', params: { search: 'harina' } };

        const result = await exportReport(input);

        expect(request).toHaveBeenCalledWith(input);
        expect(result).toBeInstanceOf(Blob);
    });
});
