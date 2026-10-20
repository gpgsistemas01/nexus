import http from 'node:http';
import { performance } from 'node:perf_hooks';

// El cliente vive en otro proceso: un bloqueo del servidor no retrasa sus relojes.
process.once('message', async ({ port, cookie, rounds, concurrency, mixed, fixedReads }) => {
  const agent = new http.Agent({ keepAlive: true, maxSockets: concurrency });
  const request = path => new Promise((resolve, reject) => {
    const started = performance.now();
    const operation = http.get({ hostname: '127.0.0.1', port, path, agent, headers: { Cookie: cookie } }, response => {
      let bytes = 0;
      response.on('data', chunk => { bytes += chunk.length; });
      response.on('error', reject);
      response.on('end', () => {
        if (response.statusCode !== 200) return reject(new Error(`HTTP ${response.statusCode}: ${path}`));
        resolve({ ms: performance.now() - started, bytes });
      });
    });
    operation.setTimeout(30000, () => operation.destroy(new Error('La petición excedió 30 segundos.')));
    operation.on('error', reject);
  });
  const reads = [];
  const reports = [];
  const runRound = async collect => Promise.all(Array.from({ length: concurrency }, async (_, index) => {
    const report = mixed && index === concurrency - 1;
    const result = await request(report ? '/api/warehouse/reports/inventory/excel' : '/api/warehouse/materials');
    if (collect) (report ? reports : reads).push(result);
  }));
  try {
    for (let index = 0; index < 3; index++) await runRound(false);
    const measurement = new Promise(resolve => process.once('message', resolve));
    process.send({ type: 'ready' });
    await measurement;
    if (mixed) {
      let finished = false;
      const exportReports = async () => {
        try {
          for (let index = 0; index < rounds; index++) reports.push(await request('/api/warehouse/reports/inventory/excel'));
        } finally { finished = true; }
      };
      const readInventory = async () => {
        let completedReads = 0;
        do {
          reads.push(await request('/api/warehouse/materials'));
          completedReads++;
        } while (fixedReads ? completedReads < rounds * 3 : !finished);
      };
      await Promise.all([exportReports(), ...Array.from({ length: concurrency - 1 }, readInventory)]);
    } else {
      for (let index = 0; index < rounds; index++) await runRound(true);
    }
    process.send({ type: 'result', reads, reports });
  } catch (error) {
    process.send({ type: 'failure', message: error.message });
  } finally {
    agent.destroy();
    process.disconnect();
  }
});
