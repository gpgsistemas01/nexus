import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const baseURL = process.env.DOCS_BASE_URL ?? 'http://127.0.0.1:3000';
const storageState = process.env.DOCS_STORAGE_STATE;
const loginName = process.env.DOCS_LOGIN_NAME;
const loginPassword = process.env.DOCS_LOGIN_PASSWORD;
const requestedCaptureIds = (process.env.DOCS_CAPTURE_IDS ?? '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);
const outputRoot = path.resolve('docs/user-manual/images');
const screenshotDelay = 1500;

const click = (selector, ready, requirement) => ({ selector, ready, requirement });
const filter = (selector, label) => ({ selector, label, filter: true });
const openFilters = click('.table-filters-summary', '#tableFiltersForm:visible');
const reportDialog = click('.datatable-export-button', '.report-export-modal');
const openMainMenu = click('#appMenuOffcanvasBtn', '#appMenu.show');
const formatCoverage = (useCases) => useCases.length ? useCases.join(', ') : 'Transversal';

// El orden de este inventario es el orden narrativo del manual. Los identificadores son
// estables; el número del archivo sólo ordena las imágenes dentro de cada módulo.
const captures = [
    { id: 'CAP-AUT-01-LOGIN', module: 'acceso', name: '01-inicio-sesion.png', route: '/inicio-sesion', ready: '#loginForm', public: true, useCases: ['CU-AUT-01'] },
    { id: 'CAP-AUT-02-MENU', module: 'acceso', name: '02-menu-principal.png', route: '/almacen/materiales', ready: '#table', action: openMainMenu, useCases: ['CU-AUT-02'] },

    { id: 'CAP-CAT-MAT-00-NAVIGATION', module: 'materiales', name: '00-acceso-menu-principal.png', route: '/almacen/materiales', ready: '#table', action: openMainMenu, useCases: ['CU-CAT-01'] },
    { id: 'CAP-CAT-MAT-01-LIST', module: 'materiales', name: '01-listado-inventario.png', route: '/almacen/materiales', ready: '#table', action: openFilters, useCases: ['CU-CAT-01', 'CU-REP-01', 'CU-REP-03'] },
    { id: 'CAP-CAT-MAT-02-CREATE', module: 'materiales', name: '02-formulario-alta.png', route: '/almacen/materiales', ready: '#table', action: click('button:has-text("Nuevo material")', '#materialModal.show'), useCases: ['CU-CAT-02', 'CU-CAT-17', 'CU-CAT-18'] },
    { id: 'CAP-CAT-MAT-03-EDIT', module: 'materiales', name: '03-formulario-edicion.png', route: '/almacen/materiales', ready: '#table', action: click('#table tbody .btn-edit', '#materialModal.show'), useCases: ['CU-CAT-03', 'CU-CAT-04'] },
    { id: 'CAP-CAT-MAT-04-STOCK', module: 'materiales', name: '04-ajuste-existencia.png', route: '/almacen/materiales', ready: '#table', action: click('#table tbody .btn-adjust-stock', '#materialModal.show'), useCases: ['CU-CAT-05', 'CU-CAT-19'] },
    { id: 'CAP-REP-MAT-05-EXPORT', module: 'materiales', name: '05-exportar-reporte.png', route: '/almacen/materiales', ready: '#table', action: reportDialog, useCases: ['CU-REP-03'] },

    { id: 'CAP-CAT-SUP-00-NAVIGATION', module: 'proveedores', name: '00-acceso-menu-principal.png', route: '/proveedores', ready: '#table', action: openMainMenu, useCases: ['CU-CAT-06'] },
    { id: 'CAP-CAT-SUP-01-LIST', module: 'proveedores', name: '01-listado.png', route: '/proveedores', ready: '#table', useCases: ['CU-CAT-06', 'CU-REP-12'] },
    { id: 'CAP-CAT-SUP-02-CREATE', module: 'proveedores', name: '02-formulario-alta.png', route: '/proveedores', ready: '#table', action: click('button:has-text("Nuevo proveedor")', '#supplierModal.show'), useCases: ['CU-CAT-07'] },
    { id: 'CAP-CAT-SUP-03-EDIT', module: 'proveedores', name: '03-formulario-edicion-y-estado.png', route: '/proveedores', ready: '#table', action: click('#table tbody .btn-edit', '#supplierModal.show'), useCases: ['CU-CAT-08', 'CU-CAT-09'] },

    { id: 'CAP-CAT-CLI-00-NAVIGATION', module: 'clientes', name: '00-acceso-menu-principal.png', route: '/clientes', ready: '#table', action: openMainMenu, useCases: ['CU-CAT-10'] },
    { id: 'CAP-CAT-CLI-01-LIST', module: 'clientes', name: '01-listado.png', route: '/clientes', ready: '#table', useCases: ['CU-CAT-10', 'CU-REP-13'] },
    { id: 'CAP-CAT-CLI-02-CREATE', module: 'clientes', name: '02-formulario-alta.png', route: '/clientes', ready: '#table', action: click('button:has-text("Nuevo cliente")', '#clientModal.show'), useCases: ['CU-CAT-11'] },
    { id: 'CAP-CAT-CLI-03-EDIT', module: 'clientes', name: '03-formulario-edicion.png', route: '/clientes', ready: '#table', action: click('#table tbody .btn-edit', '#clientModal.show'), useCases: ['CU-CAT-12'] },

    { id: 'CAP-CAT-WAS-00-NAVIGATION', module: 'mermas', name: '00-acceso-menu-principal.png', route: '/almacen/mermas', ready: '#table', action: openMainMenu, useCases: ['CU-CAT-13'] },
    { id: 'CAP-CAT-WAS-01-LIST', module: 'mermas', name: '01-listado-inventario.png', route: '/almacen/mermas', ready: '#table', action: openFilters, useCases: ['CU-CAT-13', 'CU-REP-06', 'CU-REP-09'] },
    { id: 'CAP-CAT-WAS-02-CREATE', module: 'mermas', name: '02-formulario-registro.png', route: '/almacen/mermas', ready: '#table', action: click('button:has-text("Nueva merma")', '#wasteModal.show'), useCases: ['CU-CAT-14'] },
    { id: 'CAP-CAT-WAS-03-EDIT', module: 'mermas', name: '03-formulario-edicion.png', route: '/almacen/mermas', ready: '#table', action: click('#table tbody .btn-edit', '#wasteModal.show'), useCases: ['CU-CAT-15'] },
    { id: 'CAP-CAT-WAS-04-STOCK', module: 'mermas', name: '04-ajuste-existencia.png', route: '/almacen/mermas', ready: '#table', action: click('#table tbody .btn-adjust-stock', '#wasteModal.show'), useCases: ['CU-CAT-16'] },
    { id: 'CAP-REP-WAS-05-EXPORT', module: 'mermas', name: '05-exportar-reporte.png', route: '/almacen/mermas', ready: '#table', action: reportDialog, useCases: ['CU-REP-09'] },
    { id: 'CAP-ENT-00-NAVIGATION', module: 'compras', name: '00-acceso-menu-principal.png', route: '/compras', ready: '#table', action: openMainMenu, useCases: ['CU-ENT-01'] },
    { id: 'CAP-ENT-01-LIST', module: 'compras', name: '01-listado.png', route: '/compras', ready: '#table', action: openFilters, useCases: ['CU-ENT-01'] },
    { id: 'CAP-ENT-02-CREATE', module: 'compras', name: '02-formulario-registro.png', route: '/compras', ready: '#table', action: click('button:has-text("Nueva compra")', '#goodsReceiptModal.show'), useCases: ['CU-ENT-02'] },
    { id: 'CAP-ENT-03-EDIT', module: 'compras', name: '03-edicion-compra.png', route: '/compras', ready: '#table', action: click('#table tbody .btn-edit', '#goodsReceiptModal.show'), useCases: ['CU-ENT-03', 'CU-ENT-05'] },
    { id: 'CAP-ENT-04-CORRECT', module: 'compras', name: '04-correccion-detalle.png', route: '/compras', ready: '#table', actions: [click('#table tbody .btn-edit', '#goodsReceiptModal.show'), click('#materialTable tbody .correct-detail-btn', '#goodsReceiptCorrectionModal.show')], useCases: ['CU-ENT-04'] },
    { id: 'CAP-REP-ENT-05-EXPORT', module: 'compras', name: '05-exportar-reporte.png', route: '/compras', ready: '#table', action: reportDialog, useCases: ['CU-REP-11'] },

    { id: 'CAP-SAL-MAT-00-NAVIGATION', module: 'salidas-material', name: '00-acceso-menu-principal.png', route: '/salidas/materiales', ready: '#table', action: openMainMenu, useCases: ['CU-SAL-01'] },
    { id: 'CAP-SAL-MAT-01-LIST', module: 'salidas-material', name: '01-listado.png', route: '/salidas/materiales', ready: '#table', action: openFilters, useCases: ['CU-CAT-20', 'CU-SAL-01'] },
    { id: 'CAP-SAL-MAT-02-CREATE', module: 'salidas-material', name: '02-formulario-registro.png', route: '/salidas/materiales', ready: '#table', action: click('button:has-text("Nueva salida")', '#goodsIssueModal.show'), useCases: ['CU-SAL-02'] },
    { id: 'CAP-SAL-MAT-03-EDIT', module: 'salidas-material', name: '03-edicion-encabezado.png', route: '/salidas/materiales', ready: '#table', action: click('#table tbody .btn-edit', '#goodsIssueModal.show'), useCases: ['CU-SAL-03', 'CU-SAL-04'] },
    { id: 'CAP-SAL-MAT-04-SUPPLY', module: 'salidas-material', name: '04-surtir-detalles.png', route: '/salidas/materiales', ready: '#table', action: click('#table tbody .btn-edit-detail', '#goodsIssueModal.show'), useCases: ['CU-SAL-05'] },
    { id: 'CAP-SAL-MAT-05-RETURN', module: 'salidas-material', name: '05-devolver-detalle.png', route: '/salidas/materiales', ready: '#table', actions: [filter('#fulfillmentStatusFilter', 'Surtido'), click('#table tbody .btn-return-detail', '#goodsIssueModal.show', 'una salida de material aprobada, completamente surtida y con cantidad retornable'), click('#materialTable tbody .return-issue-detail-btn', '#issueReturnModal.show', 'un detalle surtido que todavía tenga cantidad retornable')], useCases: ['CU-SAL-06'] },
    { id: 'CAP-REP-SAL-MAT-06-EXPORT', module: 'salidas-material', name: '06-exportar-reporte.png', route: '/salidas/materiales', ready: '#table', action: reportDialog, useCases: ['CU-REP-04'] },
    { id: 'CAP-SAL-MAT-07-FILTER', module: 'salidas-material', name: '07-filtro-surtido.png', route: '/salidas/materiales', ready: '#table', action: filter('#fulfillmentStatusFilter', 'Surtido'), useCases: ['CU-SAL-01', 'CU-SAL-06'] },

    { id: 'CAP-SAL-WAS-00-NAVIGATION', module: 'salidas-merma', name: '00-acceso-menu-principal.png', route: '/salidas/mermas', ready: '#table', action: openMainMenu, useCases: ['CU-SAL-07'] },
    { id: 'CAP-SAL-WAS-01-LIST', module: 'salidas-merma', name: '01-listado.png', route: '/salidas/mermas', ready: '#table', action: openFilters, useCases: ['CU-SAL-07', 'CU-REP-08'] },
    { id: 'CAP-SAL-WAS-02-CREATE', module: 'salidas-merma', name: '02-formulario-registro.png', route: '/salidas/mermas', ready: '#table', action: click('button:has-text("Nueva salida")', '#wasteIssueModal.show', 'el permiso para administrar salidas de merma'), useCases: ['CU-SAL-08'] },
    { id: 'CAP-SAL-WAS-03-EDIT', module: 'salidas-merma', name: '03-edicion-encabezado.png', route: '/salidas/mermas', ready: '#table', action: click('#table tbody .btn-edit', '#wasteIssueModal.show'), useCases: ['CU-SAL-09', 'CU-SAL-10'] },
    { id: 'CAP-SAL-WAS-04-SUPPLY', module: 'salidas-merma', name: '04-surtir-detalles.png', route: '/salidas/mermas', ready: '#table', action: click('#table tbody .btn-edit-detail', '#wasteIssueModal.show'), useCases: ['CU-SAL-11'] },
    { id: 'CAP-SAL-WAS-05-RETURN', module: 'salidas-merma', name: '05-devolver-detalle.png', route: '/salidas/mermas', ready: '#table', actions: [filter('#fulfillmentStatusFilter', 'Surtido'), click('#table tbody .btn-return-detail', '#wasteIssueModal.show', 'una salida de merma aprobada, completamente surtida y con cantidad retornable'), click('#materialTable tbody .return-issue-detail-btn', '#issueReturnModal.show', 'un detalle surtido que todavía tenga cantidad retornable')], useCases: ['CU-SAL-12'] },
    { id: 'CAP-REP-SAL-WAS-06-EXPORT', module: 'salidas-merma', name: '06-exportar-reporte.png', route: '/salidas/mermas', ready: '#table', action: reportDialog, useCases: ['CU-REP-08'] },
    { id: 'CAP-SAL-WAS-07-FILTER', module: 'salidas-merma', name: '07-filtro-surtido.png', route: '/salidas/mermas', ready: '#table', action: filter('#fulfillmentStatusFilter', 'Surtido'), useCases: ['CU-SAL-07', 'CU-SAL-12'] },

    { id: 'CAP-IDA-PER-00-NAVIGATION', module: 'personas', name: '00-acceso-menu-principal.png', route: '/personas', ready: '#table', action: openMainMenu, useCases: ['CU-IDA-01'] },
    { id: 'CAP-IDA-PER-01-LIST', module: 'personas', name: '01-listado.png', route: '/personas', ready: '#table', action: openFilters, useCases: ['CU-IDA-01', 'CU-REP-14'] },
    { id: 'CAP-IDA-PER-02-CREATE', module: 'personas', name: '02-formulario-alta.png', route: '/personas', ready: '#table', action: click('button:has-text("Nueva persona")', '#personModal.show'), useCases: ['CU-IDA-02', 'CU-IDA-08', 'CU-IDA-09'] },
    { id: 'CAP-IDA-PER-03-EDIT', module: 'personas', name: '03-formulario-edicion.png', route: '/personas', ready: '#table', action: click('#table tbody .btn-edit', '#personModal.show'), useCases: ['CU-IDA-03'] },

    { id: 'CAP-IDA-USR-00-NAVIGATION', module: 'usuarios', name: '00-acceso-menu-principal.png', route: '/usuarios-sistemas', ready: '#table', action: openMainMenu, useCases: ['CU-IDA-04'] },
    { id: 'CAP-IDA-USR-01-LIST', module: 'usuarios', name: '01-listado.png', route: '/usuarios-sistemas', ready: '#table', useCases: ['CU-IDA-04', 'CU-REP-15'] },
    { id: 'CAP-IDA-USR-02-CREATE', module: 'usuarios', name: '02-formulario-alta.png', route: '/usuarios-sistemas', ready: '#table', action: click('button:has-text("Nuevo usuario")', '#userModal.show'), useCases: ['CU-IDA-05'] },
    { id: 'CAP-IDA-USR-03-EDIT', module: 'usuarios', name: '03-formulario-edicion.png', route: '/usuarios-sistemas', ready: '#table', action: click('#table tbody .btn-edit', '#userModal.show'), useCases: ['CU-IDA-06'] },
    { id: 'CAP-IDA-USR-04-PASSWORD', module: 'usuarios', name: '04-cambio-contrasena.png', route: '/usuarios-sistemas', ready: '#table', action: click('#table tbody .btn-edit-password', '#userModal.show'), useCases: ['CU-IDA-07'] },

    { id: 'CAP-REP-MOV-MAT-00-NAVIGATION', module: 'movimientos-material', name: '00-acceso-menu-principal.png', route: '/movimientos/materiales', ready: '#materialMovementTable', action: openMainMenu, useCases: ['CU-REP-02'] },
    { id: 'CAP-REP-MOV-MAT-01-LIST', module: 'movimientos-material', name: '01-historial-y-filtros.png', route: '/movimientos/materiales', ready: '#materialMovementTable', action: openFilters, useCases: ['CU-REP-02'] },
    { id: 'CAP-REP-MOV-MAT-02-EXPORT', module: 'movimientos-material', name: '02-exportar-reporte.png', route: '/movimientos/materiales', ready: '#materialMovementTable', action: reportDialog, useCases: ['CU-REP-05'] },
    { id: 'CAP-REP-MOV-WAS-00-NAVIGATION', module: 'movimientos-merma', name: '00-acceso-menu-principal.png', route: '/movimientos/mermas', ready: '#wasteMovementTable', action: openMainMenu, useCases: ['CU-REP-07'] },
    { id: 'CAP-REP-MOV-WAS-01-LIST', module: 'movimientos-merma', name: '01-historial-y-filtros.png', route: '/movimientos/mermas', ready: '#wasteMovementTable', action: openFilters, useCases: ['CU-REP-07'] },
    { id: 'CAP-REP-MOV-WAS-02-EXPORT', module: 'movimientos-merma', name: '02-exportar-reporte.png', route: '/movimientos/mermas', ready: '#wasteMovementTable', action: reportDialog, useCases: ['CU-REP-10'] },

    { id: 'CAP-ERR-404-NOT-FOUND', module: 'errores', name: '01-pagina-no-encontrada.png', route: '/pagina-no-existente-manual', ready: '.error-card', public: true, useCases: [] }
];

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
    if (!requestedCaptureIds.length) return captures;

    const capturesById = new Map(captures.map(capture => [capture.id, capture]));
    const unknownIds = requestedCaptureIds.filter(id => !capturesById.has(id));
    if (unknownIds.length) {
        throw new Error(`DOCS_CAPTURE_IDS contiene identificadores desconocidos: ${ unknownIds.join(', ') }`);
    }

    return [...new Set(requestedCaptureIds)].map(id => capturesById.get(id));
};

const waitForDataTableReady = async (page) => {
    await page.waitForFunction(() => {
        const table = globalThis.$?.('#table');
        if (!table || !globalThis.$.fn.DataTable.isDataTable(table)) return false;

        const settings = table.DataTable().settings()[0];
        return settings.iDraw > 0 && !settings.bDrawing;
    });
};

const findTriggerAcrossPages = async (page, selector) => {
    const visibleTrigger = page.locator(`${ selector }:visible`).first();
    await page.locator('#table tbody tr').first().waitFor({ state: 'visible' });

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

    const trigger = action.selector.startsWith('#table tbody ')
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
    if (capture.ready === '#table') await waitForDataTableReady(page);

    const actions = capture.actions ?? (capture.action ? [capture.action] : []);
    for (const [index, action] of actions.entries()) {
        await runAction(page, action, capture.id, `${ index + 1 }/${ actions.length }`);
    }

    await page.waitForTimeout(screenshotDelay);
    await page.screenshot({ path: path.join(directory, capture.name) });
    console.log(`${ capture.id } -> ${ path.join(capture.module, capture.name) } [${ formatCoverage(capture.useCases) }]`);
};

const login = async (page) => {
    await page.goto(new URL('/inicio-sesion', baseURL).href, { waitUntil: 'domcontentloaded' });
    await page.locator('#loginForm').waitFor({ state: 'visible' });
    await page.locator('#nameInput').fill(loginName);
    await page.locator('#passwordInput').fill(loginPassword);
    await Promise.all([
        page.waitForURL(url => url.pathname === '/almacen/materiales'),
        page.locator('#submitBtn').click()
    ]);
    console.log('Sesión de capturas iniciada automáticamente.');
};

validateInventory();
const selectedCaptures = selectCaptures();

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

const protectedCaptures = selectedCaptures.filter(item => !item.public);
if (Boolean(loginName) !== Boolean(loginPassword)) {
    throw new Error('DOCS_LOGIN_NAME y DOCS_LOGIN_PASSWORD deben definirse juntos.');
}
if (storageState && loginName) {
    throw new Error('Use credenciales automáticas o DOCS_STORAGE_STATE, no ambos mecanismos.');
}
if (protectedCaptures.length && !storageState && !loginName) {
    throw new Error('Defina DOCS_LOGIN_NAME y DOCS_LOGIN_PASSWORD, o proporcione DOCS_STORAGE_STATE, para generar las capturas protegidas.');
}

if (requestedCaptureIds.length) {
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
    const publicPage = await publicContext.newPage();

    for (const capture of selectedCaptures.filter(item => item.public)) await capturePage(publicPage, capture);
    await publicContext.close();

    const authenticatedContext = await browser.newContext({ ...contextOptions, ...(storageState ? { storageState } : {}) });
    const authenticatedPage = await authenticatedContext.newPage();
    if (!storageState) await login(authenticatedPage);
    for (const capture of protectedCaptures) await capturePage(authenticatedPage, capture);
    await authenticatedContext.close();
} finally {
    await browser.close();
}

if (storageState) await rm(storageState, { force: true });
console.log(`Capturas generadas en ${ path.relative(process.cwd(), outputRoot) }.`);
if (storageState) console.log('Estado temporal de autenticación eliminado.');
