# 3. Cobertura Vue por caso de uso y brechas

## Alcance y lectura

Esta vista resume la evidencia **del cliente** y enlaza requisitos, casos de uso,
diseños y pruebas. Complementa la [cobertura HTTP/Prisma](../../../back/docs/testing/use-case-test-types.md)
sin cambiar sus estados ni repetir la SRS. `RF-*` y `RN-*` se consultan en el
[catálogo normativo](../../../back/docs/requirements/requirements-specification/04-unified-catalog-by-scope/index.md).

**Evidencia de cliente** significa que existe el archivo con sus aserciones;
**parcial** indica una condición, recurso o resultado sin evidencia suficiente;
**brecha** distingue falta de prueba y diferencia funcional. Ninguna etiqueta
significa aceptación ni una ejecución aprobada; eso corresponde a `EP-*`.

## Correspondencias revisadas

| Objetivo / requisito | Casos canónicos | Realización y evidencia Vue | Alcance y límite |
| --- | --- | --- | --- |
| Acceso y renovación: `RF-AUT-001/002` | [AUT](../../../back/docs/requirements/use-cases/authentication/index.md), `CU-AUT-01`; renovación como soporte de los casos protegidos. | [auth](../../src/modules/auth), Router y Axios; `login.spec.ts`, `sessionRecovery.spec.ts`; `DP-VAL-002`, `DP-VUE-SESSION-001/002`, fichas `CP-VUE-AUT-001`, `CP-VUE-SESSION-001-01/002-01`. | Evidencia de captura, cookies administradas por Chromium y recuperación. API simulada en la suite rápida; `CP-VUE-SYS-001-01` añade login y refresh reales, sin acreditar todas sus variantes. |
| Cierre de sesión: `RF-AUT-003` | `CU-AUT-02`. | [AppNavigation](../../src/app/components/AppNavigation.vue) envía el formulario a `/cerrar-sesion`. | Cierre y rechazo posterior cubiertos en `sessionRecovery.spec.ts` y en el recorrido real de sistema; `DP-VUE-SESSION-004`, BRE-VUE-002. |
| Materiales y consumibles: `RF-CAT-001/006/007/025/026/027`, ajuste `RF-ADJ-001` | [ALM](../../../back/docs/requirements/use-cases/catalogs/index.md), `CU-ALM-01..06` y `17..22`. | [warehouse](../../src/modules/warehouse), `warehouse.spec.ts`, `inventoryFormTest.ts`, `inventoryNavigationTest.ts`; `DP-VUE-WH-*`. | Captura, modos, permisos de interfaz, versiones y solicitudes. No demuestra saldo persistido ni todas las alternativas de cada CU. |
| Merma y sus capturas: `RF-MER-001/002/004/011/012/013` | `CU-ALM-09..14`. | Mismo módulo, reglas públicas, `inventoryFormTest.ts` y `warehouse.spec.ts`; diseños de merma y recuperación en [diseño](01-test-design.md#pruebas-de-almacén). | La alternativa A2 de `CU-ALM-10` se implementa mediante confirmación y transición tipada; `DP-VUE-WH-011`, BRE-VUE-001. Rollback y peso/stock persistidos conservan evidencia backend separada. |
| Catálogos: `RF-CAT-022/023/024` | [CAT](../../../back/docs/requirements/use-cases/catalogs/index.md), `CU-CAT-09..26`. | [catalogs](../../src/modules/catalogs), `catalogs.spec.ts`, `catalogEditorTest.ts`, `catalogServiceTest.ts`; `DP-VUE-CAT-001..004`, ficha `CP-VUE-CAT-002-01`. | Las seis altas tienen representantes de navegador; versión antigua/nueva se observa en el contrato. No acredita autorización ni UPDATE real en PostgreSQL. |
| Personas y usuarios: `RF-IAM-001/002/004/005/006/007/008` | [IDA](../../../back/docs/requirements/use-cases/identity-access/index.md), `CU-IDA-01..09`. | [identity](../../src/modules/identity), `identityTest.ts`, `records.spec.ts`; `DP-VUE-IDA-001/002`, `DP-VUE-REC-002`. | Se prueban captura, asignaciones, contraseña y reporte de personas por área. Usuarios añade recorrido de descarga/reintento y lectura del XLSX real en sistema: `DP-VUE-REC-003`, BRE-VUE-004. |
| Clientes y proveedores: `RF-CAT-002/003/010` y reglas del CU correspondiente | `CU-CAT-01..08`. | [directory](../../src/modules/directory), `directoryTest.ts`, `records.spec.ts`; `DP-VUE-DIR-001`, `DP-VUE-REC-001/002`. | Captura, permisos de interfaz y conflictos con API simulada. Clientes/Proveedores añaden descarga/reintento y lectura de XLSX real en sistema: `DP-VUE-REC-003`, BRE-VUE-004. |
| Historiales y reportes: `RF-REP-001/005/011` | `CU-ALM-07..08`, `15..16`, `23..24`. | [movements](../../src/modules/movements), `movementServiceTest.ts`, `movementFiltersTest.ts`, `movements.spec.ts`; `DP-VUE-MOV-001..004`. | Identidad, filtros, ámbito y descarga del cliente. El contenido/fórmulas XLSX reales se revisan en las integraciones de reportes. |
| Compras: `RF-REC-001/002/005/007/008/011` | [ENT](../../../back/docs/requirements/use-cases/purchases/index.md), `CU-ENT-01..12`. | [purchases](../../src/modules/purchases), `purchaseTest.ts`, `purchases.spec.ts`; `DP-VUE-COM-001/002/003`, ficha `CP-VUE-COM-003-01`. | Altas en ambas variantes; corrección/cancelación representativas en materiales. Solicitudes y estimaciones no demuestran historia, stock o transacción real. |
| Salidas de artículos: `RF-ISS-001..006`, `RN-013/014` | [SAL](../../../back/docs/requirements/use-cases/issues/index.md), `CU-SAL-01..07` y `15..21`. | [issues](../../src/modules/issues), `issueTest.ts`, `issues.spec.ts`; `DP-VUE-ISS-001..004`, fichas `CP-VUE-ISS-002-01/02/03`. | Altas de las tres variantes; el recorrido navegador surtido/devolución representa materiales, consumibles y mermas: BRE-VUE-003. Stock y pertenencia real no se prueban con el harness. |
| Salidas de merma: `RF-WST-002..007`, `RN-013/014` | `CU-SAL-08..14`. | Mismo módulo y fichas, con recurso `wastes` y su API específica. | Evidencia de interacción y contrato; la devolución limita la captura por saldo leído, Express vuelve a comprobar el saldo vigente. |
| Políticas transversales: `RN-001/009/010` | Operaciones protegidas y escrituras de los CU anteriores. | Guardas, `usePageAccess`, reglas públicas, `apiClientTest.ts`, `routerTest.ts`, `pageAccessTest.ts`. | Ocultar controles y validar formularios no demuestra autorización/validación definitiva. La evidencia servidor se mantiene en backend. |

Los nombres anteriores corresponden a archivos de [tests/unit](../../tests/unit)
y [tests/e2e](../../tests/e2e). Cada diseño enlaza sus consumidores; las fichas
críticas conservan datos/pasos. No se deduce cobertura de todos los casos por
compartir un composable o por tener un único recorrido que pase.

## Brechas y decisiones pendientes

Los IDs se conservan para seguir la revisión inicial. «Atendida» identifica una
implementación o evidencia añadida; no equivale a aceptación integral del producto.

| ID | Tratamiento implementado y evidencia | Estado y límite |
| --- | --- | --- |
| BRE-VUE-001 | `useWasteDuplicateRecovery`, mapper de contexto reducido, evento tipado del editor al contenedor y `warehouse.spec.ts`; `CP-VUE-WH-011-01/02`. Conflicto definitivo → cancelar o abrir entrada; cero queda vacío y la escritura requiere otro Guardar. | Diferencia funcional atendida conforme a `CU-ALM-10` A2. Unitarias cubren permiso, contrato incompleto, incertidumbre y desmontaje. El navegador usa API simulada; rollback/entrada real conservan sus integraciones backend. |
| BRE-VUE-002 | `CP-VUE-SESSION-004-01` comprueba POST, cookies y retorno al login. `CP-VUE-SYS-001-01` añade cierre con el router real y rechazo de `/me`, refresh y URL protegida. | Evidencia de cierre añadida en ambos niveles. No afirma revocación de tokens copiados fuera del navegador ni otras políticas no especificadas. |
| BRE-VUE-003 | `issues.spec.ts` añade Consumibles al mismo recorrido de edición/surtido/devolución, `CP-VUE-ISS-002-01/02`. | Evidencia de navegador añadida para `CU-SAL-19/20`. Las fronteras fraccionarias unitarias siguen usando Materiales como representante; stock/atomicidad reales corresponden al backend. |
| BRE-VUE-004 | `records.spec.ts` parametriza Usuarios, Clientes y Proveedores: búsqueda, fallo/reintento, archivo y ausencia de paginación. El caso de sistema abre sus XLSX reales y comprueba inclusión/exclusión por búsqueda. | Evidencia de reportes añadida: `CP-VUE-REC-003-01` y `CP-VUE-SYS-001-01`. No afirma todas sus columnas, fórmulas, volúmenes ni combinaciones de filtros. |
| BRE-VUE-005 | `tests/system/application.spec.ts`, con Express/routers/middleware reales y PostgreSQL aislado; preparación y ejecución propias en CI. `CP-VUE-SYS-001-01` verifica alta persistida, reportes, sesión y cierre. | Unión cliente/servidor representada. Las demás pruebas de navegador siguen simulando API; este recorrido no cierra todas las brechas de integración del inventario. |

Las ejecuciones y sus resultados se conservan como `EP-*` en CI o en la revisión.
Los procedimientos de reproducción y limpieza están en
[pruebas de sistema](04-system-tests.md). Se conservan las integraciones backend
y los demás pendientes de la matriz del producto; no se deduce cobertura total
por compartir componentes o por resolver estas cinco observaciones.
