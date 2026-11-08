import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setImmediate } from 'node:timers/promises';
import { createSpreadsheet } from './spreadsheetUtils.js';
import { getMexicoMonthYearParts } from './formattersUtils.js';

const ROW_YIELD_INTERVAL = 250;

export const buildReportFilename = ({ filename } = {}) => {
    const { month, year } = getMexicoMonthYearParts();
    return [filename, month, year].join('_');
};

/**
 * Creates a numeric spreadsheet cell whose stored value keeps previews and
 * non-calculating readers useful while Excel recalculates the supplied formula.
 */
export const createFormulaCell = (formula, value = 0) => ({
    formula,
    result: Number(value) || 0
});

const writeWorkbookFile = async ({ filePath, sheetName, data, abortController }) => {
    const { signal } = abortController;
    signal.throwIfAborted();
    const placeholder = sheetName === 'Sheet1' ? 'Datos' : 'Sheet1';
    const workbook = createSpreadsheet(placeholder);
    const worksheet = workbook.newStreamWriter(sheetName);
    worksheet.setFreezePanes('A2');
    const headerStyle = workbook.addStyle({ font: { bold: true }, alignment: { vertical: 'center', wrapText: true } });
    let applied = false;
    try {
        let rowCount = 0;
        for await (const row of data) {
            signal.throwIfAborted();
            if (rowCount === 0) {
                row.forEach((label, index) => worksheet.setColWidth(index + 1, Math.min(40, Math.max(14, String(label ?? '').length + 4))));
            }
            const values = row.map(value => value && typeof value === 'object' && typeof value.formula === 'string'
                ? { type: 'formula', formula: value.formula, result: { valueType: 'number', numberValue: value.result } }
                : value ?? null);
            if (rowCount === 0) {
                worksheet.writeRowWithStyle(1, values, headerStyle);
            } else worksheet.writeRow(rowCount + 1, values);
            // Las filas se vacían al temporal nativo; ceder el loop permite atender otras solicitudes.
            if (++rowCount % ROW_YIELD_INTERVAL === 0) {
                await setImmediate(undefined, { signal });
            }
        }
        signal.throwIfAborted();
        workbook.applyStreamWriter(worksheet);
        applied = true;
        workbook.deleteSheet(placeholder);
        await workbook.save(filePath);
        signal.throwIfAborted();
    } finally {
        // Transferir y retirar la hoja libera el temporal nativo sin esperar al recolector de JS.
        if (!applied) workbook.applyStreamWriter(worksheet);
        if (workbook.sheetNames.length === 1) workbook.newSheet(placeholder);
        workbook.deleteSheet(sheetName);
    }
};

export const sendExcelReport = async ({ res, data, sheetName, filename }) => {
    const abortController = new AbortController();
    const onClose = () => {
        if (!res.writableFinished) abortController.abort();
    };
    res.once('close', onClose);
    let directory;
    try {
        directory = await mkdtemp(join(tmpdir(), 'nexus-report-'));
        const filePath = join(directory, 'report.xlsx');
        await writeWorkbookFile({ filePath, sheetName, data, abortController });
        await new Promise((resolve, reject) => res.download(
            filePath,
            `${buildReportFilename({ filename })}.xlsx`,
            error => error ? reject(error) : resolve()
        ));
        return res;
    } finally {
        res.off('close', onClose);
        if (directory) await rm(directory, { recursive: true, force: true });
    }
};
