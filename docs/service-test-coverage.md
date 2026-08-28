# Estrategia y cobertura de pruebas de servicios

Este documento resume qué servicios ya tienen pruebas y qué falta cubrir a nivel de integración. La intención es evitar listar como “faltante” un servicio que ya está cubierto por su propia suite o por una integración directa con la base de pruebas.

## Servicios con pruebas actuales

La cobertura vigente se divide así:

- Las reglas unitarias de servicios están bajo `tests/unit/services`. Incluyen identidad
  y consulta de movimientos, relaciones proveedor-material, reportes y helpers del
  dominio de mermas.
- Los controllers de salidas de material, salidas de merma, materiales, mermas y
  reportes tienen pruebas unitarias bajo `tests/unit/controllers/api/warehouse`.
- Las integraciones HTTP con Prisma están bajo `tests/integration/controllers` y
  cubren catálogos auxiliares, clientes, proveedores y el CRUD de salidas de merma.
- Los componentes compartidos del CRUD cliente se prueban bajo
  `tests/unit/public/js`; cada contexto conserva únicamente las pruebas de la
  configuración o regla que le pertenece.
- Las políticas se prueban como decisiones funcionales bajo
  `tests/unit/constants`: una combinación de rol y departamento debe conceder sólo
  las operaciones vigentes. En particular, la suite verifica el acceso positivo de
  almacén y el rechazo total del área de ventas, en vez de fijar la forma interna del
  objeto de configuración.

## Estrategia de integración con BD

Las pruebas de integración se ejecutan contra `DATABASE_TEST_URL`, guardan información real y no usan rollback. La limpieza se hace por datos de prueba al iniciar cada integración y con `tests/teardownTestDatabase.js` al finalizar toda la suite. Las integraciones que construyen un agregado completo también limpian en `afterAll`, para que una ejecución aislada no deje fixtures; el teardown global sigue siendo la red de seguridad si el proceso se interrumpe. Los servicios marcados arriba como integración directa ya incluyen ese flujo de BD; esta sección sólo documenta la estrategia para evitar repetir el listado de cobertura.

### Ubicación y patrón para pruebas nuevas

- Las unitarias deben replicar la ruta del módulo bajo `tests/unit/` (por ejemplo,
  `src/services/warehouse/materials/materialService.js` se prueba en
  `tests/unit/services/warehouse/materials/materialServiceTest.js`).
- Las integraciones CRUD HTTP deben ubicarse en
  `tests/integration/controllers/<dominio>ControllerDbTest.js` y usar el sufijo
  `DbTest.js`.
- Cada integración CRUD debe verificar, según las operaciones públicas del servicio:
  creación persistida, consulta por id/listado, actualización, desactivación o borrado
  cuando exista, relaciones obligatorias y al menos una regla de rechazo relevante.
- Los datos deben llevar un prefijo o identificador exclusivo de la suite. La limpieza
  debe apuntar solo a esos datos y respetar el orden de claves foráneas; no se permite
  vaciar catálogos compartidos.
- `tests/helpers/rollbackTransaction.js` se reutiliza cuando el código bajo prueba
  acepta el cliente `tx`. No debe usarse si obliga a mockear o saltar la transacción
  real que constituye el objeto de la integración.

Para confirmar si una corrida realmente modifica la base de pruebas, hay que revisar estas condiciones antes de interpretar el resultado:

1. Ejecutar `npm run test:db`, no sólo `npm test`. El script de BD valida `DATABASE_TEST_URL`, aplica migraciones con `NODE_ENV=test` y luego corre Vitest; `npm test` puede servir para unitarias, pero las integraciones con BD se saltan si no existe `DATABASE_TEST_URL` o si no está generado `generated/prisma/client.ts`.
2. Definir `DATABASE_TEST_URL` con una base distinta a `DATABASE_URL`. `tests/setupTestDatabaseEnv.js` invoca la validación cuando existe alguna URL de base, y `scripts/verifyTestDatabaseEnv.js` falla si falta la URL de pruebas o si ambas URLs normalizadas apuntan al mismo destino.
3. Verificar que los archivos `tests/integration/controllers/*DbTest.js` no aparezcan
   como `skipped`. Cuando corren, ejercitan HTTP, escrituras y lecturas reales mediante
   `src/lib/prisma.js`.
4. Recordar que el cambio puede no quedar visible al final: cada integración limpia sus datos de prueba al iniciar y el teardown global vuelve a borrar registros con prefijos de integración. Que no queden registros persistidos después de la suite no significa que no se hayan escrito durante la prueba.

## Pendientes importantes

Las integraciones de salidas de material, entradas de compra, materiales, personas y
usuarios todavía deben incorporarse o recuperarse siguiendo las prioridades de
`docs/test-plan.md`. Al modificar uno de esos CRUD se debe ampliar la suite de su
dominio, sin crear un flujo paralelo que duplique el camino feliz.

El módulo de requisiciones de compra fue retirado del frontend, backend y esquema
vigente; por ello no debe agregarse cobertura nueva ni reutilizarse ese flujo en otros
dominios. La migración `20260827000000_remove_purchase_requisitions` elimina sus tablas
y el contador `REQ` únicamente después de las migraciones que todavía procesan sus
datos históricos. La restauración idempotente `20260805231500` permite continuar en
bases donde otra rama las eliminó anticipadamente; después se ejecutan
`20260805232000_merge_duplicate_materials` y
`20260820000000_preserve_decimal_precision`.

## Dependencias entre dominios

Cuando un servicio usa otro dominio, no se duplica la misma prueba unitaria. El efecto
se demuestra en la integración HTTP propietaria. Por ejemplo,
`wasteIssueControllerDbTest.js` comprueba conjuntamente documento, detalles, stock,
movimientos, devoluciones y rollback de una salida de merma. Los flujos todavía no
cubiertos deben aplicar el mismo criterio al incorporarse.

## Implicación para CI

Las pruebas que dependan de Prisma o migraciones deben ejecutarse en CI con `npm run test:db`, porque ese script valida `DATABASE_TEST_URL`, aplica migraciones y después corre Vitest contra la base de pruebas. Además, Vitest carga `tests/setupTestDatabaseEnv.js`: si una corrida define `DATABASE_URL` o `DATABASE_TEST_URL`, la suite valida que exista `DATABASE_TEST_URL`, confirma que no sea igual a `DATABASE_URL`; en runtime el resolver usa `DATABASE_TEST_URL` porque `NODE_ENV=test`.
