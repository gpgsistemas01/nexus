# SistemaMerma

## Base de datos para pruebas automatizadas

La aplicación resuelve la cadena de conexión con `src/lib/databaseUrl.js`:

- En ejecución normal se usa `DATABASE_URL` como primera opción.
- Cuando `NODE_ENV=test`, se usa `DATABASE_TEST_URL` como primera opción para apuntar a una base de datos aislada de pruebas.
- En pruebas no se usa `DATABASE_URL`, `DATABASE_URL_DIRECT` ni `DIRECT_URL` como fallback: si `DATABASE_TEST_URL` no existe, la conexión falla para evitar tocar otra base de datos.
- Fuera de pruebas, `DATABASE_URL_DIRECT` y `DIRECT_URL` se mantienen como compatibilidad si todavía existen en algún entorno.

### Criterio de selección

`NODE_ENV=test` se mantiene como señal necesaria para que el resolver sepa que debe usar la base de pruebas. `DATABASE_TEST_URL` solo contiene la cadena de conexión; por sí sola no indica que el proceso deba ejecutarse en modo pruebas. Esta separación permite que los scripts de migración y Vitest usen la misma regla solo durante la ejecución de pruebas, evita cambiar código para alternar bases y falla si la URL de pruebas no está configurada.

Ejemplo de variables locales:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/sistema_merma"
DATABASE_TEST_URL="postgresql://usuario:password@localhost:5432/sistema_merma_test"
```

## Conexión Prisma en pruebas

Se mantiene un solo punto de creación de cliente Prisma en `src/lib/prisma.js`. No se crea un segundo cliente para pruebas: la URL resuelta decide si el mismo punto de conexión usa `DATABASE_URL` o `DATABASE_TEST_URL`. Así Prisma CLI y runtime comparten la misma regla y se evita duplicar configuración.

Las pruebas que escriban datos en la base deben ejecutarse dentro de una transacción y forzar rollback al terminar. Para esos casos se agregó `tests/helpers/rollbackTransaction.js`, que recibe el cliente Prisma y ejecuta el cuerpo de la prueba con el `tx` transaccional, revirtiendo los cambios al finalizar para no persistir datos de prueba.

Flujo recomendado para automatización independiente:

```bash
npm run test:db:migrate
npm run test:db
```

Los scripts de prueba son los únicos que declaran `NODE_ENV=test`: `test` y `test:watch` lo usan para Vitest, `test:db:migrate` lo usa para que Prisma tome `DATABASE_TEST_URL`, y `test:db` aplica migraciones sobre la base de pruebas antes de ejecutar Vitest. Antes de tocar la base, `test:db:verify` valida que exista `DATABASE_TEST_URL` y que no sea la misma URL que `DATABASE_URL`, para que la automatización pueda ejecutarse de forma independiente a producción.
