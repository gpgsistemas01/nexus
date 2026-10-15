import { mkdtemp, rm } from 'node:fs/promises';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { finished } from 'node:stream/promises';
import { setImmediate } from 'node:timers/promises';
import ExcelJS from 'exceljs';
import { getMexicoMonthYearParts } from './formattersUtils.js';

export const buildReportFilename = ({ filename, separator = '_', order = 'month-year' } = {}) => {
    const { month, year } = getMexicoMonthYearParts();
    const dateParts = order === 'year-month' ? [year, month] : [month, year];

    return [filename, dateParts.join(separator)].join('_');
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
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
        filename: filePath,
        useSharedStrings: false,
        zip: { zlib: { level: 1 } }
    });
    const closed = finished(workbook.stream, { cleanup: true }).catch(error => abortController.abort(error));
    workbook.zip.once('error', error => abortController.abort(error));
    const failure = Promise.withResolvers();
    const onAbort = () => failure.reject(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });

    const writing = async () => {
        const worksheet = workbook.addWorksheet(sheetName);
        let rowCount = 0;
        for await (const row of data) {
            signal.throwIfAborted();
            worksheet.addRow(row).commit();
            // Ceder el loop permite vaciar las colas de escritura sin retener todas las filas.
            if (++rowCount % 250 === 0) {
                await setImmediate(undefined, { signal });
                if (workbook.stream.writableNeedDrain) await once(workbook.stream, 'drain', { signal });
            }
        }
        signal.throwIfAborted();
        worksheet.commit();
        await workbook.commit();
    };
    try {
        await Promise.race([writing(), failure.promise]);
        await closed;
        signal.throwIfAborted();
    } catch (error) {
        abortController.abort(error);
        workbook.zip.abort();
        workbook.stream.destroy();
        await closed;
        throw error;
    } finally {
        signal.removeEventListener('abort', onAbort);
    }
};

export const sendExcelReport = async ({ res, data, sheetName, filename, filenameOptions = {} }) => {
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
            `${buildReportFilename({ filename, ...filenameOptions })}.xlsx`,
            error => error ? reject(error) : resolve()
        ));
        return res;
    } finally {
        res.off('close', onClose);
        if (directory) await rm(directory, { recursive: true, force: true });
    }
};
