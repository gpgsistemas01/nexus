import { existsSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { captureWithRecovery } from './manualScreenshotRecovery.js';

const baseURL = process.env.DOCS_BASE_URL ?? 'http://127.0.0.1:3000';
const authenticatedAreas = Object.freeze({
    warehouse: {
        label: 'Almacén',
        loginName: process.env.DOCS_WAREHOUSE_LOGIN_NAME,
        loginPassword: process.env.DOCS_WAREHOUSE_LOGIN_PASSWORD,
        storageState: process.env.DOCS_WAREHOUSE_STORAGE_STATE
    },
    administration: {
        label: 'Sistemas',
        loginName: process.env.DOCS_ADMIN_LOGIN_NAME,
        loginPassword: process.env.DOCS_ADMIN_LOGIN_PASSWORD,
        storageState: process.env.DOCS_ADMIN_STORAGE_STATE
    }
});
const requestedCaptureIds = (process.env.DOCS_CAPTURE_IDS ?? '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);
const requestedCaptureFrom = process.env.DOCS_CAPTURE_FROM?.trim();
const recoverMissingCaptures = process.argv.includes('--missing');
const forceFreshCapture = process.argv.includes('--fresh');
const outputRoot = path.resolve('docs/user-manual/images');
const screenshotDelay = 1500;
const retryDelay = 1000;
const captureTimeout = Number(process.env.DOCS_CAPTURE_TIMEOUT_MS ?? '30000');
const captureRetries = Number(process.env.DOCS_CAPTURE_RETRIES ?? '2');

if (!Number.isInteger(captureTimeout) || captureTimeout <= 0) {
    throw new Error('DOCS_CAPTURE_TIMEOUT_MS debe ser un entero mayor a cero.');
}
if (!Number.isInteger(captureRetries) || captureRetries < 0) {
    throw new Error('DOCS_CAPTURE_RETRIES debe ser un entero mayor o igual a cero.');
}

const click = (selector, ready, requirement) => ({ selector, ready, requirement });
const filter = (selector, label) => ({ selector, label, filter: true });
const clickStatus = (status, selector, ready, requirement) => ({ status, selector, ready, requirement });
const openFilters = click('.table-filters-summary', '#tableFiltersForm:visible');
const reportDialog = click('.datatable-export-button', '.report-export-modal');
const openMainMenu = click('#appMenuOffcanvasBtn', '#appMenu.show');
const formatCoverage = (useCases) => useCases.length ? useCases.join(', ') : 'Transversal';
let lastCompletedCaptureId;

// El orden de este inventario es el orden narrativo del manual. Los identificadores son
// estables; el número del archivo sólo ordena las imágenes dentro de cada módulo.
const captures = [
    { id: 'CAP-AUT-01-LOGIN', module: 'access', name: '01-login-session.png', route: '/inicio-sesion', ready: '#loginForm', public: true, useCases: ['CU-AUT-01'] },
    { id: 'CAP-AUT-02-MENU', module: 'access', name: '02-menu-main.png', route: '/almacen/materiales', ready: '#table', action: openMainMenu, useCases: ['CU-AUT-02'] },

    { id: 'CAP-CAT-MAT-00-NAVIGATION', module: 'materials', name: '00-access-menu-main.png', route: '/almacen/materiales', ready: '#table', action: openMainMenu, useCases: ['CU-CAT-01'] },
    { id: 'CAP-CAT-MAT-01-LIST', module: 'materials', name: '01-list-inventory.png', route: '/almacen/materiales', ready: '#table', action: openFilters, useCases: ['CU-CAT-01', 'CU-CAT-06', 'CU-CAT-07'] },
    { id: 'CAP-CAT-MAT-02-CREATE', module: 'materials', name: '02-form-creation.png', route: '/almacen/materiales', ready: '#table', action: click('button:has-text("Nuevo material")', '#materialModal.show'), useCases: ['CU-CAT-02', 'CU-CAT-27', 'CU-CAT-28'] },
    { id: 'CAP-CAT-MAT-03-EDIT', module: 'materials', name: '03-form-edit.png', route: '/almacen/materiales', ready: '#table', action: click('#table tbody .btn-edit', '#materialModal.show'), useCases: ['CU-CAT-03', 'CU-CAT-04'] },
    { id: 'CAP-CAT-MAT-04-STOCK', module: 'materials', name: '04-adjustment-stock.png', route: '/almacen/materiales', ready: '#table', action: click('#table tbody .btn-adjust-stock', '#materialModal.show'), useCases: ['CU-CAT-05', 'CU-CAT-29'] },
    { id: 'CAP-REP-MAT-05-EXPORT', module: 'materials', name: '05-export-report.png', route: '/almacen/materiales', ready: '#table', action: reportDialog, useCases: ['CU-CAT-07'] },

    { id: 'CAP-CAT-SUP-00-NAVIGATION', module: 'suppliers', name: '00-access-menu-main.png', route: '/proveedores', ready: '#table', action: openMainMenu, useCases: ['CU-CAT-10'] },
    { id: 'CAP-CAT-SUP-01-LIST', module: 'suppliers', name: '01-list.png', route: '/proveedores', ready: '#table', useCases: ['CU-CAT-10', 'CU-CAT-14'] },
    { id: 'CAP-CAT-SUP-02-CREATE', module: 'suppliers', name: '02-form-creation.png', route: '/proveedores', ready: '#table', action: click('button:has-text("Nuevo proveedor")', '#supplierModal.show'), useCases: ['CU-CAT-11'] },
    { id: 'CAP-CAT-SUP-03-EDIT', module: 'suppliers', name: '03-form-edit-and-state.png', route: '/proveedores', ready: '#table', action: click('#table tbody .btn-edit', '#supplierModal.show'), useCases: ['CU-CAT-12', 'CU-CAT-13'] },
    { id: 'CAP-CAT-SUP-04-EXPORT', module: 'suppliers', name: '04-export-report.png', route: '/proveedores', ready: '#table', action: reportDialog, useCases: ['CU-CAT-14'] },

    { id: 'CAP-CAT-CLI-00-NAVIGATION', module: 'clients', name: '00-access-menu-main.png', route: '/clientes', ready: '#table', action: openMainMenu, useCases: ['CU-CAT-15'] },
    { id: 'CAP-CAT-CLI-01-LIST', module: 'clients', name: '01-list.png', route: '/clientes', ready: '#table', useCases: ['CU-CAT-15', 'CU-CAT-18'] },
    { id: 'CAP-CAT-CLI-02-CREATE', module: 'clients', name: '02-form-creation.png', route: '/clientes', ready: '#table', action: click('button:has-text("Nuevo cliente")', '#clientModal.show'), useCases: ['CU-CAT-16'] },
    { id: 'CAP-CAT-CLI-03-EDIT', module: 'clients', name: '03-form-edit.png', route: '/clientes', ready: '#table', action: click('#table tbody .btn-edit', '#clientModal.show'), useCases: ['CU-CAT-17'] },
    { id: 'CAP-CAT-CLI-04-EXPORT', module: 'clients', name: '04-export-report.png', route: '/clientes', ready: '#table', action: reportDialog, useCases: ['CU-CAT-18'] },

    { id: 'CAP-CAT-WAS-00-NAVIGATION', module: 'waste', name: '00-access-menu-main.png', route: '/almacen/mermas', ready: '#table', action: openMainMenu, useCases: ['CU-CAT-19'] },
    { id: 'CAP-CAT-WAS-01-LIST', module: 'waste', name: '01-list-inventory.png', route: '/almacen/mermas', ready: '#table', action: openFilters, useCases: ['CU-CAT-19', 'CU-CAT-23', 'CU-CAT-24'] },
    { id: 'CAP-CAT-WAS-02-CREATE', module: 'waste', name: '02-form-registration.png', route: '/almacen/mermas', ready: '#table', action: click('button:has-text("Nueva merma")', '#wasteModal.show'), useCases: ['CU-CAT-20'] },
    { id: 'CAP-CAT-WAS-03-EDIT', module: 'waste', name: '03-form-edit.png', route: '/almacen/mermas', ready: '#table', action: click('#table tbody .btn-edit', '#wasteModal.show'), useCases: ['CU-CAT-21'] },
    { id: 'CAP-CAT-WAS-04-STOCK', module: 'waste', name: '04-adjustment-stock.png', route: '/almacen/mermas', ready: '#table', action: click('#table tbody .btn-adjust-stock', '#wasteModal.show'), useCases: ['CU-CAT-22'] },
    { id: 'CAP-REP-WAS-05-EXPORT', module: 'waste', name: '05-export-report.png', route: '/almacen/mermas', ready: '#table', action: reportDialog, useCases: ['CU-CAT-24'] },
    { id: 'CAP-CAT-AREA-01-LIST', module: 'catalogs/areas', name: '01-list.png', route: '/catalogos/departments', ready: '#table', useCases: ['CU-CAT-31'] },
    { id: 'CAP-CAT-AREA-02-CREATE', module: 'catalogs/areas', name: '02-form-creation.png', route: '/catalogos/departments', ready: '#table', action: click('button:has-text("Nueva área")', '#catalogModal.show'), useCases: ['CU-CAT-32'] },
    { id: 'CAP-CAT-AREA-03-EDIT', module: 'catalogs/areas', name: '03-form-edit.png', route: '/catalogos/departments', ready: '#table', action: click('#table tbody .btn-edit', '#catalogModal.show', 'al menos un área'), useCases: ['CU-CAT-33'] },
    { id: 'CAP-CAT-ROLE-01-LIST', module: 'catalogs/roles', name: '01-list.png', route: '/catalogos/roles', ready: '#table', useCases: ['CU-CAT-34'] },
    { id: 'CAP-CAT-ROLE-02-CREATE', module: 'catalogs/roles', name: '02-form-creation.png', route: '/catalogos/roles', ready: '#table', action: click('button:has-text("Nuevo rol")', '#catalogModal.show'), useCases: ['CU-CAT-35'] },
    { id: 'CAP-CAT-ROLE-03-EDIT', module: 'catalogs/roles', name: '03-form-edit.png', route: '/catalogos/roles', ready: '#table', action: click('#table tbody .btn-edit', '#catalogModal.show', 'al menos un rol'), useCases: ['CU-CAT-36'] },
    { id: 'CAP-CAT-PRE-01-LIST', module: 'catalogs/presentaciones', name: '01-list.png', route: '/catalogos/presentations', ready: '#table', useCases: ['CU-CAT-37'] },
    { id: 'CAP-CAT-PRE-02-CREATE', module: 'catalogs/presentaciones', name: '02-form-creation.png', route: '/catalogos/presentations', ready: '#table', action: click('button:has-text("Nueva presentación")', '#catalogModal.show'), useCases: ['CU-CAT-38'] },
    { id: 'CAP-CAT-PRE-03-EDIT', module: 'catalogs/presentaciones', name: '03-form-edit.png', route: '/catalogos/presentations', ready: '#table', action: click('#table tbody .btn-edit', '#catalogModal.show', 'al menos una presentación'), useCases: ['CU-CAT-39'] },
    { id: 'CAP-CAT-UNIT-01-LIST', module: 'catalogs/unidades-medida', name: '01-list.png', route: '/catalogos/unit-measures', ready: '#table', useCases: ['CU-CAT-40'] },
    { id: 'CAP-CAT-UNIT-02-CREATE', module: 'catalogs/unidades-medida', name: '02-form-creation.png', route: '/catalogos/unit-measures', ready: '#table', action: click('button:has-text("Nueva unidad de medida")', '#catalogModal.show'), useCases: ['CU-CAT-41'] },
    { id: 'CAP-CAT-UNIT-03-EDIT', module: 'catalogs/unidades-medida', name: '03-form-edit.png', route: '/catalogos/unit-measures', ready: '#table', action: click('#table tbody .btn-edit', '#catalogModal.show', 'al menos una unidad de medida'), useCases: ['CU-CAT-42'] },
    { id: 'CAP-CAT-REASON-01-LIST', module: 'catalogs/motivos-ajuste', name: '01-list.png', route: '/catalogos/reasons', ready: '#table', useCases: ['CU-CAT-43'] },
    { id: 'CAP-CAT-REASON-02-CREATE', module: 'catalogs/motivos-ajuste', name: '02-form-creation.png', route: '/catalogos/reasons', ready: '#table', action: click('button:has-text("Nuevo motivo de ajuste")', '#catalogModal.show'), useCases: ['CU-CAT-44'] },
    { id: 'CAP-CAT-REASON-03-EDIT', module: 'catalogs/motivos-ajuste', name: '03-form-edit.png', route: '/catalogos/reasons', ready: '#table', action: click('#table tbody .btn-edit', '#catalogModal.show', 'al menos un motivo de ajuste'), useCases: ['CU-CAT-45'] },
    { id: 'CAP-CAT-STATUS-01-LIST', module: 'catalogs/estados-cumplimiento', name: '01-list.png', route: '/catalogos/fulfillment-statuses', ready: '#table', useCases: ['CU-CAT-46'] },
    { id: 'CAP-CAT-STATUS-02-CREATE', module: 'catalogs/estados-cumplimiento', name: '02-form-creation.png', route: '/catalogos/fulfillment-statuses', ready: '#table', action: click('button:has-text("Nuevo estado de cumplimiento")', '#catalogModal.show'), useCases: ['CU-CAT-47'] },
    { id: 'CAP-CAT-STATUS-03-EDIT', module: 'catalogs/estados-cumplimiento', name: '03-form-edit.png', route: '/catalogos/fulfillment-statuses', ready: '#table', action: click('#table tbody .btn-edit', '#catalogModal.show', 'al menos un estado de cumplimiento'), useCases: ['CU-CAT-48'] },

    { id: 'CAP-ENT-00-NAVIGATION', module: 'purchases', name: '00-access-menu-main.png', route: '/compras', ready: '#table', action: openMainMenu, useCases: ['CU-ENT-01'] },
    { id: 'CAP-ENT-01-LIST', module: 'purchases', name: '01-list.png', route: '/compras', ready: '#table', action: openFilters, useCases: ['CU-ENT-01'] },
    { id: 'CAP-ENT-02-CREATE', module: 'purchases', name: '02-form-registration.png', route: '/compras', ready: '#table', action: click('button:has-text("Nueva compra")', '#goodsReceiptModal.show'), useCases: ['CU-ENT-02'] },
    { id: 'CAP-ENT-03-EDIT', module: 'purchases', name: '03-edit-purchase.png', route: '/compras', ready: '#table', action: click('#table tbody .btn-edit', '#goodsReceiptModal.show'), useCases: ['CU-ENT-03', 'CU-ENT-05'] },
    { id: 'CAP-ENT-04-CORRECT', module: 'purchases', name: '04-correction-detail.png', route: '/compras', ready: '#table', actions: [click('#table tbody .btn-edit', '#goodsReceiptModal.show'), click('#materialTable tbody .correct-detail-btn', '#goodsReceiptCorrectionModal.show')], useCases: ['CU-ENT-04'] },
    { id: 'CAP-REP-ENT-05-EXPORT', module: 'purchases', name: '05-export-report.png', route: '/compras', ready: '#table', action: reportDialog, useCases: ['CU-ENT-06'] },
    { id: 'CAP-ENT-06-VIEW', module: 'purchases', name: '06-query-cancelled.png', route: '/compras', ready: '#table', action: clickStatus('Cancelada', '.btn-edit', '#goodsReceiptModal.show', 'una compra cancelada'), useCases: ['CU-ENT-03', 'CU-ENT-05'] },

    { id: 'CAP-SAL-MAT-00-NAVIGATION', module: 'material-issues', name: '00-access-menu-main.png', route: '/salidas/materiales', ready: '#table', action: openMainMenu, useCases: ['CU-SAL-01'] },
    { id: 'CAP-SAL-MAT-01-LIST', module: 'material-issues', name: '01-list.png', route: '/salidas/materiales', ready: '#table', action: openFilters, useCases: ['CU-CAT-30', 'CU-SAL-01'] },
    { id: 'CAP-SAL-MAT-02-CREATE', module: 'material-issues', name: '02-form-registration.png', route: '/salidas/materiales', ready: '#table', action: click('button:has-text("Nueva salida")', '#goodsIssueModal.show'), useCases: ['CU-SAL-02'] },
    { id: 'CAP-SAL-MAT-03-EDIT', module: 'material-issues', name: '03-edit-header.png', route: '/salidas/materiales', ready: '#table', action: click('#table tbody .btn-edit', '#goodsIssueModal.show'), useCases: ['CU-SAL-03', 'CU-SAL-04'] },
    { id: 'CAP-SAL-MAT-04-SUPPLY', module: 'material-issues', name: '04-supply-details.png', route: '/salidas/materiales', ready: '#table', action: click('#table tbody .btn-edit-detail', '#goodsIssueModal.show'), useCases: ['CU-SAL-05'] },
    { id: 'CAP-SAL-MAT-05-RETURN', module: 'material-issues', name: '05-return-detail.png', route: '/salidas/materiales', ready: '#table', actions: [filter('#fulfillmentStatusFilter', 'Surtido'), click('#table tbody .btn-return-detail', '#goodsIssueModal.show', 'una salida de material aprobada, completamente surtida y con cantidad retornable'), click('#materialTable tbody .return-issue-detail-btn', '#issueReturnModal.show', 'un detalle surtido que todavía tenga cantidad retornable')], useCases: ['CU-SAL-06'] },
    { id: 'CAP-REP-SAL-MAT-06-EXPORT', module: 'material-issues', name: '06-export-report.png', route: '/salidas/materiales', ready: '#table', action: reportDialog, useCases: ['CU-SAL-07'] },
    { id: 'CAP-SAL-MAT-07-FILTER', module: 'material-issues', name: '07-filter-supplied.png', route: '/salidas/materiales', ready: '#table', action: filter('#fulfillmentStatusFilter', 'Surtido'), useCases: ['CU-SAL-01', 'CU-SAL-06'] },
    { id: 'CAP-SAL-MAT-08-VIEW', module: 'material-issues', name: '08-query-cancelled.png', route: '/salidas/materiales', ready: '#table', actions: [filter('#fulfillmentStatusFilter', 'Cancelado'), clickStatus('Cancelada', '.btn-edit', '#goodsIssueModal.show', 'una salida de material cancelada')], useCases: ['CU-SAL-03', 'CU-SAL-04'] },

    { id: 'CAP-SAL-WAS-00-NAVIGATION', module: 'waste-issues', name: '00-access-menu-main.png', route: '/salidas/mermas', ready: '#table', action: openMainMenu, useCases: ['CU-SAL-08'] },
    { id: 'CAP-SAL-WAS-01-LIST', module: 'waste-issues', name: '01-list.png', route: '/salidas/mermas', ready: '#table', action: openFilters, useCases: ['CU-SAL-08', 'CU-SAL-14'] },
    { id: 'CAP-SAL-WAS-02-CREATE', module: 'waste-issues', name: '02-form-registration.png', route: '/salidas/mermas', ready: '#table', action: click('button:has-text("Nueva salida")', '#wasteIssueModal.show', 'el permiso para administrar salidas de merma'), useCases: ['CU-SAL-09'] },
    { id: 'CAP-SAL-WAS-03-EDIT', module: 'waste-issues', name: '03-edit-header.png', route: '/salidas/mermas', ready: '#table', action: click('#table tbody .btn-edit', '#wasteIssueModal.show'), useCases: ['CU-SAL-10', 'CU-SAL-11'] },
    { id: 'CAP-SAL-WAS-04-SUPPLY', module: 'waste-issues', name: '04-supply-details.png', route: '/salidas/mermas', ready: '#table', action: click('#table tbody .btn-edit-detail', '#wasteIssueModal.show'), useCases: ['CU-SAL-12'] },
    { id: 'CAP-SAL-WAS-05-RETURN', module: 'waste-issues', name: '05-return-detail.png', route: '/salidas/mermas', ready: '#table', actions: [filter('#fulfillmentStatusFilter', 'Surtido'), click('#table tbody .btn-return-detail', '#wasteIssueModal.show', 'una salida de merma aprobada, completamente surtida y con cantidad retornable'), click('#materialTable tbody .return-issue-detail-btn', '#issueReturnModal.show', 'un detalle surtido que todavía tenga cantidad retornable')], useCases: ['CU-SAL-13'] },
    { id: 'CAP-REP-SAL-WAS-06-EXPORT', module: 'waste-issues', name: '06-export-report.png', route: '/salidas/mermas', ready: '#table', action: reportDialog, useCases: ['CU-SAL-14'] },
    { id: 'CAP-SAL-WAS-07-FILTER', module: 'waste-issues', name: '07-filter-supplied.png', route: '/salidas/mermas', ready: '#table', action: filter('#fulfillmentStatusFilter', 'Surtido'), useCases: ['CU-SAL-08', 'CU-SAL-13'] },
    { id: 'CAP-SAL-WAS-08-VIEW', module: 'waste-issues', name: '08-query-cancelled.png', route: '/salidas/mermas', ready: '#table', actions: [filter('#fulfillmentStatusFilter', 'Cancelado'), clickStatus('Cancelada', '.btn-edit', '#wasteIssueModal.show', 'una salida de merma cancelada')], useCases: ['CU-SAL-10', 'CU-SAL-11'] },

    { id: 'CAP-IDA-PER-00-NAVIGATION', module: 'people', name: '00-access-menu-main.png', route: '/personas', ready: '#table', action: openMainMenu, useCases: ['CU-IDA-01'] },
    { id: 'CAP-IDA-PER-01-LIST', module: 'people', name: '01-list.png', route: '/personas', ready: '#table', action: openFilters, useCases: ['CU-IDA-01', 'CU-IDA-04'] },
    { id: 'CAP-IDA-PER-02-CREATE', module: 'people', name: '02-form-creation.png', route: '/personas', ready: '#table', action: click('button:has-text("Nueva persona")', '#personModal.show'), useCases: ['CU-IDA-02', 'CU-IDA-10', 'CU-IDA-11'] },
    { id: 'CAP-IDA-PER-03-EDIT', module: 'people', name: '03-form-edit.png', route: '/personas', ready: '#table', action: click('#table tbody .btn-edit', '#personModal.show'), useCases: ['CU-IDA-03'] },
    { id: 'CAP-IDA-PER-04-EXPORT', module: 'people', name: '04-export-report.png', route: '/personas', ready: '#table', action: reportDialog, useCases: ['CU-IDA-04'] },

    { id: 'CAP-IDA-USR-00-NAVIGATION', module: 'users', name: '00-access-menu-main.png', route: '/usuarios-sistemas', ready: '#table', action: openMainMenu, useCases: ['CU-IDA-05'] },
    { id: 'CAP-IDA-USR-01-LIST', module: 'users', name: '01-list.png', route: '/usuarios-sistemas', ready: '#table', useCases: ['CU-IDA-05', 'CU-IDA-09'] },
    { id: 'CAP-IDA-USR-02-CREATE', module: 'users', name: '02-form-creation.png', route: '/usuarios-sistemas', ready: '#table', action: click('button:has-text("Nuevo usuario")', '#userModal.show'), useCases: ['CU-IDA-06'] },
    { id: 'CAP-IDA-USR-03-EDIT', module: 'users', name: '03-form-edit.png', route: '/usuarios-sistemas', ready: '#table', action: click('#table tbody .btn-edit', '#userModal.show'), useCases: ['CU-IDA-07'] },
    { id: 'CAP-IDA-USR-04-PASSWORD', module: 'users', name: '04-change-password.png', route: '/usuarios-sistemas', ready: '#table', action: click('#table tbody .btn-edit-password', '#userModal.show'), useCases: ['CU-IDA-08'] },
    { id: 'CAP-IDA-USR-05-EXPORT', module: 'users', name: '05-export-report.png', route: '/usuarios-sistemas', ready: '#table', action: reportDialog, useCases: ['CU-IDA-09'] },

    { id: 'CAP-REP-MOV-MAT-00-NAVIGATION', module: 'material-movements', name: '00-access-menu-main.png', route: '/movimientos/materiales', ready: '#materialMovementTable', action: openMainMenu, useCases: ['CU-CAT-08'] },
    { id: 'CAP-REP-MOV-MAT-01-LIST', module: 'material-movements', name: '01-history-and-filters.png', route: '/movimientos/materiales', ready: '#materialMovementTable', action: openFilters, useCases: ['CU-CAT-08'] },
    { id: 'CAP-REP-MOV-MAT-02-EXPORT', module: 'material-movements', name: '02-export-report.png', route: '/movimientos/materiales', ready: '#materialMovementTable', action: reportDialog, useCases: ['CU-CAT-09'] },
    { id: 'CAP-REP-MOV-WAS-00-NAVIGATION', module: 'waste-movements', name: '00-access-menu-main.png', route: '/movimientos/mermas', ready: '#wasteMovementTable', action: openMainMenu, useCases: ['CU-CAT-25'] },
    { id: 'CAP-REP-MOV-WAS-01-LIST', module: 'waste-movements', name: '01-history-and-filters.png', route: '/movimientos/mermas', ready: '#wasteMovementTable', action: openFilters, useCases: ['CU-CAT-25'] },
    { id: 'CAP-REP-MOV-WAS-02-EXPORT', module: 'waste-movements', name: '02-export-report.png', route: '/movimientos/mermas', ready: '#wasteMovementTable', action: reportDialog, useCases: ['CU-CAT-26'] },

    { id: 'CAP-ERR-404-NOT-FOUND', module: 'errors', name: '01-page-not-found.png', route: '/pagina-no-existente-manual', ready: '.error-card', public: true, useCases: [] }
];

const administrationModules = new Set([
    'people',
    'users',
    'material-movements',
    'waste-movements'
]);
const captureArea = capture => (
    capture.module.startsWith('catalogs/') || administrationModules.has(capture.module)
        ? 'administration'
        : 'warehouse'
);

const validateInventory = () => {
    const ids = new Set();
    const paths = new Set();

    for (const capture of captures) {
        const relativePath = path.join(capture.module, capture.name);
        if (ids.has(capture.id)) throw new Error(`Identificador de captura duplicado: ${ capture.id }`);
        if (paths.has(relativePath)) throw new Error(`Ruta de captura duplicada: ${ relativePath }`);
        ids.add(capture.id);
        paths.add(relativePath);
    }
};

const selectCaptures = () => {
    const selectionMechanisms = [requestedCaptureIds.length > 0, Boolean(requestedCaptureFrom), recoverMissingCaptures, forceFreshCapture]
        .filter(Boolean).length;
    if (selectionMechanisms > 1) {
        throw new Error('Use DOCS_CAPTURE_IDS, DOCS_CAPTURE_FROM, --missing o --fresh; no combine mecanismos.');
    }

    if (recoverMissingCaptures) return captures.filter(capture => !existsSync(path.join(outputRoot, capture.module, capture.name)));

    if (requestedCaptureFrom) {
        const startIndex = captures.findIndex(capture => capture.id === requestedCaptureFrom);
        if (startIndex === -1) {
            throw new Error(`DOCS_CAPTURE_FROM contiene un identificador desconocido: ${ requestedCaptureFrom }`);
        }
        return captures.slice(startIndex);
    }

    if (!requestedCaptureIds.length) return captures;

    const capturesById = new Map(captures.map(capture => [capture.id, capture]));
    const unknownIds = requestedCaptureIds.filter(id => !capturesById.has(id));
    if (unknownIds.length) {
        throw new Error(`DOCS_CAPTURE_IDS contiene identificadores desconocidos: ${ unknownIds.join(', ') }`);
    }

    return [...new Set(requestedCaptureIds)].map(id => capturesById.get(id));
};

const capturePath = capture => path.join(outputRoot, capture.module, capture.name);
const firstMissingCapture = () => captures.find(capture => !existsSync(capturePath(capture)));

const waitForDataTableReady = async (page) => {
    await page.waitForFunction(() => {
        const table = globalThis.$?.('#table');
        if (!table || !globalThis.$.fn.DataTable.isDataTable(table)) return false;

        const dataTable = table.DataTable();
        const settings = dataTable.settings()[0];
        return dataTable.ajax.json() !== undefined && settings.iDraw > 0 && !settings.bDrawing;
    });
};

const findTriggerAcrossPages = async (page, selector) => {
    const visibleTrigger = page.locator(`${ selector }:visible`).first();

    while (true) {
        if (await visibleTrigger.count()) return visibleTrigger;

        const advanced = await page.evaluate(async () => {
            const table = globalThis.$?.('#table').DataTable();
            if (!table) return false;
            const { page, pages } = table.page.info();
            if (page + 1 >= pages) return false;

            await new Promise(resolve => {
                globalThis.$('#table').one('draw.dt', resolve);
                table.page('next').draw('page');
            });
            return true;
        });
        if (!advanced) return null;
    }
};

const findStatusTriggerAcrossPages = async (page, { status, selector }) => {
    while (true) {
        const rowIndex = await page.locator('#table').evaluate((tableElement, expectedStatus) => {
            const table = globalThis.$(tableElement).DataTable();
            return table.rows({ page: 'current' }).data().toArray()
                .findIndex(row => row.status?.name === expectedStatus);
        }, status);
        if (rowIndex >= 0) {
            const trigger = page.locator('#table tbody tr').nth(rowIndex).locator(`${ selector }:visible`).first();
            if (await trigger.count()) return trigger;
        }

        const advanced = await page.locator('#table').evaluate(async tableElement => {
            const table = globalThis.$(tableElement).DataTable();
            const { page, pages } = table.page.info();
            if (page + 1 >= pages) return false;

            await new Promise(resolve => {
                globalThis.$(tableElement).one('draw.dt', resolve);
                table.page('next').draw('page');
            });
            return true;
        });
        if (!advanced) return null;
    }
};

const runAction = async (page, action, captureId, step) => {
    if (action.filter) {
        await waitForDataTableReady(page);
        const filterControl = page.locator(action.selector);
        if (!await filterControl.isVisible()) {
            const filterPanel = page.locator('.table-filters-panel').filter({ has: filterControl });
            await filterPanel.locator('.table-filters-summary').click();
            await filterControl.waitFor({ state: 'visible' });
        }
        await filterControl.selectOption({ label: action.label });
        await Promise.all([
            page.locator('#table').evaluate(table => new Promise(resolve => {
                globalThis.$(table).one('draw.dt', resolve);
            })),
            page.locator('#applyFiltersButton').click()
        ]);
        console.log(`  Paso ${ step } de ${ captureId }: filtro ${ action.label }`);
        return;
    }

    const trigger = action.status
        ? await findStatusTriggerAcrossPages(page, action)
        : action.selector.startsWith('#table tbody ')
            ? await findTriggerAcrossPages(page, action.selector)
            : page.locator(action.selector).first();

    if (!trigger) {
        const preparation = action.requirement
            ? `Verifique los permisos de la sesión y prepare ${ action.requirement } en el entorno de prueba.`
            : '';
        throw new Error(
            `${ captureId } no puede prepararse: no existe ${ action.selector } en ninguna página del listado filtrado. `
            + `La automatización no crea ni modifica registros.${ preparation ? ` ${ preparation }` : '' }`
        );
    }

    try {
        await trigger.waitFor({ state: 'visible' });
    } catch (error) {
        if (!action.requirement) throw error;
        throw new Error(
            `${ captureId } no puede prepararse: no apareció ${ action.selector }. `
            + `Verifique que la sesión tenga permiso para surtir y que los datos incluyan ${ action.requirement }.`,
            { cause: error }
        );
    }
    await trigger.click();
    await page.locator(action.ready).first().waitFor({ state: 'visible' });
    console.log(`  Paso ${ step } de ${ captureId }: acción ${ action.selector }`);
};

const capturePage = async (page, capture) => {
    const directory = path.join(outputRoot, capture.module);
    await mkdir(directory, { recursive: true });
    await page.goto(new URL(capture.route, baseURL).href, { waitUntil: 'domcontentloaded' });
    await page.locator(capture.ready).first().waitFor({ state: 'visible' });
    if (capture.ready === '#table') {
        try {
            await waitForDataTableReady(page);
        } catch (error) {
            throw new Error(
                `${ capture.id } no pudo cargarse: DataTables no terminó su consulta dentro del límite de Playwright. `
                + `El límite no es una pausa obligatoria. Para reanudar desde esta captura, defina `
                + `DOCS_CAPTURE_FROM=${ capture.id } y ejecute nuevamente npm run docs:screenshots.`,
                { cause: error }
            );
        }
    }

    const actions = capture.actions ?? (capture.action ? [capture.action] : []);
    for (const [index, action] of actions.entries()) {
        await runAction(page, action, capture.id, `${ index + 1 }/${ actions.length }`);
    }

    await page.waitForTimeout(screenshotDelay);
    await page.screenshot({ path: path.join(directory, capture.name) });
    console.log(`${ capture.id } -> ${ path.join(capture.module, capture.name) } [${ formatCoverage(capture.useCases) }]`);
};

const capturePageWithRecovery = async (context, capture) => {
    try {
        await captureWithRecovery({
            context,
            capture,
            capturePage,
            retries: captureRetries,
            retryDelay,
            onRetry: attempt => console.warn(
                `${ capture.id } excedió el tiempo límite; reintento ${ attempt }/${ captureRetries } `
                + 'en una página nueva desde la ruta inicial, sin eliminar las demás capturas.'
            )
        });
        lastCompletedCaptureId = capture.id;
    } catch (error) {
        console.error(
            `${ capture.id } quedó pendiente. Última captura completada: ${ lastCompletedCaptureId ?? 'ninguna' }. `
            + 'Ejecute nuevamente npm run docs:screenshots para reanudar automáticamente desde este punto.'
        );
        throw error;
    }
};

const login = async (page, area) => {
    const { label, loginName, loginPassword } = authenticatedAreas[area];
    await page.goto(new URL('/inicio-sesion', baseURL).href, { waitUntil: 'domcontentloaded' });
    await page.locator('#loginForm').waitFor({ state: 'visible' });
    await page.locator('#nameInput').fill(loginName);
    await page.locator('#passwordInput').fill(loginPassword);
    await Promise.all([
        page.waitForURL(url => url.pathname === '/almacen/materiales'),
        page.locator('#submitBtn').click()
    ]);
    console.log(`Sesión de capturas de ${ label } iniciada automáticamente.`);
};

validateInventory();
let selectedCaptures = selectCaptures();

if (process.argv.includes('--list')) {
    console.log('| Orden | ID | Ruta | Casos de uso |');
    console.log('|---:|---|---|---|');
    captures.forEach((capture, index) => {
        const coverage = capture.useCases.length
            ? capture.useCases.map(id => `\`${ id }\``).join(', ')
            : 'Transversal';
        console.log(`| ${ index + 1 } | \`${ capture.id }\` | \`docs/user-manual/images/${ capture.module }/${ capture.name }\` | ${ coverage } |`);
    });
    process.exit(0);
}

if (!requestedCaptureIds.length && !requestedCaptureFrom && !recoverMissingCaptures && !forceFreshCapture) {
    const pendingCapture = firstMissingCapture();
    if (pendingCapture && captures.some(capture => existsSync(capturePath(capture)))) {
        selectedCaptures = captures.slice(captures.indexOf(pendingCapture));
        console.log(
            `Se reanudará la secuencia desde ${ pendingCapture.id }; las capturas anteriores ya completas se conservan. `
            + 'Use --fresh para regenerar todo el inventario.'
        );
    }
}

if (recoverMissingCaptures && !selectedCaptures.length) {
    console.log('El inventario de capturas ya está completo; no hay archivos que recuperar.');
    process.exit(0);
}

const protectedCaptures = selectedCaptures.filter(item => !item.public);
const selectedAreas = [...new Set(protectedCaptures.map(captureArea))];
for (const area of selectedAreas) {
    const { label, loginName, loginPassword, storageState } = authenticatedAreas[area];
    if (Boolean(loginName) !== Boolean(loginPassword)) {
        throw new Error(`DOCS_${ area === 'warehouse' ? 'WAREHOUSE' : 'ADMIN' }_LOGIN_NAME y DOCS_${ area === 'warehouse' ? 'WAREHOUSE' : 'ADMIN' }_LOGIN_PASSWORD deben definirse juntos.`);
    }
    if (storageState && loginName) {
        throw new Error(`Use credenciales automáticas o el archivo de sesión de ${ label }, no ambos mecanismos.`);
    }
    if (!storageState && !loginName) {
        throw new Error(`Defina las credenciales o el archivo de sesión de ${ label } para generar sus capturas protegidas.`);
    }
    if (storageState && !existsSync(storageState)) {
        throw new Error(
            `No existe el archivo de sesión de ${ label }: ${ storageState }. `
            + 'Complete el inicio de sesión en Playwright codegen, presione Ctrl+C una vez en la terminal donde lo ejecutó, '
            + 'espere a que termine y vuelva el prompt, y compruebe que el archivo se haya guardado.'
        );
    }
}

if (requestedCaptureIds.length || requestedCaptureFrom || recoverMissingCaptures || (!forceFreshCapture && selectedCaptures.length < captures.length)) {
    await Promise.all(selectedCaptures.map(capture => rm(
        path.join(outputRoot, capture.module, capture.name),
        { force: true }
    )));
} else {
    // Una ejecución completa sustituye todo el inventario. Una ejecución selectiva
    // conserva las capturas no solicitadas para poder reintentar únicamente las fallidas.
    await rm(outputRoot, { recursive: true, force: true });
}

const { chromium } = await import('playwright');
const browser = await chromium.launch();
try {
    const contextOptions = { viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' };
    const publicContext = await browser.newContext(contextOptions);
    publicContext.setDefaultTimeout(captureTimeout);

    for (const capture of selectedCaptures.filter(item => item.public)) await capturePageWithRecovery(publicContext, capture);
    await publicContext.close();

    for (const area of selectedAreas) {
        const { storageState } = authenticatedAreas[area];
        const areaCaptures = protectedCaptures.filter(capture => captureArea(capture) === area);
        const authenticatedContext = await browser.newContext({ ...contextOptions, ...(storageState ? { storageState } : {}) });
        authenticatedContext.setDefaultTimeout(captureTimeout);
        if (!storageState) {
            const loginPage = await authenticatedContext.newPage();
            await login(loginPage, area);
            await loginPage.close();
        }
        for (const capture of areaCaptures) await capturePageWithRecovery(authenticatedContext, capture);
        await authenticatedContext.close();
    }
} finally {
    await browser.close();
}

for (const area of selectedAreas) {
    const { storageState } = authenticatedAreas[area];
    if (storageState) await rm(storageState, { force: true });
}
console.log(`Capturas generadas en ${ path.relative(process.cwd(), outputRoot) }.`);
if (selectedAreas.some(area => authenticatedAreas[area].storageState)) {
    console.log('Estados temporales de autenticación eliminados.');
}
