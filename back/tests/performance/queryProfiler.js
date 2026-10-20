import pg from 'pg';
import { performance } from 'node:perf_hooks';

if (process.env.NODE_ENV !== 'test') throw new Error('El perfilador requiere NODE_ENV=test.');

let activeProfile = null;
const pending = new Set();
export const statements = new Map();

const track = callback => {
  const completion = Promise.withResolvers();
  pending.add(completion.promise);
  return () => {
    callback();
    pending.delete(completion.promise);
    completion.resolve();
  };
};

const drain = async () => {
  do {
    await Promise.all([...pending]);
    await Promise.resolve();
  } while (pending.size);
};

export const startQueryProfile = async () => {
  await drain();
  activeProfile = { queries: 0, databaseMs: 0, poolWaits: [] };
};

export const finishQueryProfile = async () => {
  await drain();
  const profile = activeProfile;
  activeProfile = null;
  return profile;
};

const query = pg.Client.prototype.query;
pg.Client.prototype.query = function (...args) {
  const profile = activeProfile;
  const started = performance.now();
  const text = typeof args[0] === 'string' ? args[0] : args[0]?.text;
  if (profile) {
    profile.queries++;
    if (text?.startsWith('SELECT')) statements.set(text, { text, values: args[0]?.values ?? args[1] ?? [] });
  }
  const finished = track(() => { if (profile) profile.databaseMs += performance.now() - started; });
  if (typeof args.at(-1) === 'function') {
    const callback = args.at(-1);
    args[args.length - 1] = (...values) => { finished(); callback(...values); };
    return query.apply(this, args);
  }
  const result = query.apply(this, args);
  if (result?.then) return result.finally(finished);
  finished();
  return result;
};

const connect = pg.Pool.prototype.connect;
pg.Pool.prototype.connect = function (...args) {
  const profile = activeProfile;
  const started = performance.now();
  const finished = track(() => { if (profile) profile.poolWaits.push(performance.now() - started); });
  if (typeof args[0] === 'function') {
    const callback = args[0];
    args[0] = (...values) => { finished(); callback(...values); };
    return connect.apply(this, args);
  }
  return connect.apply(this, args).finally(finished);
};
