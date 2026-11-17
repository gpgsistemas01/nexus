import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { mkdtemp, rm, appendFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setImmediate } from 'node:timers/promises';
import { createSpreadsheet } from './spreadsheetUtils.js';
import { getMexicoMonthYearParts } from './formattersUtils.js';
import { ReportMonthInvalid } from '../errors/reportError.js';

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

// Agrupa en temporales para conservar memoria acotada incluso con consultas desordenadas.
export const buildMonthlyReportSheets = async function* (rows, { buildData, sheetName, signal }) {
    const directory = await mkdtemp(join(tmpdir(), 'nexus-months-'));
    const months = new Set();
    const pending = new Map();
    const flush = async () => {
        for (const [month, lines] of pending) await appendFile(join(directory, month + '.jsonl'), lines.join(''));
        pending.clear();
    };
    try {
        let count = 0;
        for await (const row of rows) {
            signal?.throwIfAborted();
            const month = row.reportMonth ?? 'sin-fecha';
            if (!/^(?:\d{4}-\d{2}|sin-fecha)$/.test(month)) throw new ReportMonthInvalid();
            months.add(month);
            if (!pending.has(month)) pending.set(month, []);
            pending.get(month).push(JSON.stringify(row) + '\n');
            if (++count % ROW_YIELD_INTERVAL === 0) await flush();
        }
        await flush();
        if (!months.size) { yield { sheetName, data: buildData([]) }; return; }
        for (const month of [...months].sort()) {
            const source = async function* () {
                const input = createReadStream(join(directory, month + '.jsonl'));
                const lines = createInterface({ input, crlfDelay: Infinity });
                try { for await (const line of lines) { signal?.throwIfAborted(); yield JSON.parse(line); } }
                finally { lines.close(); input.destroy(); }
            };
            yield { sheetName: month === 'sin-fecha' ? sheetName : month, data: buildData(source()) };
        }
    } finally { await rm(directory, { recursive: true, force: true }); }
};

const writeWorkbookFile = async ({ filePath, sheetName, data, sheets, abortController }) => {
    const { signal } = abortController;
    signal.throwIfAborted();
    const placeholder = '__reporte__';
    const workbook = createSpreadsheet(placeholder);
    const headerStyle = workbook.addStyle({ font: { bold: true }, alignment: { vertical: 'center', wrapText: true } });
    try {
        for await (const sheet of sheets ?? [{ sheetName, data }]) {
            signal.throwIfAborted();
            const worksheet = workbook.newStreamWriter(sheet.sheetName);
            worksheet.setFreezePanes('A2');
            try {
                let rowCount = 0;
                for await (const row of sheet.data) {
                    signal.throwIfAborted();
                    if (rowCount === 0) row.forEach((label, index) => worksheet.setColWidth(index + 1, Math.min(40, Math.max(14, String(label ?? '').length + 4))));
                    const values = row.map(value => value && typeof value === 'object' && typeof value.formula === 'string'
                        ? { type: 'formula', formula: value.formula, result: { valueType: 'number', numberValue: value.result } }
                        : value ?? null);
                    if (rowCount === 0) worksheet.writeRowWithStyle(1, values, headerStyle);
                    else worksheet.writeRow(rowCount + 1, values);
                    if (++rowCount % ROW_YIELD_INTERVAL === 0) await setImmediate(undefined, { signal });
                }
            } finally { workbook.applyStreamWriter(worksheet); }
        }
        signal.throwIfAborted();
        workbook.deleteSheet(placeholder);
        await workbook.save(filePath);
        signal.throwIfAborted();
    } finally {
        // Libera todos los temporales nativos, también ante errores o desconexión.
        if (!workbook.sheetNames.includes(placeholder)) workbook.newSheet(placeholder);
        for (const name of [...workbook.sheetNames]) if (name !== placeholder) workbook.deleteSheet(name);
    }
};

export const sendExcelReport = async ({ res, data, sheets, sheetName, filename }) => {
    const abortController = new AbortController();
    const onClose = () => {
        if (!res.writableFinished) abortController.abort();
    };
    res.once('close', onClose);
    let directory;
    try {
        directory = await mkdtemp(join(tmpdir(), 'nexus-report-'));
        const filePath = join(directory, 'report.xlsx');
        await writeWorkbookFile({ filePath, sheetName, data, sheets: typeof sheets === 'function' ? sheets(abortController.signal) : sheets, abortController });
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
