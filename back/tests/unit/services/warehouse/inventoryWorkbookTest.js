import { describe, expect, it } from 'vitest';
import { deflateRawSync } from 'node:zlib';
import { inventoryWorkbook } from '../../../helpers/inventoryImportFixture.js';
import { getImportConfig } from '../../../../src/services/warehouse/imports/inventoryImportConfig.js';
import { processInventoryWorkbook } from '../../../../src/services/warehouse/imports/inventoryWorkbookService.js';
import { readExcelReport } from '../../../helpers/readExcelReport.js';

const config = getImportConfig('materials', 'create');
const catalogs = { suppliers: [], presentations: [], units: [], materials: [] };
const read = bytes => processInventoryWorkbook({ action: 'read', config, bytes });
describe('fronteras y contenido del libro de inventario', () => {
    it('el informe de errores contiene sólo sus columnas y conserva nombres como texto', async () => {
        const rows = [{ row: 3, name: '=1+1', column: 'cantidad_inicial', message: 'Usa unidades enteras.' },
            { row: 4, name: 'Lona', column: 'nombre', message: 'El registro está repetido.' }];
        const bytes = await processInventoryWorkbook({ action: 'errors', rows });
        const report = await readExcelReport(Buffer.from(bytes));
        expect(report.workbook.worksheets.map(sheet => sheet.name)).toEqual(['Datos']);
        expect(report.rows).toEqual([['fila', 'nombre', 'columna', 'mensaje'],
            ...rows.map(row => [row.row, row.name, row.column, row.message])]);
        expect(report.sheet.getCell('B2').value).toBe('=1+1');
        await expect(read(bytes)).rejects.toMatchObject({ code: 'INVENTORY_IMPORT_FILE' });
    });
    it('admite 100 filas, ignora vacías y conserva tipos de las celdas', async () => {
        const rows = Array.from({ length: 100 }, (_, index) => ({ name: `Material ${index}`, maxUnitCost: 12.123456, isActive: true }));
        const parsed = await read(await inventoryWorkbook({ rows: [{}, ...rows] }));
        expect(parsed).toHaveLength(100);
        expect(parsed[0]).toMatchObject({ row: 3, values: { name: 'Material 0', maxUnitCost: 12.123456, isActive: true } });
    });
    it('rechaza 101 filas antes de validar catálogos', async () => {
        await expect(read(await inventoryWorkbook({ rows: Array.from({ length: 101 }, () => ({ name: 'Material' })) })))
            .rejects.toMatchObject({ code: 'INVENTORY_IMPORT_LIMIT' });
    });
    it.each([
        ['fórmula', book => { book.getWorksheet('Datos').getCell('A2').value = { formula: '1+1', result: 2 }; }],
        ['encabezado', book => { book.getWorksheet('Datos').getCell('A1').value = 'otro'; }],
        ['recurso', book => { book.getWorksheet('Instrucciones').getCell('B2').value = 'wastes'; }],
        ['modo', book => { book.getWorksheet('Instrucciones').getCell('B3').value = 'update'; }],
        ['hoja extra', book => { book.addWorksheet('Oculta'); }],
        ['texto enriquecido', book => { book.getWorksheet('Datos').getCell('A2').value = { richText: [{ text: 'Material' }] }; }],
    ])('rechaza %s sin interpretar su contenido', async (_name, alter) => {
        await expect(read(await inventoryWorkbook({ rows: [{ name: 'Material' }], alter })))
            .rejects.toMatchObject({ code: 'INVENTORY_IMPORT_FILE' });
    });
    it('rechaza un libro vacío, corrupto y mayor al límite', async () => {
        await expect(read(await inventoryWorkbook({ rows: [] }))).rejects.toMatchObject({ code: 'INVENTORY_IMPORT_FILE' });
        await expect(read(Buffer.from('esto no es XLSX'))).rejects.toMatchObject({ code: 'INVENTORY_IMPORT_FILE' });
        await expect(read(Buffer.alloc(2 * 1024 * 1024 + 1))).rejects.toMatchObject({ code: 'INVENTORY_IMPORT_LIMIT' });
    });
    it('limita los bytes realmente descomprimidos aunque la cabecera ZIP declare menos', async () => {
        const name = Buffer.from('oversized.xml');
        const compressed = deflateRawSync(Buffer.alloc(16 * 1024 * 1024 + 1, 'x'));
        const local = Buffer.alloc(30);
        local.writeUInt32LE(0x04034b50); local.writeUInt16LE(20, 4); local.writeUInt16LE(8, 8);
        local.writeUInt32LE(compressed.length, 18); local.writeUInt32LE(1, 22); local.writeUInt16LE(name.length, 26);
        const central = Buffer.alloc(46);
        central.writeUInt32LE(0x02014b50); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(8, 10);
        central.writeUInt32LE(compressed.length, 20); central.writeUInt32LE(1, 24); central.writeUInt16LE(name.length, 28);
        const end = Buffer.alloc(22);
        end.writeUInt32LE(0x06054b50); end.writeUInt16LE(1, 8); end.writeUInt16LE(1, 10);
        end.writeUInt32LE(central.length + name.length, 12); end.writeUInt32LE(local.length + name.length + compressed.length, 16);
        const bytes = Buffer.concat([local, name, compressed, central, name, end]);
        await expect(read(bytes)).rejects.toMatchObject({ code: 'INVENTORY_IMPORT_LIMIT' });
    });
    it('libera la puerta tras un rechazo o aborto y no encola trabajos concurrentes', async () => {
        const current = processInventoryWorkbook({ action: 'template', config, catalogs });
        await expect(read(Buffer.from('rechazado'))).rejects.toMatchObject({ code: 'INVENTORY_IMPORT_BUSY' });
        const workbook = await current;
        expect(workbook.byteLength).toBeGreaterThan(100);
        const controller = new AbortController();
        const interrupted = processInventoryWorkbook({ action: 'template', config, catalogs }, controller.signal);
        controller.abort();
        await expect(interrupted).rejects.toBeDefined();
        await expect(read(Buffer.from('rechazado'))).rejects.toMatchObject({ code: 'INVENTORY_IMPORT_FILE' });
    });
});
