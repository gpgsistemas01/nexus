# SistemaMerma

## Base de datos para pruebas automatizadas

La aplicación resuelve la cadena de conexión con `src/lib/databaseUrl.js`:

- Cuando `NODE_ENV` es `test`, se usa `DATABASE_TEST_URL`.
- En cualquier otro entorno se usa `DATABASE_URL`.
- Si no existe la variable requerida para el entorno actual, el resolver falla indicando el `NODE_ENV` activo.

Ejemplo de variables locales:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/sistema_merma"
DATABASE_TEST_URL="postgresql://usuario:password@localhost:5432/sistema_merma_test"
```

## Conexión Prisma en pruebas

Se mantiene un solo punto de creación de cliente Prisma en `src/lib/prisma.js`. En pruebas, Vitest ejecuta con `NODE_ENV=test`, por lo que el mismo resolver usa `DATABASE_TEST_URL` sin crear un segundo cliente.

Las pruebas que escriban datos en la base deben ejecutarse dentro de una transacción y forzar rollback al terminar. Para esos casos se agregó `tests/helpers/rollbackTransaction.js`, que recibe el cliente Prisma y ejecuta el cuerpo de la prueba con el `tx` transaccional, revirtiendo los cambios al finalizar para no persistir datos de prueba.

Flujo recomendado para automatización independiente:

```bash
npm run test:db:migrate
npm run test:db
```

Los scripts de prueba validan primero que exista `DATABASE_TEST_URL` y que no sea la misma URL que `DATABASE_URL`. Para migraciones de prueba, los scripts asignan temporalmente `DATABASE_URL="$DATABASE_TEST_URL"` solo durante el comando de Prisma, porque Prisma CLI lee la variable `DATABASE_URL` para aplicar migraciones.
