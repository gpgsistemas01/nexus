import { startQueryProfile, finishQueryProfile, statements } from './queryProfiler.js';
import { randomUUID } from 'node:crypto';
import { createBackendFixture } from './backendFixture.js';
import { validateTestDatabaseEnv } from '../../scripts/verifyTestDatabaseEnv.js';
import { performance, monitorEventLoopDelay } from 'node:perf_hooks';
import { writeFile } from 'node:fs/promises';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import pg from 'pg';

validateTestDatabaseEnv();
if (process.env.NODE_ENV !== 'test' || !new URL(process.env.DATABASE_TEST_URL).pathname.endsWith('_performance_test')) {
  throw new Error('Use the disposable nexus_performance_test database.');
}
process.env.JWT_SECRET_ACCESS = randomUUID();
const { prisma } = await import('../../src/lib/prisma.js');
const { registerApiRoutes } = await import('../../src/routes/api/index.js');
const { generateAccessToken } = await import('../../src/services/jwtService.js');
const { createControllerTestApp } = await import('../helpers/controllerTestHarness.js');
const { pinoLogger } = await import('../../src/utils/logger.js');
const { auditWrites } = await import('../../src/middleware/auditMiddleware.js');
const readInteger = (name, fallback, minimum, maximum) => {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} debe ser un entero entre ${minimum} y ${maximum}.`);
  }
  return value;
};
const count = readInteger('BENCHMARK_RECORDS', 2000, 200, 20000);
const samples = readInteger('BENCHMARK_SAMPLES', 20, 5, 200);
const concurrency = readInteger('BENCHMARK_CONCURRENCY', 1, 1, 32);
const label = process.env.BENCHMARK_LABEL || 'baseline';
const fixture = await createBackendFixture({ prisma, count });
const { user, supplier, createIssue } = fixture;
const app = createControllerTestApp({ registerRoutes: app => {
  app.use(cookieParser(), pinoLogger, auditWrites);
  registerApiRoutes(app);
} });
const cookie = `accessToken=${generateAccessToken({ id: user.id })}`;
const scenarios = [
  ['materials', '/api/warehouse/materials'],
  ['consumables', '/api/warehouse/consumables'],
  ['materials-search', '/api/warehouse/materials?search=0001'],
  ['wastes', '/api/warehouse/wastes'],
  ['waste-templates', `/api/warehouse/wastes/material-templates?supplierId=${supplier.id}`],
  ['goods-issues', '/api/warehouse/goods-issues/materials'],
  ['waste-issues', '/api/warehouse/waste-issues'],
  ['goods-receipts', '/api/warehouse/goods-receipts/materials'],
  ['movements', '/api/admin/movements/materials'],
  ['clients', '/api/sales/clients'],
  ['catalogs', '/api/admin/catalogs/presentations'],
  ['persons', '/api/admin/persons'],
  ['users', '/api/admin/users'],
  ['movement-excel', '/api/admin/reports/movements/materials/excel'],
  ['inventory-excel', '/api/warehouse/reports/inventory/excel']
];
const percentile = (values, fraction) => [...values].sort((a, b) => a - b)[Math.ceil(values.length * fraction) - 1];
const eventLoop = monitorEventLoopDelay({ resolution: 10 });
eventLoop.enable();
try {
  for (const [name, path] of [...scenarios, ['supply-goods', null], ['supply-waste', null]]) {
    if (process.env.BENCHMARK_SCENARIO && !name.includes(process.env.BENCHMARK_SCENARIO)) continue;
    const cases = [];
    for (let index = 0; index < samples + 3; index++) {
      const issue = path ? null : await createIssue(name.endsWith('goods') ? 'goods' : 'waste');
      cases.push(issue);
    }
    const metrics = [];
    eventLoop.reset();
    const cpu = process.cpuUsage();
    const startedAll = performance.now();
    const run = async index => {
      const issue = cases[index];
      const started = performance.now();
      let operation = path ? request(app).get(path) : request(app).patch(`/api/warehouse/${name.endsWith('goods') ? 'goods-issues/materials' : 'waste-issues'}/${issue.id}/details`)
        .send({ details: issue.details.map(detail => ({ id: detail.id, isSupplied: true, projectConvertedQuantity: 4 })) });
      const response = await operation.set('Cookie', cookie);
      if (response.status !== 200) throw new Error(JSON.stringify({ scenario: name, status: response.status, code: response.body?.code }));
      if (index >= 3) metrics.push({ ms: performance.now() - started, bytes: response.headers['content-length'] ? Number(response.headers['content-length']) : 0 });
    };
    for (let index = 0; index < 3; index++) await run(index);
    await startQueryProfile();
    for (let index = 3; index < cases.length; index += concurrency) {
      await Promise.all(cases.slice(index, index + concurrency).map((_, offset) => run(index + offset)));
    }
    const queryProfile = await finishQueryProfile();
    const usage = process.cpuUsage(cpu);
    const result = { label, scenario: name, records: count, samples, concurrency,
      p50Ms: Math.round(percentile(metrics.map(row => row.ms), 0.5)), p95Ms: Math.round(percentile(metrics.map(row => row.ms), 0.95)),
      queries: Number((queryProfile.queries / samples).toFixed(2)), bytes: metrics[0].bytes,
      databaseMeanMs: Math.round(queryProfile.databaseMs / samples), poolWaitP95Ms: Math.round(percentile(queryProfile.poolWaits.length ? queryProfile.poolWaits : [0], 0.95)),
      cpuMs: Math.round((usage.user + usage.system) / 1000), elapsedMs: Math.round(performance.now() - startedAll), eventLoopP95Ms: Math.round(eventLoop.percentile(95) / 1e6) };
    if (!path) await fixture.verifySupply(name.endsWith('goods') ? 'goods' : 'waste', samples + 3);
    process.stdout.write(`${JSON.stringify(result)}\n`);
  }
  if (process.env.BENCHMARK_PLAN_FILE) {
    const client = new pg.Client({ connectionString: process.env.DATABASE_TEST_URL });
    await client.connect();
    try {
      await client.query('ANALYZE');
      const plans = [];
      for (const statement of statements.values()) {
        const result = await client.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${statement.text}`, statement.values);
        const plan = result.rows[0]['QUERY PLAN'][0];
        plans.push({ sql: statement.text, plan });
      }
      await writeFile(process.env.BENCHMARK_PLAN_FILE, JSON.stringify(plans, null, 2));
    } finally { await client.end(); }
  }
} finally {
  eventLoop.disable();
  try { await fixture.cleanup(); } finally { await prisma.$disconnect(); }
}
