import ExcelJS from 'exceljs';
import { readSheet } from 'read-excel-file/node';

// Mantiene posiciones y ceros; las fórmulas se comprueban además en la celda original.
export const readExcelReport = async (buffer, sheetName) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = sheetName ? workbook.getWorksheet(sheetName) : workbook.worksheets[0];
  if (!sheet) throw new Error(`No existe la hoja esperada: ${sheetName}`);
  // Un lector independiente verifica valores almacenados, incluido el cero de
  // fórmulas que ExcelJS omite al exponer cell.value.
  const rows = await readSheet(buffer, sheet.name);
  return { workbook, sheet, rows };
};
