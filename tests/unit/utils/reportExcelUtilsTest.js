import xlsx from 'xlsx';
import { describe, expect, it } from 'vitest';

import { createFormulaCell, createWorkbookBuffer } from '../../../src/utils/reportExcelUtils.js';

describe('generación de reportes Excel de consultas CRUD', () => {
    it('conserva el valor calculado y exporta la fórmula para que la hoja la recalcule', () => {
        const formulaCell = createFormulaCell('A2+B2', 5);
        const buffer = createWorkbookBuffer({
            sheetName: 'Reporte',
            data: [
                ['Inicial', 'Movimiento', 'Resultado'],
                [2, 3, formulaCell]
            ]
        });
        const workbook = xlsx.read(buffer, { type: 'buffer' });

        expect(formulaCell).toEqual({ f: 'A2+B2', t: 'n', v: 5 });
        expect(workbook.Sheets.Reporte.C2).toMatchObject({ f: 'A2+B2', t: 'n', v: 5 });
    });
});
