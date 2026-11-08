import { performance } from 'node:perf_hooks';
import { setTimeout } from 'node:timers/promises';

// Relojes y carga del cliente en procesos separados del servidor y del lector de consultas.
process.once('message', async config => {
    const base = `http://127.0.0.1:${config.port}`;
    const headers = { Cookie: config.cookie };
    const request = async (path, options = {}) => {
        const started = performance.now();
        const at = Date.now();
        const response = await fetch(`${base}${path}`, { ...options, headers: { ...headers, ...options.headers }, signal: AbortSignal.timeout(45000) });
        const data = await response.json();
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
        return { data, ms: performance.now() - started, at };
    };
    const jobs = (config.jobs ?? []).map(job => {
        const form = new FormData();
        form.append('file', new Blob([Buffer.from(job.bytes, 'base64')]), 'inventario.xlsx');
        return { ...job, form };
    });
    try {
        for (let index = 0; index < 5; index++) await request('/api/warehouse/materials');
        const measure = new Promise(resolve => process.once('message', resolve));
        process.send({ type: 'ready' });
        await measure;
        const reads = [];
        const imports = [];
        if (config.kind === 'reads') {
            const until = performance.now() + config.durationMs;
            await Promise.all(Array.from({ length: 2 }, async () => {
                do {
                    const { ms, at } = await request('/api/warehouse/materials');
                    reads.push({ ms, at });
                    await setTimeout(10);
                } while (performance.now() < until);
            }));
        } else {
            for (const job of jobs) {
                const prefix = `/api/warehouse/inventory-imports/${job.resource}`;
                const preview = await request(`${prefix}/preview?mode=${job.mode}`, { method: 'POST', body: job.form });
                if (preview.data.batch.preview.summary.errors) throw new Error(JSON.stringify(preview.data.batch.preview));
                const confirm = await request(`/api/warehouse/inventory-imports/${preview.data.batch.id}/confirm`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ expectedVersion: preview.data.batch.version, operationId: crypto.randomUUID() })
                });
                if (confirm.data.batch.status !== 'COMPLETED') throw new Error('Importación sin recibo.');
                imports.push({ resource: job.resource, mode: job.mode, rows: 100,
                    previewMs: Math.round(preview.ms), confirmMs: Math.round(confirm.ms), start: preview.at, end: Date.now() });
            }
        }
        process.send({ type: 'result', reads, imports });
    } catch (error) {
        process.send({ type: 'failure', message: error.message });
    } finally { process.disconnect(); }
});
