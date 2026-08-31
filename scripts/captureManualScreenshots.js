import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const { chromium } = await import('playwright');
const baseURL = process.env.DOCS_BASE_URL ?? 'http://127.0.0.1:3000';
const storageState = process.env.DOCS_STORAGE_STATE;
const outputRoot = path.resolve('docs/manual-usuario/images');
const pages = [
    { module: 'acceso', name: '01-login.png', route: '/login', ready: 'form' },
    { module: 'entradas', name: '01-listado.png', route: '/goods-receipts', ready: 'table' },
    { module: 'salidas', name: '01-listado.png', route: '/goods-issues', ready: 'table' },
    { module: 'mermas', name: '01-listado.png', route: '/wastes', ready: 'table' },
    { module: 'proveedores', name: '01-listado.png', route: '/suppliers', ready: 'table' },
    { module: 'clientes', name: '01-listado.png', route: '/clients', ready: 'table' },
    { module: 'personas', name: '01-listado.png', route: '/persons', ready: 'table' },
    { module: 'usuarios', name: '01-listado.png', route: '/users', ready: 'table' }
];

const browser = await chromium.launch();
const context = await browser.newContext({ storageState, viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
for (const capture of pages) {
    const directory = path.join(outputRoot, capture.module);
    await mkdir(directory, { recursive: true });
    await page.goto(new URL(capture.route, baseURL).href, { waitUntil: 'networkidle' });
    await page.locator(capture.ready).first().waitFor({ state: 'visible' });
    await page.screenshot({ path: path.join(directory, capture.name), fullPage: true });
}
await browser.close();
console.log(`Capturas generadas en ${path.relative(process.cwd(), outputRoot)}.`);
