import path from 'node:path';

const click = (selector, ready, requirement) => ({ selector, ready, requirement });
const fill = (selector, value) => ({ selector, value, fill: true });
const filter = (selector, label) => ({ selector, label, filter: true });
const clickStatus = (status, selector, ready, requirement) => ({ status, selector, ready, requirement });
const openFilters = click('.table-filters-summary', '#tableFiltersForm:visible');
const reportDialog = click('.datatable-export-button', '.report-export-modal');
const openMainMenu = click('#appMenuOffcanvasBtn', '#appMenu.show');

// El orden de este inventario es el orden narrativo del manual. Los identificadores son
// estables; el número del archivo sólo ordena las imágenes dentro de cada módulo.
const captureTemplates = [
    { id: 'CAP-AUT-01-LOGIN', module: 'access', name: '01-login-session.png', route: '/inicio-sesion', ready: '#loginForm', area: 'almacen', unauthenticated: true, useCases: ['CU-AUT-01'] },
    { id: 'CAP-AUT-01-SISTEMAS-LOGIN', module: 'access', name: '01-login-session.png', route: '/inicio-sesion', ready: '#loginForm', area: 'sistemas', unauthenticated: true, useCases: ['CU-AUT-01'] },
    { id: 'CAP-AUT-02-MENU', module: 'access', name: '02-menu-main.png', route: '/almacen/materiales', ready: '#table', action: openMainMenu, useCases: ['CU-AUT-02'] },
    { id: 'CAP-AUT-02-SISTEMAS-MENU', module: 'access', name: '02-menu-main.png', route: '/personas', ready: '#table', action: openMainMenu, area: 'sistemas', useCases: ['CU-AUT-02'] },

    { id: 'CAP-CAT-MAT-00-NAVIGATION', module: 'materials', name: '00-access-menu-main.png', route: '/almacen/materiales', ready: '#table', action: openMainMenu, useCases: ['CU-ALM-01'] },
    { id: 'CAP-CAT-MAT-01-LIST', module: 'materials', name: '01-list-inventory.png', route: '/almacen/materiales', ready: '#table', action: openFilters, useCases: ['CU-ALM-01', 'CU-ALM-06'] },
    { id: 'CAP-CAT-MAT-02-CREATE', module: 'materials', name: '02-form-creation.png', route: '/almacen/materiales', ready: '#table', action: click('button:has-text("Nuevo material")', '#materialModal.show'), useCases: ['CU-ALM-02'] },
    { id: 'CAP-CAT-MAT-03-EDIT', module: 'materials', name: '03-form-edit.png', route: '/almacen/materiales', ready: '#table', action: click('#table tbody .btn-edit', '#materialModal.show'), useCases: ['CU-ALM-03', 'CU-ALM-04'] },
    { id: 'CAP-CAT-MAT-04-STOCK', module: 'materials', name: '04-adjustment-stock.png', route: '/almacen/materiales', ready: '#table', action: click('#table tbody .btn-adjust-stock', '#materialModal.show'), area: 'sistemas', useCases: ['CU-ALM-05'] },
    { id: 'CAP-REP-MAT-05-EXPORT', module: 'materials', name: '05-export-report.png', route: '/almacen/materiales', ready: '#table', action: reportDialog, useCases: ['CU-ALM-06'] },

    { id: 'CAP-CAT-CON-00-NAVIGATION', module: 'consumables', name: '00-access-menu-main.png', route: '/almacen/consumibles', ready: '#table', action: openMainMenu, useCases: ['CU-ALM-17'] },
    { id: 'CAP-CAT-CON-01-LIST', module: 'consumables', name: '01-list-inventory.png', route: '/almacen/consumibles', ready: '#table', action: openFilters, useCases: ['CU-ALM-17', 'CU-ALM-22'] },
    { id: 'CAP-CAT-CON-02-CREATE', module: 'consumables', name: '02-form-creation.png', route: '/almacen/consumibles', ready: '#table', action: click('button:has-text("Nuevo consumible")', '#materialModal.show'), useCases: ['CU-ALM-18'] },
    { id: 'CAP-CAT-CON-03-EDIT', module: 'consumables', name: '03-form-edit.png', route: '/almacen/consumibles', ready: '#table', action: click('#table tbody .btn-edit', '#materialModal.show', 'al menos un consumible'), useCases: ['CU-ALM-19'] },
    { id: 'CAP-CAT-CON-04-REMOVE', module: 'consumables', name: '04-remove-confirmation.png', route: '/almacen/consumibles', ready: '#table', action: click('#table tbody .btn-delete-material', '.swal2-popup', 'un consumible que pueda retirarse'), useCases: ['CU-ALM-20'] },
    { id: 'CAP-CAT-CON-05-STOCK', module: 'consumables', name: '05-adjustment-stock.png', route: '/almacen/consumibles', ready: '#table', action: click('#table tbody .btn-adjust-stock', '#materialModal.show', 'al menos un consumible'), area: 'sistemas', useCases: ['CU-ALM-21'] },
    { id: 'CAP-REP-CON-06-EXPORT', module: 'consumables', name: '06-export-report.png', route: '/almacen/consumibles', ready: '#table', action: reportDialog, useCases: ['CU-ALM-22'] },

    { id: 'CAP-CAT-SUP-00-NAVIGATION', module: 'suppliers', name: '00-access-menu-main.png', route: '/proveedores', ready: '#table', action: openMainMenu, useCases: ['CU-CAT-01'] },
    { id: 'CAP-CAT-SUP-01-LIST', module: 'suppliers', name: '01-list.png', route: '/proveedores', ready: '#table', useCases: ['CU-CAT-01', 'CU-CAT-04'] },
    { id: 'CAP-CAT-SUP-02-CREATE', module: 'suppliers', name: '02-form-creation.png', route: '/proveedores', ready: '#table', action: click('button:has-text("Nuevo proveedor")', '#supplierModal.show'), useCases: ['CU-CAT-02'] },
    { id: 'CAP-CAT-SUP-03-EDIT', module: 'suppliers', name: '03-form-edit-and-state.png', route: '/proveedores', ready: '#table', action: click('#table tbody .btn-edit', '#supplierModal.show'), area: 'sistemas', useCases: ['CU-CAT-03', 'CU-CAT-04'] },
    { id: 'CAP-CAT-SUP-04-EXPORT', module: 'suppliers', name: '04-export-report.png', route: '/proveedores', ready: '#table', action: reportDialog, area: 'sistemas', useCases: ['CU-CAT-04'] },

    { id: 'CAP-CAT-CLI-00-NAVIGATION', module: 'clients', name: '00-access-menu-main.png', route: '/clientes', ready: '#table', action: openMainMenu, useCases: ['CU-CAT-05'] },
    { id: 'CAP-CAT-CLI-01-LIST', module: 'clients', name: '01-list.png', route: '/clientes', ready: '#table', useCases: ['CU-CAT-05', 'CU-CAT-08'] },
    { id: 'CAP-CAT-CLI-02-CREATE', module: 'clients', name: '02-form-creation.png', route: '/clientes', ready: '#table', action: click('button:has-text("Nuevo cliente")', '#clientModal.show'), useCases: ['CU-CAT-06'] },
    { id: 'CAP-CAT-CLI-03-EDIT', module: 'clients', name: '03-form-edit.png', route: '/clientes', ready: '#table', action: click('#table tbody .btn-edit', '#clientModal.show'), area: 'sistemas', useCases: ['CU-CAT-07'] },
    { id: 'CAP-CAT-CLI-04-EXPORT', module: 'clients', name: '04-export-report.png', route: '/clientes', ready: '#table', action: reportDialog, area: 'sistemas', useCases: ['CU-CAT-08'] },

    { id: 'CAP-CAT-WAS-00-NAVIGATION', module: 'waste', name: '00-access-menu-main.png', route: '/almacen/mermas', ready: '#table', action: openMainMenu, useCases: ['CU-ALM-09'] },
    { id: 'CAP-CAT-WAS-01-LIST', module: 'waste', name: '01-list-inventory.png', route: '/almacen/mermas', ready: '#table', action: openFilters, useCases: ['CU-ALM-09', 'CU-ALM-14'] },
    { id: 'CAP-CAT-WAS-02-CREATE', viewport: { width: 1440, height: 1400 }, module: 'waste', name: '02-form-registration.png', route: '/almacen/mermas', ready: '#table', action: click('button:has-text("Nueva merma")', '#wasteModal.show'), useCases: ['CU-ALM-10'] },
    { id: 'CAP-CAT-WAS-03-EDIT', module: 'waste', name: '03-form-edit.png', route: '/almacen/mermas', ready: '#table', action: click('#table tbody .btn-edit', '#wasteModal.show'), useCases: ['CU-ALM-11'] },
    { id: 'CAP-CAT-WAS-04-STOCK', viewport: { width: 1440, height: 1400 }, module: 'waste', name: '04-adjustment-stock.png', route: '/almacen/mermas', ready: '#table', action: click('#table tbody .btn-adjust-stock', '#wasteModal.show'), area: 'sistemas', useCases: ['CU-ALM-12'] },
    { id: 'CAP-REP-WAS-05-EXPORT', module: 'waste', name: '05-export-report.png', route: '/almacen/mermas', ready: '#table', action: reportDialog, useCases: ['CU-ALM-14'] },
    { id: 'CAP-CAT-WAS-06-ADD-STOCK', module: 'waste', name: '06-add-stock.png', route: '/almacen/mermas', ready: '#table', actions: [click('#table tbody .btn-add-stock', '#wasteStockAdditionModal.show', 'una merma habilitada'), fill('#wasteStockAdditionQuantityInput', '2.5')], useCases: ['CU-ALM-13'] },
    { id: 'CAP-CAT-AREA-01-LIST', module: 'catalogs/areas', name: '01-list.png', route: '/catalogos/departments', ready: '#table', useCases: ['CU-CAT-09'] },
    { id: 'CAP-CAT-AREA-02-CREATE', module: 'catalogs/areas', name: '02-form-creation.png', route: '/catalogos/departments', ready: '#table', action: click('button:has-text("Nueva área")', '#catalogModal.show'), useCases: ['CU-CAT-10'] },
    { id: 'CAP-CAT-AREA-03-EDIT', module: 'catalogs/areas', name: '03-form-edit.png', route: '/catalogos/departments', ready: '#table', action: click('#table tbody .btn-edit', '#catalogModal.show', 'al menos un área'), useCases: ['CU-CAT-11'] },
    { id: 'CAP-CAT-ROLE-01-LIST', module: 'catalogs/roles', name: '01-list.png', route: '/catalogos/roles', ready: '#table', useCases: ['CU-CAT-12'] },
    { id: 'CAP-CAT-ROLE-02-CREATE', module: 'catalogs/roles', name: '02-form-creation.png', route: '/catalogos/roles', ready: '#table', action: click('button:has-text("Nuevo rol")', '#catalogModal.show'), useCases: ['CU-CAT-13'] },
    { id: 'CAP-CAT-ROLE-03-EDIT', module: 'catalogs/roles', name: '03-form-edit.png', route: '/catalogos/roles', ready: '#table', action: click('#table tbody .btn-edit', '#catalogModal.show', 'al menos un rol'), useCases: ['CU-CAT-14'] },
    { id: 'CAP-CAT-PRE-01-LIST', module: 'catalogs/presentaciones', name: '01-list.png', route: '/catalogos/presentations', ready: '#table', useCases: ['CU-CAT-15'] },
    { id: 'CAP-CAT-PRE-02-CREATE', module: 'catalogs/presentaciones', name: '02-form-creation.png', route: '/catalogos/presentations', ready: '#table', action: click('button:has-text("Nueva presentación")', '#catalogModal.show'), useCases: ['CU-CAT-16'] },
    { id: 'CAP-CAT-PRE-03-EDIT', module: 'catalogs/presentaciones', name: '03-form-edit.png', route: '/catalogos/presentations', ready: '#table', action: click('#table tbody .btn-edit', '#catalogModal.show', 'al menos una presentación'), useCases: ['CU-CAT-17'] },
    { id: 'CAP-CAT-UNIT-01-LIST', module: 'catalogs/unidades-medida', name: '01-list.png', route: '/catalogos/unit-measures', ready: '#table', useCases: ['CU-CAT-18'] },
    { id: 'CAP-CAT-UNIT-02-CREATE', module: 'catalogs/unidades-medida', name: '02-form-creation.png', route: '/catalogos/unit-measures', ready: '#table', action: click('button:has-text("Nueva unidad de medida")', '#catalogModal.show'), useCases: ['CU-CAT-19'] },
    { id: 'CAP-CAT-UNIT-03-EDIT', module: 'catalogs/unidades-medida', name: '03-form-edit.png', route: '/catalogos/unit-measures', ready: '#table', action: click('#table tbody .btn-edit', '#catalogModal.show', 'al menos una unidad de medida'), useCases: ['CU-CAT-20'] },
    { id: 'CAP-CAT-REASON-01-LIST', module: 'catalogs/motivos-ajuste', name: '01-list.png', route: '/catalogos/reasons', ready: '#table', useCases: ['CU-CAT-21'] },
    { id: 'CAP-CAT-REASON-02-CREATE', module: 'catalogs/motivos-ajuste', name: '02-form-creation.png', route: '/catalogos/reasons', ready: '#table', action: click('button:has-text("Nuevo motivo de ajuste")', '#catalogModal.show'), useCases: ['CU-CAT-22'] },
    { id: 'CAP-CAT-REASON-03-EDIT', module: 'catalogs/motivos-ajuste', name: '03-form-edit.png', route: '/catalogos/reasons', ready: '#table', action: click('#table tbody .btn-edit', '#catalogModal.show', 'al menos un motivo de ajuste'), useCases: ['CU-CAT-23'] },
    { id: 'CAP-CAT-STATUS-01-LIST', module: 'catalogs/estados-cumplimiento', name: '01-list.png', route: '/catalogos/fulfillment-statuses', ready: '#table', useCases: ['CU-CAT-24'] },
    { id: 'CAP-CAT-STATUS-02-CREATE', module: 'catalogs/estados-cumplimiento', name: '02-form-creation.png', route: '/catalogos/fulfillment-statuses', ready: '#table', action: click('button:has-text("Nuevo estado de cumplimiento")', '#catalogModal.show'), useCases: ['CU-CAT-25'] },
    { id: 'CAP-CAT-STATUS-03-EDIT', module: 'catalogs/estados-cumplimiento', name: '03-form-edit.png', route: '/catalogos/fulfillment-statuses', ready: '#table', action: click('#table tbody .btn-edit', '#catalogModal.show', 'al menos un estado de cumplimiento'), useCases: ['CU-CAT-26'] },

    { id: 'CAP-ENT-00-NAVIGATION', module: 'purchases', name: '00-access-menu-main.png', route: '/compras/materiales', ready: '#table', action: openMainMenu, useCases: ['CU-ENT-01'] },
    { id: 'CAP-ENT-01-LIST', module: 'purchases', name: '01-list.png', route: '/compras/materiales', ready: '#table', action: openFilters, useCases: ['CU-ENT-01'] },
    { id: 'CAP-ENT-02-CREATE', module: 'purchases', name: '02-form-registration.png', route: '/compras/materiales', ready: '#table', action: click('button:has-text("Nueva compra")', '#goodsReceiptModal.show'), useCases: ['CU-ENT-02'] },
    { id: 'CAP-ENT-03-EDIT', module: 'purchases', name: '03-edit-purchase.png', route: '/compras/materiales', ready: '#table', action: clickStatus('Confirmada', '.btn-edit', '#goodsReceiptModal.show', 'una compra confirmada con detalle activo'), useCases: ['CU-ENT-03', 'CU-ENT-05'] },
    { id: 'CAP-ENT-04-CORRECT', module: 'purchases', name: '04-correction-detail.png', route: '/compras/materiales', ready: '#table', actions: [clickStatus('Confirmada', '.btn-edit', '#goodsReceiptModal.show', 'una compra confirmada con detalle activo'), click('#materialTable tbody .correct-detail-btn', '#goodsReceiptCorrectionModal.show')], useCases: ['CU-ENT-04'] },
    { id: 'CAP-REP-ENT-05-EXPORT', module: 'purchases', name: '05-export-report.png', route: '/compras/materiales', ready: '#table', action: reportDialog, useCases: ['CU-ENT-06'] },
    { id: 'CAP-ENT-06-VIEW', module: 'purchases', name: '06-query-cancelled.png', route: '/compras/materiales', ready: '#table', action: clickStatus('Cancelada', '.btn-edit', '#goodsReceiptModal.show', 'una compra cancelada'), useCases: ['CU-ENT-03', 'CU-ENT-05'] },
    { id: 'CAP-ENT-CON-01-LIST', module: 'purchases', name: '07-consumables-list.png', route: '/compras/consumibles', ready: '#table', action: openFilters, useCases: ['CU-ENT-07'] },
    { id: 'CAP-ENT-CON-02-CREATE', module: 'purchases', name: '08-consumables-form-registration.png', route: '/compras/consumibles', ready: '#table', action: click('button:has-text("Nueva compra")', '#goodsReceiptModal.show'), useCases: ['CU-ENT-08'] },
    { id: 'CAP-ENT-CON-03-EDIT', module: 'purchases', name: '09-consumables-edit-purchase.png', route: '/compras/consumibles', ready: '#table', action: clickStatus('Confirmada', '.btn-edit', '#goodsReceiptModal.show', 'una compra confirmada con detalle activo'), useCases: ['CU-ENT-09'] },
    { id: 'CAP-ENT-CON-04-CORRECT', module: 'purchases', name: '10-consumables-correction-detail.png', route: '/compras/consumibles', ready: '#table', actions: [clickStatus('Confirmada', '.btn-edit', '#goodsReceiptModal.show', 'una compra confirmada con detalle activo'), click('#materialTable tbody .correct-detail-btn', '#goodsReceiptCorrectionModal.show')], useCases: ['CU-ENT-10'] },
    { id: 'CAP-ENT-CON-05-CANCEL', module: 'purchases', name: '11-consumables-cancel-detail.png', route: '/compras/consumibles', ready: '#table', actions: [clickStatus('Confirmada', '.btn-edit', '#goodsReceiptModal.show', 'una compra confirmada con detalle activo'), click('#materialTable tbody .cancel-receipt-detail-btn', '.swal2-popup')], useCases: ['CU-ENT-11'] },
    { id: 'CAP-REP-ENT-CON-06-EXPORT', module: 'purchases', name: '12-consumables-export-report.png', route: '/compras/consumibles', ready: '#table', action: reportDialog, useCases: ['CU-ENT-12'] },

    { id: 'CAP-SAL-MAT-00-NAVIGATION', module: 'material-issues', name: '00-access-menu-main.png', route: '/salidas/materiales', ready: '#table', action: openMainMenu, useCases: ['CU-SAL-01'] },
    { id: 'CAP-SAL-MAT-01-LIST', module: 'material-issues', name: '01-list.png', route: '/salidas/materiales', ready: '#table', action: openFilters, useCases: ['CU-SAL-01'] },
    { id: 'CAP-SAL-MAT-02-CREATE', module: 'material-issues', name: '02-form-registration.png', route: '/salidas/materiales', ready: '#table', action: click('button:has-text("Nueva salida")', '#goodsIssueModal.show'), useCases: ['CU-SAL-02'] },
    { id: 'CAP-SAL-MAT-03-EDIT', module: 'material-issues', name: '03-edit-header.png', route: '/salidas/materiales', ready: '#table', action: click('#table tbody .btn-edit', '#goodsIssueModal.show'), useCases: ['CU-SAL-03', 'CU-SAL-04'] },
    { id: 'CAP-SAL-MAT-04-SUPPLY', module: 'material-issues', name: '04-supply-details.png', route: '/salidas/materiales', ready: '#table', action: click('#table tbody .btn-edit-detail', '#goodsIssueModal.show'), useCases: ['CU-SAL-05'] },
    { id: 'CAP-SAL-MAT-05-RETURN', module: 'material-issues', name: '05-return-detail.png', route: '/salidas/materiales', ready: '#table', actions: [filter('#fulfillmentStatusFilter', 'Surtido'), click('#table tbody .btn-return-detail', '#goodsIssueModal.show', 'una salida de material aprobada, completamente surtida y con cantidad retornable'), click('#materialTable tbody .return-issue-detail-btn', '#issueReturnModal.show', 'un detalle surtido que todavía tenga cantidad retornable')], useCases: ['CU-SAL-06'] },
    { id: 'CAP-REP-SAL-MAT-06-EXPORT', module: 'material-issues', name: '06-export-report.png', route: '/salidas/materiales', ready: '#table', action: reportDialog, useCases: ['CU-SAL-07'] },
    { id: 'CAP-SAL-MAT-07-FILTER', module: 'material-issues', name: '07-filter-supplied.png', route: '/salidas/materiales', ready: '#table', action: filter('#fulfillmentStatusFilter', 'Surtido'), useCases: ['CU-SAL-01', 'CU-SAL-06'] },
    { id: 'CAP-SAL-MAT-08-VIEW', module: 'material-issues', name: '08-query-cancelled.png', route: '/salidas/materiales', ready: '#table', actions: [filter('#fulfillmentStatusFilter', 'Cancelado'), clickStatus('Cancelada', '.btn-edit', '#goodsIssueModal.show', 'una salida de material cancelada')], useCases: ['CU-SAL-03', 'CU-SAL-04'] },

    { id: 'CAP-SAL-CON-00-NAVIGATION', module: 'consumable-issues', name: '00-access-menu-main.png', route: '/salidas/consumibles', ready: '#table', action: openMainMenu, useCases: ['CU-SAL-15'] },
    { id: 'CAP-SAL-CON-01-LIST', module: 'consumable-issues', name: '01-list.png', route: '/salidas/consumibles', ready: '#table', action: openFilters, useCases: ['CU-SAL-15'] },
    { id: 'CAP-SAL-CON-02-CREATE', module: 'consumable-issues', name: '02-form-registration.png', route: '/salidas/consumibles', ready: '#table', action: click('button:has-text("Nueva salida")', '#goodsIssueModal.show'), useCases: ['CU-SAL-16'] },
    { id: 'CAP-SAL-CON-03-EDIT', module: 'consumable-issues', name: '03-edit-header.png', route: '/salidas/consumibles', ready: '#table', action: click('#table tbody .btn-edit', '#goodsIssueModal.show'), useCases: ['CU-SAL-17', 'CU-SAL-18'] },
    { id: 'CAP-SAL-CON-04-SUPPLY', module: 'consumable-issues', name: '04-supply-details.png', route: '/salidas/consumibles', ready: '#table', action: click('#table tbody .btn-edit-detail', '#goodsIssueModal.show'), useCases: ['CU-SAL-19'] },
    { id: 'CAP-SAL-CON-05-RETURN', module: 'consumable-issues', name: '05-return-detail.png', route: '/salidas/consumibles', ready: '#table', actions: [filter('#fulfillmentStatusFilter', 'Surtido'), click('#table tbody .btn-return-detail', '#goodsIssueModal.show', 'una salida de consumibles aprobada, completamente surtida y con cantidad retornable'), click('#materialTable tbody .return-issue-detail-btn', '#issueReturnModal.show', 'un detalle surtido que todavía tenga cantidad retornable')], useCases: ['CU-SAL-20'] },
    { id: 'CAP-REP-SAL-CON-06-EXPORT', module: 'consumable-issues', name: '06-export-report.png', route: '/salidas/consumibles', ready: '#table', action: reportDialog, useCases: ['CU-SAL-21'] },
    { id: 'CAP-SAL-CON-07-FILTER', module: 'consumable-issues', name: '07-filter-supplied.png', route: '/salidas/consumibles', ready: '#table', action: filter('#fulfillmentStatusFilter', 'Surtido'), useCases: ['CU-SAL-15', 'CU-SAL-20'] },
    { id: 'CAP-SAL-CON-08-VIEW', module: 'consumable-issues', name: '08-query-cancelled.png', route: '/salidas/consumibles', ready: '#table', actions: [filter('#fulfillmentStatusFilter', 'Cancelado'), clickStatus('Cancelada', '.btn-edit', '#goodsIssueModal.show', 'una salida de consumibles cancelada')], useCases: ['CU-SAL-17', 'CU-SAL-18'] },

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
    { id: 'CAP-IDA-PER-02-CREATE', module: 'people', name: '02-form-creation.png', route: '/personas', ready: '#table', action: click('button:has-text("Nueva persona")', '#personModal.show'), useCases: ['CU-IDA-02'] },
    { id: 'CAP-IDA-PER-03-EDIT', module: 'people', name: '03-form-edit.png', route: '/personas', ready: '#table', action: click('#table tbody .btn-edit', '#personModal.show'), useCases: ['CU-IDA-03'] },
    { id: 'CAP-IDA-PER-04-EXPORT', module: 'people', name: '04-export-report.png', route: '/personas', ready: '#table', action: reportDialog, useCases: ['CU-IDA-04'] },

    { id: 'CAP-IDA-USR-00-NAVIGATION', module: 'users', name: '00-access-menu-main.png', route: '/usuarios-sistemas', ready: '#table', action: openMainMenu, useCases: ['CU-IDA-05'] },
    { id: 'CAP-IDA-USR-01-LIST', module: 'users', name: '01-list.png', route: '/usuarios-sistemas', ready: '#table', useCases: ['CU-IDA-05', 'CU-IDA-09'] },
    { id: 'CAP-IDA-USR-02-CREATE', module: 'users', name: '02-form-creation.png', route: '/usuarios-sistemas', ready: '#table', action: click('button:has-text("Nuevo usuario")', '#userModal.show'), useCases: ['CU-IDA-06'] },
    { id: 'CAP-IDA-USR-03-EDIT', module: 'users', name: '03-form-edit.png', route: '/usuarios-sistemas', ready: '#table', action: click('#table tbody .btn-edit', '#userModal.show'), useCases: ['CU-IDA-07'] },
    { id: 'CAP-IDA-USR-04-PASSWORD', module: 'users', name: '04-change-password.png', route: '/usuarios-sistemas', ready: '#table', action: click('#table tbody .btn-edit-password', '#userModal.show'), useCases: ['CU-IDA-08'] },
    { id: 'CAP-IDA-USR-05-EXPORT', module: 'users', name: '05-export-report.png', route: '/usuarios-sistemas', ready: '#table', action: reportDialog, useCases: ['CU-IDA-09'] },

    { id: 'CAP-REP-MOV-MAT-00-NAVIGATION', module: 'material-movements', name: '00-access-menu-main.png', route: '/movimientos/materiales', ready: '#materialMovementTable', action: openMainMenu, useCases: ['CU-ALM-07'] },
    { id: 'CAP-REP-MOV-MAT-01-LIST', module: 'material-movements', name: '01-history-and-filters.png', route: '/movimientos/materiales', ready: '#materialMovementTable', action: openFilters, useCases: ['CU-ALM-07'] },
    { id: 'CAP-REP-MOV-MAT-02-EXPORT', module: 'material-movements', name: '02-export-report.png', route: '/movimientos/materiales', ready: '#materialMovementTable', action: reportDialog, useCases: ['CU-ALM-08'] },
    { id: 'CAP-REP-MOV-CON-00-NAVIGATION', module: 'consumable-movements', name: '00-access-menu-main.png', route: '/movimientos/consumibles', ready: '#consumableMovementTable', action: openMainMenu, useCases: ['CU-ALM-23'] },
    { id: 'CAP-REP-MOV-CON-01-LIST', module: 'consumable-movements', name: '01-history-and-filters.png', route: '/movimientos/consumibles', ready: '#consumableMovementTable', action: openFilters, useCases: ['CU-ALM-23'] },
    { id: 'CAP-REP-MOV-CON-02-EXPORT', module: 'consumable-movements', name: '02-export-report.png', route: '/movimientos/consumibles', ready: '#consumableMovementTable', action: reportDialog, useCases: ['CU-ALM-24'] },
    { id: 'CAP-REP-MOV-WAS-00-NAVIGATION', module: 'waste-movements', name: '00-access-menu-main.png', route: '/movimientos/mermas', ready: '#wasteMovementTable', action: openMainMenu, useCases: ['CU-ALM-15'] },
    { id: 'CAP-REP-MOV-WAS-01-LIST', module: 'waste-movements', name: '01-history-and-filters.png', route: '/movimientos/mermas', ready: '#wasteMovementTable', action: openFilters, useCases: ['CU-ALM-15'] },
    { id: 'CAP-REP-MOV-WAS-02-EXPORT', module: 'waste-movements', name: '02-export-report.png', route: '/movimientos/mermas', ready: '#wasteMovementTable', action: reportDialog, useCases: ['CU-ALM-16'] },

    { id: 'CAP-CAT-WAS-07-ROLL-WEIGHT', module: 'waste', name: '07-roll-unit-weight.png', route: '/almacen/mermas', ready: '#table', action: click('#table tbody tr:has-text("ROLLO") .btn-edit', '#wasteModal.show', 'una merma de Rollo con peso capturado'), useCases: ['CU-ALM-10', 'CU-ALM-11'] },
    { id: 'CAP-CAT-WAS-08-REFERENCE', viewport: { width: 1000, height: 650 }, module: 'waste', name: '08-roll-reference.png', route: '/almacen/mermas', ready: '#table', action: { ...click('.btn-edit', '#wasteModal .waste-roll-reference-fields:not(.d-none)', 'una merma de Rollo con muestra registrada'), hasFields: ['referenceRollTotalWeightKg'] }, useCases: ['CU-ALM-10', 'CU-ALM-11'] },

    { id: 'CAP-ERR-404-NOT-FOUND', module: 'errors', name: '01-page-not-found.png', route: '/pagina-no-existente-manual', ready: '.error-card', area: 'almacen', unauthenticated: true, useCases: [] },
    { id: 'CAP-ERR-404-SISTEMAS-NOT-FOUND', module: 'errors', name: '01-page-not-found.png', route: '/pagina-no-existente-manual', ready: '.error-card', area: 'sistemas', unauthenticated: true, useCases: [] }
];

const systemAreaModules = ['catalogs/', 'users', 'material-movements', 'consumable-movements', 'waste-movements'];
const sharedOperationalModules = [
    'materials',
    'consumables',
    'waste',
    'suppliers',
    'clients',
    'purchases',
    'material-issues',
    'consumable-issues',
    'waste-issues',
    'people'
];
const getCaptureArea = capture => systemAreaModules.some(module => capture.module.startsWith(module))
    ? 'sistemas'
    : 'almacen';
export const getCaptureScopePath = capture => path.join('areas', capture.area);

for (const capture of captureTemplates) capture.area ??= getCaptureArea(capture);

export const captures = captureTemplates.flatMap(capture => {
    if (capture.area !== 'almacen'
        || !sharedOperationalModules.includes(capture.module)
        || capture.unauthenticated
        || capture.id.startsWith('CAP-AUT-')) {
        return [capture];
    }
    return [
        capture,
        { ...capture, area: 'sistemas' }
    ];
}).map(capture => ({
    ...capture,
    id: `${ capture.id.replace(/-(?:ALMACEN|SISTEMAS)(?=-|$)/, '') }-${ capture.area.toUpperCase() }`,
    useCases: capture.area === 'almacen'
        ? capture.useCases.filter(id => !['CU-CAT-03', 'CU-CAT-04', 'CU-CAT-07', 'CU-CAT-08'].includes(id))
        : capture.useCases
}));

export const validateInventory = () => {
    const ids = new Set();
    const paths = new Set();

    for (const capture of captures) {
        const relativePath = path.join(getCaptureScopePath(capture), capture.module, capture.name);
        if (ids.has(capture.id)) throw new Error(`Identificador de captura duplicado: ${ capture.id }`);
        if (paths.has(relativePath)) throw new Error(`Ruta de captura duplicada: ${ relativePath }`);
        ids.add(capture.id);
        paths.add(relativePath);
    }
};
