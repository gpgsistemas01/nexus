import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const baseURL = process.env.DOCS_BASE_URL ?? 'http://127.0.0.1:3000';
const storageState = process.env.DOCS_STORAGE_STATE;
const outputRoot = path.resolve('docs/user-manual/images');

const click = (selector, ready) => ({ selector, ready });
const reportDialog = click('.datatable-export-button', '.report-export-modal');
const formatCoverage = (useCases) => useCases.length ? useCases.join(', ') : 'Transversal';

// El orden de este inventario es el orden narrativo del manual. Los identificadores son
// estables; el número del archivo sólo ordena las imágenes dentro de cada módulo.
const captures = [
    { id: 'CAP-AUT-01-LOGIN', module: 'acceso', name: '01-inicio-sesion.png', route: '/inicio-sesion', ready: '#loginForm', public: true, useCases: ['CU-AUT-01'] },

    { id: 'CAP-CAT-MAT-01-LIST', module: 'materiales', name: '01-listado-inventario.png', route: '/almacen/materiales', ready: '#table', useCases: ['CU-AUT-02', 'CU-CAT-01', 'CU-REP-01', 'CU-REP-03'] },
    { id: 'CAP-CAT-MAT-02-CREATE', module: 'materiales', name: '02-formulario-alta.png', route: '/almacen/materiales', ready: '#table', action: click('button:has-text("Nuevo material")', '#materialModal.show'), useCases: ['CU-CAT-02', 'CU-CAT-17', 'CU-CAT-18'] },
    { id: 'CAP-CAT-MAT-03-EDIT', module: 'materiales', name: '03-formulario-edicion.png', route: '/almacen/materiales', ready: '#table', action: click('#table tbody .btn-edit', '#materialModal.show'), useCases: ['CU-CAT-03', 'CU-CAT-04'] },
    { id: 'CAP-CAT-MAT-04-STOCK', module: 'materiales', name: '04-ajuste-existencia.png', route: '/almacen/materiales', ready: '#table', action: click('#table tbody .btn-adjust-stock', '#materialModal.show'), useCases: ['CU-CAT-05', 'CU-CAT-19'] },

    { id: 'CAP-CAT-SUP-01-LIST', module: 'proveedores', name: '01-listado.png', route: '/proveedores', ready: '#table', useCases: ['CU-CAT-06', 'CU-REP-12'] },
    { id: 'CAP-CAT-SUP-02-CREATE', module: 'proveedores', name: '02-formulario-alta.png', route: '/proveedores', ready: '#table', action: click('button:has-text("Nuevo proveedor")', '#supplierModal.show'), useCases: ['CU-CAT-07'] },
    { id: 'CAP-CAT-SUP-03-EDIT', module: 'proveedores', name: '03-formulario-edicion-y-estado.png', route: '/proveedores', ready: '#table', action: click('#table tbody .btn-edit', '#supplierModal.show'), useCases: ['CU-CAT-08', 'CU-CAT-09'] },

    { id: 'CAP-CAT-CLI-01-LIST', module: 'clientes', name: '01-listado.png', route: '/clientes', ready: '#table', useCases: ['CU-CAT-10', 'CU-REP-13'] },
    { id: 'CAP-CAT-CLI-02-CREATE', module: 'clientes', name: '02-formulario-alta.png', route: '/clientes', ready: '#table', action: click('button:has-text("Nuevo cliente")', '#clientModal.show'), useCases: ['CU-CAT-11'] },
    { id: 'CAP-CAT-CLI-03-EDIT', module: 'clientes', name: '03-formulario-edicion.png', route: '/clientes', ready: '#table', action: click('#table tbody .btn-edit', '#clientModal.show'), useCases: ['CU-CAT-12'] },

    { id: 'CAP-CAT-WAS-01-LIST', module: 'mermas', name: '01-listado-inventario.png', route: '/almacen/mermas', ready: '#table', useCases: ['CU-CAT-13', 'CU-REP-06', 'CU-REP-09'] },
    { id: 'CAP-CAT-WAS-02-CREATE', module: 'mermas', name: '02-formulario-registro.png', route: '/almacen/mermas', ready: '#table', action: click('button:has-text("Nueva merma")', '#wasteModal.show'), useCases: ['CU-CAT-14'] },
    { id: 'CAP-CAT-WAS-03-EDIT', module: 'mermas', name: '03-formulario-edicion.png', route: '/almacen/mermas', ready: '#table', action: click('#table tbody .btn-edit', '#wasteModal.show'), useCases: ['CU-CAT-15'] },
    { id: 'CAP-CAT-WAS-04-STOCK', module: 'mermas', name: '04-ajuste-existencia.png', route: '/almacen/mermas', ready: '#table', action: click('#table tbody .btn-adjust-stock', '#wasteModal.show'), useCases: ['CU-CAT-16'] },
    { id: 'CAP-REP-WAS-05-EXPORT', module: 'mermas', name: '05-exportar-reporte.png', route: '/almacen/mermas', ready: '#table', action: reportDialog, useCases: ['CU-REP-09'] },

    { id: 'CAP-ENT-01-LIST', module: 'compras', name: '01-listado.png', route: '/compras', ready: '#table', useCases: ['CU-ENT-01'] },
    { id: 'CAP-ENT-02-CREATE', module: 'compras', name: '02-formulario-registro.png', route: '/compras', ready: '#table', action: click('button:has-text("Nueva compra")', '#goodsReceiptModal.show'), useCases: ['CU-ENT-02'] },
    { id: 'CAP-ENT-03-EDIT', module: 'compras', name: '03-edicion-compra.png', route: '/compras', ready: '#table', action: click('#table tbody .btn-edit', '#goodsReceiptModal.show'), useCases: ['CU-ENT-03', 'CU-ENT-05'] },
    { id: 'CAP-ENT-04-CORRECT', module: 'compras', name: '04-correccion-detalle.png', route: '/compras', ready: '#table', actions: [click('#table tbody .btn-edit', '#goodsReceiptModal.show'), click('#materialTable tbody .correct-detail-btn', '#goodsReceiptCorrectionModal.show')], useCases: ['CU-ENT-04'] },
    { id: 'CAP-REP-ENT-05-EXPORT', module: 'compras', name: '05-exportar-reporte.png', route: '/compras', ready: '#table', action: reportDialog, useCases: ['CU-REP-11'] },

    { id: 'CAP-SAL-MAT-01-LIST', module: 'salidas-material', name: '01-listado.png', route: '/salidas/materiales', ready: '#table', useCases: ['CU-CAT-20', 'CU-SAL-01'] },
    { id: 'CAP-SAL-MAT-02-CREATE', module: 'salidas-material', name: '02-formulario-registro.png', route: '/salidas/materiales', ready: '#table', action: click('button:has-text("Nueva salida")', '#goodsIssueModal.show'), useCases: ['CU-SAL-02'] },
    { id: 'CAP-SAL-MAT-03-EDIT', module: 'salidas-material', name: '03-edicion-encabezado.png', route: '/salidas/materiales', ready: '#table', action: click('#table tbody .btn-edit', '#goodsIssueModal.show'), useCases: ['CU-SAL-03', 'CU-SAL-04'] },
    { id: 'CAP-SAL-MAT-04-SUPPLY', module: 'salidas-material', name: '04-surtir-detalles.png', route: '/salidas/materiales', ready: '#table', action: click('#table tbody .btn-edit-detail', '#goodsIssueModal.show'), useCases: ['CU-SAL-05'] },
    { id: 'CAP-SAL-MAT-05-RETURN', module: 'salidas-material', name: '05-devolver-detalle.png', route: '/salidas/materiales', ready: '#table', actions: [click('#table tbody .btn-return-detail', '#goodsIssueModal.show'), click('#materialTable tbody .return-issue-detail-btn', '#issueReturnModal.show')], useCases: ['CU-SAL-06'] },
    { id: 'CAP-REP-SAL-MAT-06-EXPORT', module: 'salidas-material', name: '06-exportar-reporte.png', route: '/salidas/materiales', ready: '#table', action: reportDialog, useCases: ['CU-REP-04'] },

    { id: 'CAP-SAL-WAS-01-LIST', module: 'salidas-merma', name: '01-listado.png', route: '/salidas/mermas', ready: '#table', useCases: ['CU-SAL-07', 'CU-REP-08'] },
    { id: 'CAP-SAL-WAS-02-CREATE', module: 'salidas-merma', name: '02-formulario-registro.png', route: '/salidas/mermas', ready: '#table', action: click('button:has-text("Nueva salida")', '#wasteIssueModal.show'), useCases: ['CU-SAL-08'] },
    { id: 'CAP-SAL-WAS-03-EDIT', module: 'salidas-merma', name: '03-edicion-encabezado.png', route: '/salidas/mermas', ready: '#table', action: click('#table tbody .btn-edit', '#wasteIssueModal.show'), useCases: ['CU-SAL-09', 'CU-SAL-10'] },
    { id: 'CAP-SAL-WAS-04-SUPPLY', module: 'salidas-merma', name: '04-surtir-detalles.png', route: '/salidas/mermas', ready: '#table', action: click('#table tbody .btn-edit-detail', '#wasteIssueModal.show'), useCases: ['CU-SAL-11'] },
    { id: 'CAP-SAL-WAS-05-RETURN', module: 'salidas-merma', name: '05-devolver-detalle.png', route: '/salidas/mermas', ready: '#table', actions: [click('#table tbody .btn-return-detail', '#wasteIssueModal.show'), click('#materialTable tbody .return-issue-detail-btn', '#issueReturnModal.show')], useCases: ['CU-SAL-12'] },
    { id: 'CAP-REP-SAL-WAS-06-EXPORT', module: 'salidas-merma', name: '06-exportar-reporte.png', route: '/salidas/mermas', ready: '#table', action: reportDialog, useCases: ['CU-REP-08'] },

    { id: 'CAP-IDA-PER-01-LIST', module: 'personas', name: '01-listado.png', route: '/personas', ready: '#table', useCases: ['CU-IDA-01', 'CU-REP-14'] },
    { id: 'CAP-IDA-PER-02-CREATE', module: 'personas', name: '02-formulario-alta.png', route: '/personas', ready: '#table', action: click('button:has-text("Nueva persona")', '#personModal.show'), useCases: ['CU-IDA-02', 'CU-IDA-08', 'CU-IDA-09'] },
    { id: 'CAP-IDA-PER-03-EDIT', module: 'personas', name: '03-formulario-edicion.png', route: '/personas', ready: '#table', action: click('#table tbody .btn-edit', '#personModal.show'), useCases: ['CU-IDA-03'] },

    { id: 'CAP-IDA-USR-01-LIST', module: 'usuarios', name: '01-listado.png', route: '/usuarios-sistemas', ready: '#table', useCases: ['CU-IDA-04', 'CU-REP-15'] },
    { id: 'CAP-IDA-USR-02-CREATE', module: 'usuarios', name: '02-formulario-alta.png', route: '/usuarios-sistemas', ready: '#table', action: click('button:has-text("Nuevo usuario")', '#userModal.show'), useCases: ['CU-IDA-05'] },
    { id: 'CAP-IDA-USR-03-EDIT', module: 'usuarios', name: '03-formulario-edicion.png', route: '/usuarios-sistemas', ready: '#table', action: click('#table tbody .btn-edit', '#userModal.show'), useCases: ['CU-IDA-06'] },
    { id: 'CAP-IDA-USR-04-PASSWORD', module: 'usuarios', name: '04-cambio-contrasena.png', route: '/usuarios-sistemas', ready: '#table', action: click('#table tbody .btn-edit-password', '#userModal.show'), useCases: ['CU-IDA-07'] },

    { id: 'CAP-REP-MOV-MAT-01-LIST', module: 'movimientos-material', name: '01-historial-y-filtros.png', route: '/movimientos/materiales', ready: '#materialMovementTable', useCases: ['CU-REP-02'] },
    { id: 'CAP-REP-MOV-MAT-02-EXPORT', module: 'movimientos-material', name: '02-exportar-reporte.png', route: '/movimientos/materiales', ready: '#materialMovementTable', action: reportDialog, useCases: ['CU-REP-05'] },
    { id: 'CAP-REP-MOV-WAS-01-LIST', module: 'movimientos-merma', name: '01-historial-y-filtros.png', route: '/movimientos/mermas', ready: '#wasteMovementTable', useCases: ['CU-REP-07'] },
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

const runAction = async (page, action, captureId) => {
    const trigger = page.locator(action.selector).first();
    await trigger.waitFor({ state: 'visible' });
    await trigger.click();
    await page.locator(action.ready).first().waitFor({ state: 'visible' });
    console.log(`  Acción preparada para ${ captureId }: ${ action.selector }`);
};

const capturePage = async (page, capture) => {
    const directory = path.join(outputRoot, capture.module);
    await mkdir(directory, { recursive: true });
    await page.goto(new URL(capture.route, baseURL).href, { waitUntil: 'domcontentloaded' });
    await page.locator(capture.ready).first().waitFor({ state: 'visible' });

    for (const action of capture.actions ?? (capture.action ? [capture.action] : [])) {
        await runAction(page, action, capture.id);
    }

    await page.screenshot({ path: path.join(directory, capture.name), fullPage: true });
    console.log(`${ capture.id } -> ${ path.join(capture.module, capture.name) } [${ formatCoverage(capture.useCases) }]`);
};

validateInventory();

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

const protectedCaptures = captures.filter(item => !item.public);
if (protectedCaptures.length && !storageState) {
    throw new Error('DOCS_STORAGE_STATE es obligatorio para generar las capturas de páginas protegidas.');
}

// La salida representa una ejecución completa. Se elimina sólo después de validar la
// configuración para no mezclar capturas anteriores con el inventario actual.
await rm(outputRoot, { recursive: true, force: true });

const { chromium } = await import('playwright');
const browser = await chromium.launch();
try {
    const contextOptions = { viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' };
    const publicContext = await browser.newContext(contextOptions);
    const publicPage = await publicContext.newPage();

    for (const capture of captures.filter(item => item.public)) await capturePage(publicPage, capture);
    await publicContext.close();

    const authenticatedContext = await browser.newContext({ ...contextOptions, storageState });
    const authenticatedPage = await authenticatedContext.newPage();
    for (const capture of protectedCaptures) await capturePage(authenticatedPage, capture);
    await authenticatedContext.close();
} finally {
    await browser.close();
}

console.log(`Capturas generadas en ${ path.relative(process.cwd(), outputRoot) }.`);
