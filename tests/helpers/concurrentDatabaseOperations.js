import assert from 'node:assert/strict';

// Retiene la fila mientras ambas peticiones alcanzan la base, sin pausas en código de producción.
export const runContendedOperations = async ({ prisma, lock, table, actions }) => {
  const tablePatterns = (Array.isArray(table) ? table : [table]).map(name => `%"${name}"%`);
  const ready = Promise.withResolvers();
  const release = Promise.withResolvers();
  const holder = prisma.$transaction(async tx => {
    try {
      await lock(tx);
      ready.resolve();
      await release.promise;
    } catch (error) {
      ready.reject(error);
      throw error;
    }
  }, { timeout: 10000 });
  await ready.promise;
  const requests = Promise.allSettled(actions.map(action => Promise.resolve().then(action)));
  try {
    const deadline = Date.now() + 3000;
    let waiting = 0;
    while (Date.now() < deadline && waiting < actions.length) {
      const [result] = await prisma.$queryRaw`
        SELECT COUNT(*)::int AS waiting FROM pg_stat_activity
        WHERE datname = current_database() AND wait_event_type = 'Lock'
         AND query LIKE ANY(${tablePatterns}::text[])
      `;
      waiting = result.waiting;
      if (waiting < actions.length) await new Promise(resolve => setTimeout(resolve, 10));
    }
    assert.equal(waiting, actions.length, 'Las operaciones deben coincidir mientras la fila permanece bloqueada');
  } finally {
    release.resolve();
    await holder;
    await requests;
  }
  return (await requests).map(result => {
    if (result.status === 'rejected') throw result.reason;
    return result.value;
  });
};
