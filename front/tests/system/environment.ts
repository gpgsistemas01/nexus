export const requireSystemTestDatabase = (environment: NodeJS.ProcessEnv = process.env) => {
  const raw = environment.DATABASE_TEST_URL;
  if (!raw)
    throw new Error(
      'Define DATABASE_TEST_URL con una base PostgreSQL aislada antes de ejecutar pruebas de sistema.',
    );
  const target = new URL(raw);
  const host = (name: string) =>
    ['localhost', '127.0.0.1', '[::1]'].includes(name) ? 'loopback' : name;
  const sameDatabase = (url: string) => {
    const other = new URL(url);
    return (
      host(other.hostname) === host(target.hostname) &&
      (other.port || '5432') === (target.port || '5432') &&
      other.pathname === target.pathname
    );
  };
  if (
    !['postgres:', 'postgresql:'].includes(target.protocol) ||
    !/(?:^|[_-])test(?:[_-]|$)/i.test(target.pathname.slice(1)) ||
    (environment.DATABASE_URL && sameDatabase(environment.DATABASE_URL)) ||
    (environment.DIRECT_TEST_URL && !sameDatabase(environment.DIRECT_TEST_URL))
  )
    throw new Error(
      'Las pruebas requieren una base con nombre test, distinta de DATABASE_URL; DIRECT_TEST_URL debe apuntar a la misma base de prueba.',
    );
  return raw;
};
