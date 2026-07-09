import xlsx from 'xlsx';
import { getMexicoMonthYearParts } from './formattersUtils.js';

export const buildReportFilename = ({ filename, separator = '_', order = 'month-year' } = {}) => {
    const { month, year } = getMexicoMonthYearParts();
    const dateParts = order === 'year-month' ? [year, month] : [month, year];

    return [filename, dateParts.join(separator)].join('_');
};

export const createWorkbookBuffer = ({ sheetName, data }) => {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet(data);

    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

    return xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
};

export const sendExcelBuffer = ({ res, buffer, filename }) => {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${ filename }.xlsx"`);

    return res.send(buffer);
};

export const sendExcelReport = ({ res, data, sheetName, filename, filenameOptions = {} }) => sendExcelBuffer({
    res,
    buffer: createWorkbookBuffer({ sheetName, data }),
    filename: buildReportFilename({ filename, ...filenameOptions })
});
