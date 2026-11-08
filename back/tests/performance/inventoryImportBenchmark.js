import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { fork } from 'node:child_process';
import { monitorEventLoopDelay, performance } from 'node:perf_hooks';
import cookieParser from 'cookie-parser';
import { validateTestDatabaseEnv } from '../../scripts/verifyTestDatabaseEnv.js';
import { createControllerTestApp } from '../helpers/controllerTestHarness.js';
import { createInventoryImportFixture, inventoryWorkbook } from '../helpers/inventoryImportFixture.js';

validateTestDatabaseEnv();
if (process.env.NODE_ENV !== 'test' || !new URL(process.env.DATABASE_TEST_URL).pathname.endsWith('_performance_test')) {
    throw new Error('Usa una base desechable terminada en _performance_test.');
}
process.env.JWT_SECRET_ACCESS = randomUUID();
const { prisma } = await import('../../src/lib/prisma.js');
const { registerApiRoutes } = await import('../../src/routes/api/index.js');
const { generateAccessToken } = await import('../../src/services/jwtService.js');
const fixture = await createInventoryImportFixture(prisma);
let server;
const children = new Set();
const percentile = (values, fraction) => Math.round([...values].sort((a,b) => a-b)[Math.max(0, Math.ceil(values.length * fraction) - 1)] ?? 0);
const startClient = config => {
    const child = fork(new URL('./inventoryImportLoadClient.js', import.meta.url), { stdio: ['ignore', 'inherit', 'inherit', 'ipc'] });
    children.add(child);
    let ready;
    const prepared = new Promise(resolve => { ready = resolve; });
    const result = new Promise((resolve, reject) => {
        let completed = false;
        const deadline = setTimeout(() => { child.kill(); reject(new Error('La medición excedió 60 segundos.')); }, 60000);
        child.on('message', message => {
            if (message.type === 'ready') ready();
            if (message.type === 'failure') { completed = true; clearTimeout(deadline); reject(new Error(message.message)); }
            if (message.type === 'result') { completed = true; clearTimeout(deadline); resolve(message); }
        });
        child.once('error', reject);
        child.once('exit', code => { children.delete(child); clearTimeout(deadline); if (!completed) reject(new Error(`Cliente interrumpido: ${code}`)); });
    });
    child.send({ ...config, port: server.address().port, cookie: `accessToken=${generateAccessToken({ id: fixture.user.id })}` });
    return { prepared, result, measure: () => child.send({ type: 'measure' }) };
};
try {
    const seed = [];
    for (const type of ['MATERIAL', 'CONSUMABLE']) for (let index = 0; index < 100; index++) seed.push({
        id: randomUUID(), name: `Existente ${type} ${index} ${fixture.suffix}`, type,
        presentationId: fixture.presentation.id, unitMeasureId: fixture.unit.id,
        ...(type === 'MATERIAL' && { base: 2, height: 3 })
    });
    await prisma.material.createMany({ data: seed });
    await prisma.supplierMaterial.createMany({ data: seed.map(item => ({ materialId: item.id, supplierId: fixture.suppliers[0].id, maxUnitCost: 10, currentStock: 10, convertedQuantity: item.type === 'MATERIAL' ? 60 : 10 })) });
    const wastes = Array.from({ length: 100 }, (_, index) => ({ id: randomUUID(), name: `Existente merma ${index} ${fixture.suffix}`,
        supplierId: fixture.suppliers[0].id, presentationId: fixture.presentation.id, unitMeasureId: fixture.unit.id,
        sourceMaterialId: seed[0].id, base: 1, height: 2, minStock: 0, maxUnitCost: 10, currentStock: 10, convertedQuantity: 20 }));
    await prisma.waste.createMany({ data: wastes });
    const jobs = [];
    for (const resource of ['materials', 'consumables', 'wastes']) {
        const creates = Array.from({ length: 100 }, (_, index) => resource === 'wastes'
            ? { name: `Nueva merma ${index} ${fixture.suffix}`, supplierCode: fixture.suppliers[0].code, materialId: seed[0].id,
                base: 1, height: 2, minStock: 1, maxUnitCost: 10, isActive: 'SI', initialQuantity: 2 }
            : fixture.row(`Nuevo ${resource} ${index}`, resource === 'consumables' ? { base: null, height: null } : {}));
        jobs.push({ resource, mode: 'create', bytes: (await inventoryWorkbook({ resource, rows: creates })).toString('base64') });
        const updates = resource === 'wastes' ? wastes.map(item => ({ id: item.id, expectedVersion: 0, name: item.name, minStock: 1, maxUnitCost: 20, isActive: 'SI' }))
            : seed.filter(item => item.type === (resource === 'materials' ? 'MATERIAL' : 'CONSUMABLE')).map(item => ({
                id: item.id, supplierId: fixture.suppliers[0].id, expectedVersion: 0, expectedMaterialVersion: 0,
                name: item.name, minStock: 1, maxUnitCost: 20, isActive: 'SI'
            }));
        jobs.push({ resource, mode: 'update', bytes: (await inventoryWorkbook({ resource, mode: 'update', rows: updates })).toString('base64') });
    }
    const app = createControllerTestApp({ registerRoutes: app => { app.use(cookieParser()); registerApiRoutes(app); } });
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const run = async mixed => {
        const reads = startClient({ kind: 'reads', durationMs: 5000 });
        const imports = mixed ? startClient({ kind: 'imports', jobs }) : null;
        await Promise.all([reads.prepared, imports?.prepared]);
        const delay = monitorEventLoopDelay({ resolution: 10 });
        delay.enable();
        let peakRss = process.memoryUsage().rss;
        const sample = setInterval(() => { peakRss = Math.max(peakRss, process.memoryUsage().rss); }, 20);
        const utilization = performance.eventLoopUtilization();
        reads.measure(); imports?.measure();
        let readResult, importResult;
        try { [readResult, importResult] = await Promise.all([reads.result, imports?.result]); }
        finally { clearInterval(sample); delay.disable(); }
        const operations = importResult?.imports ?? [];
        const samples = operations.length ? readResult.reads.filter(row => row.at >= operations[0].start && row.at <= operations.at(-1).end) : readResult.reads;
        return { scenario: mixed ? 'consultas_durante_importaciones' : 'consultas_sin_importaciones',
            readSamples: samples.length, readP50Ms: percentile(samples.map(row => row.ms), 0.5), readP95Ms: percentile(samples.map(row => row.ms), 0.95),
            eventLoopP95Ms: Math.round(delay.percentile(95) / 1e6), eventLoopMaxMs: Math.round(delay.max / 1e6),
            eventLoopUtilization: Number(performance.eventLoopUtilization(utilization).utilization.toFixed(3)),
            peakRssMiB: Math.round(peakRss / 1024 / 1024), operations };
    };
    const results = [await run(false), await run(true)];
    const completed = await prisma.inventoryImport.count({ where: { userId: fixture.user.id, status: 'COMPLETED' } });
    if (completed !== 6) throw new Error('No se confirmaron los seis lotes de 100 filas.');
    process.stdout.write(`${JSON.stringify({ node: process.version, rowsPerBatch: 100, completed, results }, null, 2)}\n`);
} finally {
    for (const child of children) child.kill();
    if (server) await new Promise(resolve => server.close(resolve));
    await fixture.cleanup();
    await prisma.$disconnect();
}
