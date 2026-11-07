import { Workbook } from '@sheetkit/node';

export const createSpreadsheet = sheetName => {
    const workbook = new Workbook();
    workbook.setSheetName('Sheet1', sheetName);
    return workbook;
};

export const spreadsheetColumn = number => {
    let column = '';
    for (let value = number; value > 0; value = Math.floor((value - 1) / 26)) {
        column = String.fromCharCode(65 + (value - 1) % 26) + column;
    }
    return column;
};
