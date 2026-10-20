import { fork } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { performance, monitorEventLoopDelay } from 'node:perf_hooks';
import cookieParser from 'cookie-parser';

import { validateTestDatabaseEnv } from '../../scripts/verifyTestDatabaseEnv.js';
import { createControllerTestApp } from '../helpers/controllerTestHarness.js';
import { createBackendFixture } from './backendFixture.js';

validateTestDatabaseEnv();
if (process.env.NODE_ENV !== 'test' || !new URL(process.env.DATABASE_TEST_URL).pathname.endsWith('_performance_test')) {
  throw new Error('Use the disposable nexus_performance_test database.');
}
const readInteger = (name, fallback, minimum, maximum) => {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < minimum || value > maximum) throw new Error(`${name} fuera de rango.`);
  return value;
};
const count = readInteger('BENCHMARK_RECORDS', 10000, 200, 20000);
const rounds = readInteger('BENCHMARK_SAMPLES', 12, 5, 50);
const concurrency = readInteger('BENCHMARK_CONCURRENCY', 4, 2, 8);
process.env.JWT_SECRET_ACCESS = randomUUID();
const { prisma } = await import('../../src/lib/prisma.js');
const { registerApiRoutes } = await import('../../src/routes/api/index.js');
const { generateAccessToken } = await import('../../src/services/jwtService.js');
const { pinoLogger } = await import('../../src/utils/logger.js');
const fixture = await createBackendFixture({ prisma, count });
const app = createControllerTestApp({ registerRoutes: app => {
  app.use(cookieParser(), pinoLogger);
  registerApiRoutes(app);
} });
const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');
const cookie = `accessToken=${generateAccessToken({ id: fixture.user.id })}`;
const percentile = (rows, fraction) => rows.length
  ? Math.round(rows.map(row => row.ms).sort((a, b) => a - b)[Math.ceil(rows.length * fraction) - 1]) : null;

const runScenario = ({ name, mixed, fixedReads = false }) => new Promise((resolve, reject) => {
  const client = fork(new URL('./backendLoadClient.js', import.meta.url), { stdio: ['ignore', 'inherit', 'inherit', 'ipc'] });
  const delay = monitorEventLoopDelay({ resolution: 10 });
  let sampling;
  let started;
  let cpu;
  let utilization;
  let completed = false;
  let peakRss = 0;
  let peakHeapUsed = 0;
  const sample = () => {
    const memory = process.memoryUsage();
    peakRss = Math.max(peakRss, memory.rss);
    peakHeapUsed = Math.max(peakHeapUsed, memory.heapUsed);
  };
  const cleanup = () => {
    clearInterval(sampling);
    clearTimeout(deadline);
    delay.disable();
  };
  const deadline = setTimeout(() => {
    client.kill();
    cleanup();
    reject(new Error('La carga mixta excedió dos minutos.'));
  }, 120000);
  client.on('error', error => { cleanup(); reject(error); });
  client.on('exit', code => {
    cleanup();
    if (!completed) reject(new Error(`El cliente terminó sin resultado: ${code}.`));
  });
  client.on('message', message => {
    if (message.type === 'ready') {
      sample();
      cpu = process.cpuUsage();
      utilization = performance.eventLoopUtilization();
      started = performance.now();
      delay.enable();
      sampling = setInterval(sample, 20);
      client.send({ type: 'measure' });
    } else if (message.type === 'result') {
      completed = true;
      sample();
      const usage = process.cpuUsage(cpu);
      cleanup();
      resolve({
        label: process.env.BENCHMARK_LABEL || 'local', scenario: name,
        records: count, rounds, concurrency, readSamples: message.reads.length, reportSamples: message.reports.length,
        readP50Ms: percentile(message.reads, 0.5), readP95Ms: percentile(message.reads, 0.95),
        reportP50Ms: percentile(message.reports, 0.5), reportP95Ms: percentile(message.reports, 0.95),
        reportBytes: message.reports[0]?.bytes ?? 0,
        elapsedMs: Math.round(performance.now() - started), cpuMs: Math.round((usage.user + usage.system) / 1000),
        eventLoopP95Ms: Math.round(delay.percentile(95) / 1e6),
        eventLoopUtilization: Number(performance.eventLoopUtilization(utilization).utilization.toFixed(3)),
        sampledPeakRssMb: Math.round(peakRss / 1024 / 1024), sampledPeakHeapUsedMb: Math.round(peakHeapUsed / 1024 / 1024)
      });
    } else if (message.type === 'failure') {
      cleanup();
      reject(new Error(message.message));
    }
  });
  client.send({ port: server.address().port, cookie, rounds, concurrency, mixed, fixedReads });
});

try {
  for (const scenario of [
    { name: 'reads-only', mixed: false },
    { name: 'mixed-excel', mixed: true },
    { name: 'fixed-mixed-excel', mixed: true, fixedReads: true }
  ]) {
    if (process.env.BENCHMARK_SCENARIO && !scenario.name.includes(process.env.BENCHMARK_SCENARIO)) continue;
    process.stdout.write(`${JSON.stringify(await runScenario(scenario))}\n`);
  }
} finally {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  try { await fixture.cleanup(); } finally { await prisma.$disconnect(); }
}
