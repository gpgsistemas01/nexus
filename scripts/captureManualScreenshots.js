import { existsSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { captures, getCaptureScopePath, validateInventory } from './manualScreenshotInventory.js';
import { waitForCaptureReady } from './manualScreenshotPageState.js';
import { captureWithRecovery } from './manualScreenshotRecovery.js';

const baseURL = process.env.DOCS_BASE_URL ?? 'http://127.0.0.1:3000';
const captureAreas = ['almacen', 'sistemas'];
const areaArgumentIndex = process.argv.findIndex(argument => argument === '--area');
const inlineAreaArgument = process.argv.find(argument => argument.startsWith('--area='))?.split('=', 2)[1];
const argumentCaptureArea = areaArgumentIndex === -1 ? inlineAreaArgument : process.argv[areaArgumentIndex + 1];
const environmentCaptureArea = process.env.DOCS_CAPTURE_AREA?.trim();
if (argumentCaptureArea && environmentCaptureArea && argumentCaptureArea !== environmentCaptureArea) {
    throw new Error('El área indicada con --area no coincide con DOCS_CAPTURE_AREA.');
}
const selectedCaptureArea = argumentCaptureArea ?? environmentCaptureArea;
const captureAreaPrefix = selectedCaptureArea?.toUpperCase();
const authenticatedAreas = Object.freeze({
    almacen: {
        label: 'Almacén',
        environmentPrefix: 'ALMACEN',
        loginName: process.env.DOCS_ALMACEN_LOGIN_NAME,
        loginPassword: process.env.DOCS_ALMACEN_LOGIN_PASSWORD,
        storageState: process.env.DOCS_ALMACEN_STORAGE_STATE
    },
    sistemas: {
        label: 'Sistemas',
        environmentPrefix: 'SISTEMAS',
        loginName: process.env.DOCS_SISTEMAS_LOGIN_NAME,
        loginPassword: process.env.DOCS_SISTEMAS_LOGIN_PASSWORD,
        storageState: process.env.DOCS_SISTEMAS_STORAGE_STATE
    }
});
const requestedCaptureIds = (process.env[`DOCS_${ captureAreaPrefix }_CAPTURE_IDS`] ?? '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);
const requestedCaptureFrom = process.env[`DOCS_${ captureAreaPrefix }_CAPTURE_FROM`]?.trim();
const selectionAreas = captureAreas.filter(area => (
    process.env[`DOCS_${ area.toUpperCase() }_CAPTURE_IDS`]
    || process.env[`DOCS_${ area.toUpperCase() }_CAPTURE_FROM`]
));
if (selectionAreas.some(area => area !== selectedCaptureArea)) {
    throw new Error(`Las variables de selección deben corresponder al área ${ selectedCaptureArea }.`);
}
const listCaptures = process.argv.includes('--list');
const recoverMissingCaptures = process.argv.includes('--missing');
const forceFreshCapture = process.argv.includes('--fresh');
const outputRoot = path.resolve('build/docs/screenshots');
const screenshotDelay = 1500;
const retryDelay = 1000;
const captureTimeout = Number(process.env[`DOCS_${ captureAreaPrefix }_CAPTURE_TIMEOUT_MS`] ?? '30000');
const captureRetries = Number(process.env[`DOCS_${ captureAreaPrefix }_CAPTURE_RETRIES`] ?? '2');

if (!Number.isInteger(captureTimeout) || captureTimeout <= 0) {
    throw new Error(`DOCS_${ captureAreaPrefix }_CAPTURE_TIMEOUT_MS debe ser un entero mayor a cero.`);
}
if (!Number.isInteger(captureRetries) || captureRetries < 0) {
    throw new Error(`DOCS_${ captureAreaPrefix }_CAPTURE_RETRIES debe ser un entero mayor o igual a cero.`);
}

const formatCoverage = (useCases) => useCases.length ? useCases.join(', ') : 'Transversal';
const authenticationArea = area => area;
let lastCompletedCaptureId;

const selectCaptures = () => {
    const selectionMechanisms = [requestedCaptureIds.length > 0, Boolean(requestedCaptureFrom), recoverMissingCaptures, forceFreshCapture]
        .filter(Boolean).length;
    if (selectionMechanisms > 1) {
        throw new Error(`Use DOCS_${ captureAreaPrefix }_CAPTURE_IDS, DOCS_${ captureAreaPrefix }_CAPTURE_FROM, --missing o --fresh; no combine mecanismos.`);
    }

    if (selectedCaptureArea && !captureAreas.includes(selectedCaptureArea)) {
        throw new Error('DOCS_CAPTURE_AREA debe ser almacen o sistemas.');
    }
    if (!selectedCaptureArea && !listCaptures) {
        throw new Error('Indique el área con --area almacen|sistemas o DOCS_CAPTURE_AREA.');
    }
    const areaCaptures = selectedCaptureArea
        ? captures.filter(capture => capture.area === selectedCaptureArea)
        : captures;

    if (recoverMissingCaptures) return areaCaptures.filter(capture => !existsSync(capturePath(capture)));

    if (requestedCaptureFrom) {
        const startIndex = captures.findIndex(capture => capture.id === requestedCaptureFrom);
        if (startIndex === -1) {
            throw new Error(`DOCS_${ captureAreaPrefix }_CAPTURE_FROM contiene un identificador desconocido: ${ requestedCaptureFrom }`);
        }
        return captures.slice(startIndex).filter(capture => (
            !selectedCaptureArea || capture.area === selectedCaptureArea
        ));
    }

    if (!requestedCaptureIds.length) return areaCaptures;

    const capturesById = new Map(captures.map(capture => [capture.id, capture]));
    const unknownIds = requestedCaptureIds.filter(id => !capturesById.has(id));
    if (unknownIds.length) {
        throw new Error(`DOCS_${ captureAreaPrefix }_CAPTURE_IDS contiene identificadores desconocidos: ${ unknownIds.join(', ') }`);
    }

    const selection = [...new Set(requestedCaptureIds)].map(id => capturesById.get(id));
    if (selectedCaptureArea && selection.some(capture => capture.area !== selectedCaptureArea)) {
        throw new Error(`DOCS_${ captureAreaPrefix }_CAPTURE_IDS contiene capturas fuera del área ${ selectedCaptureArea }.`);
    }
    return selection;
};

const capturePath = capture => path.join(outputRoot, getCaptureScopePath(capture), capture.module, capture.name);
const firstMissingCapture = captureList => captureList.find(capture => !existsSync(capturePath(capture)));

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
    if (action.selectNew) {
        await page.locator(action.selector).evaluate(select => globalThis.$(select).select2('open'));
        await page.locator('.select2-container--open .select2-search__field').fill(action.value);
        await page.locator(`.select2-results__option:has-text("${ action.optionLabel }")`).first().click();
        await page.locator(action.ready).first().waitFor({ state: 'visible' });
        console.log(`  Paso ${ step } de ${ captureId }: opción ${ action.optionLabel }`);
        return;
    }
    if (action.fill) {
        await page.locator(action.selector).fill(action.value);
        console.log(`  Paso ${ step } de ${ captureId }: captura de ${ action.selector }`);
        return;
    }
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
    if (capture.viewport) await page.setViewportSize(capture.viewport);
    const directory = path.join(outputRoot, getCaptureScopePath(capture), capture.module);
    await mkdir(directory, { recursive: true });
    await page.goto(new URL(capture.route, baseURL).href, { waitUntil: 'domcontentloaded' });
    await waitForCaptureReady(page, capture, baseURL);
    if (capture.ready === '#table') {
        try {
            await waitForDataTableReady(page);
        } catch (error) {
            throw new Error(
                `${ capture.id } no pudo cargarse: DataTables no terminó su consulta dentro del límite de Playwright. `
                + `El límite no es una pausa obligatoria. Para reanudar desde esta captura, defina `
                + `DOCS_${ capture.area.toUpperCase() }_CAPTURE_FROM=${ capture.id } y ejecute nuevamente npm run docs:screenshots -- --area ${ capture.area }.`,
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
    console.log(`${ capture.id } -> ${ path.join(getCaptureScopePath(capture), capture.module, capture.name) } [${ formatCoverage(capture.useCases) }]`);
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
            + `Ejecute nuevamente npm run docs:screenshots -- --area ${ capture.area } para reanudar automáticamente.`
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

if (listCaptures) {
    console.log('| Orden | Ámbito | ID | Ruta | Casos de uso |');
    console.log('|---:|---|---|---|---|');
    selectedCaptures.forEach((capture, index) => {
        const coverage = capture.useCases.length
            ? capture.useCases.map(id => `\`${ id }\``).join(', ')
            : 'Transversal';
        console.log(`| ${ index + 1 } | ${ capture.area } | \`${ capture.id }\` | \`build/docs/screenshots/${ getCaptureScopePath(capture) }/${ capture.module }/${ capture.name }\` | ${ coverage } |`);
    });
    process.exit(0);
}

if (!requestedCaptureIds.length && !requestedCaptureFrom && !recoverMissingCaptures && !forceFreshCapture) {
    const pendingCapture = firstMissingCapture(selectedCaptures);
    if (pendingCapture && captures.some(capture => existsSync(capturePath(capture)))) {
        selectedCaptures = selectedCaptures.slice(selectedCaptures.indexOf(pendingCapture));
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

const protectedCaptures = selectedCaptures.filter(item => !item.unauthenticated);
const selectedAreas = [...new Set(protectedCaptures.map(capture => authenticationArea(capture.area)))];
for (const area of selectedAreas) {
    const { label, environmentPrefix, loginName, loginPassword, storageState } = authenticatedAreas[area];
    if (Boolean(loginName) !== Boolean(loginPassword)) {
        throw new Error(`DOCS_${ environmentPrefix }_LOGIN_NAME y DOCS_${ environmentPrefix }_LOGIN_PASSWORD deben definirse juntos.`);
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
        capturePath(capture),
        { force: true }
    )));
} else {
    // Una ejecución completa sustituye todo el inventario. Una ejecución selectiva
    // conserva las capturas no solicitadas para poder reintentar únicamente las fallidas.
    await rm(path.join(outputRoot, 'areas', selectedCaptureArea), { recursive: true, force: true });
}

const { chromium } = await import('playwright');
const browser = await chromium.launch();
try {
    const contextOptions = { viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' };
    const unauthenticatedContext = await browser.newContext(contextOptions);
    unauthenticatedContext.setDefaultTimeout(captureTimeout);

    for (const capture of selectedCaptures.filter(item => item.unauthenticated)) await capturePageWithRecovery(unauthenticatedContext, capture);
    await unauthenticatedContext.close();

    for (const area of selectedAreas) {
        const { storageState } = authenticatedAreas[area];
        const areaCaptures = protectedCaptures.filter(capture => authenticationArea(capture.area) === area);
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
