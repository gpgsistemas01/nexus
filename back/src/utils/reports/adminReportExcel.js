import { createFormulaCell } from '../reportExcelUtils.js';

const MOVEMENT_REPORT_HEADERS = [
    'Fecha', 'Fecha Creación', 'Tipo', 'Folio', 'Material', 'Base', 'Altura',
    'Proveedor', 'Stock anterior', 'Movimiento', 'Nuevo stock'
];

export const buildMovementReportData = async function* (rows, { context = 'materials' } = {}) {
    yield MOVEMENT_REPORT_HEADERS.map(header => header === 'Material' && context === 'consumables' ? 'Consumible' : header);
    let index = 0;
    for await (const row of rows) {
        yield [
            row.date,
            row.createdAt,
            row.type,
            row.referenceNumber,
            row.materialName,
            row.materialBase,
            row.materialHeight,
            row.supplierName,
            row.previousStock,
            row.quantity,
            createFormulaCell(`I${ index + 2 }+J${ index + 2 }`, row.newStock)
        ];
        index++;
    }
};

export const buildUserReportData = async function* (rows) {
    yield ['Usuario', 'Persona', 'Rol', 'Área'];
    for await (const row of rows) yield [
        row.name,
        row.person?.fullName || '-',
        row.roleName || '-',
        row.departmentName || '-'
    ];
};

export const buildPersonReportData = async function* (rows) {
    yield ['Nombre', 'Área', 'Rol'];
    for await (const row of rows) {
        if (!row.accesses?.length) {
            yield [row.fullName, '-', '-'];
            continue;
        }
        for (const access of row.accesses) yield [row.fullName, access.department.name, access.role.name];
    }
};
