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
| Acceso y renovación: `RF-AUT-001/002` | [AUT](../../../back/docs/requirements/use-cases/authentication/index.md), `CU-AUT-01`; renovación como soporte de los casos protegidos. | [auth](../../src/modules/auth), Router y Axios; `login.spec.ts`, `sessionRecovery.spec.ts`; `DP-VAL-002`, `DP-VUE-SESSION-001/002`, fichas `CP-VUE-AUT-001`, `CP-VUE-SESSION-001-01/002-01`. | Evidencia de captura, cookies administradas por Chromium y recuperación. API simulada; no verifica credenciales reales/JWT. |
| Cierre de sesión: `RF-AUT-003` | `CU-AUT-02`. | [AppNavigation](../../src/app/components/AppNavigation.vue) envía el formulario a `/cerrar-sesion`. | Código presente, sin recorrido Playwright específico de cierre en la suite revisada: BRE-VUE-002. No se interpreta un login correcto como prueba del logout. |
| Materiales y consumibles: `RF-CAT-001/006/007/025/026/027`, ajuste `RF-ADJ-001` | [ALM](../../../back/docs/requirements/use-cases/catalogs/index.md), `CU-ALM-01..06` y `17..22`. | [warehouse](../../src/modules/warehouse), `warehouse.spec.ts`, `inventoryFormTest.ts`, `inventoryNavigationTest.ts`; `DP-VUE-WH-*`. | Captura, modos, permisos de interfaz, versiones y solicitudes. No demuestra saldo persistido ni todas las alternativas de cada CU. |
| Merma y sus capturas: `RF-MER-001/002/004/011/012/013` | `CU-ALM-09..14`. | Mismo módulo, reglas públicas, `inventoryFormTest.ts` y `warehouse.spec.ts`; diseños de merma y recuperación en [diseño](01-test-design.md#pruebas-de-almacén). | Evidencia parcial: la alternativa A2 de `CU-ALM-10` difiere del cliente actual, BRE-VUE-001. Rollback y peso/stock persistidos conservan evidencia backend separada. |
| Catálogos: `RF-CAT-022/023/024` | [CAT](../../../back/docs/requirements/use-cases/catalogs/index.md), `CU-CAT-09..26`. | [catalogs](../../src/modules/catalogs), `catalogs.spec.ts`, `catalogEditorTest.ts`, `catalogServiceTest.ts`; `DP-VUE-CAT-001..004`, ficha `CP-VUE-CAT-002-01`. | Las seis altas tienen representantes de navegador; versión antigua/nueva se observa en el contrato. No acredita autorización ni UPDATE real en PostgreSQL. |
| Personas y usuarios: `RF-IAM-001/002/004/005/006/007/008` | [IDA](../../../back/docs/requirements/use-cases/identity-access/index.md), `CU-IDA-01..09`. | [identity](../../src/modules/identity), `identityTest.ts`, `records.spec.ts`; `DP-VUE-IDA-001/002`, `DP-VUE-REC-002`. | Se prueban captura, asignaciones, contraseña y reporte de personas por área. No se declara recorrido de navegador equivalente para el reporte de usuarios ni su archivo real: BRE-VUE-004. |
| Clientes y proveedores: `RF-CAT-002/003/010` y reglas del CU correspondiente | `CU-CAT-01..08`. | [directory](../../src/modules/directory), `directoryTest.ts`, `records.spec.ts`; `DP-VUE-DIR-001`, `DP-VUE-REC-001/002`. | Captura, permisos de interfaz y conflictos con API simulada. La presencia de exportación no demuestra sus datos ni un recorrido equivalente por reporte: BRE-VUE-004. |
| Historiales y reportes: `RF-REP-001/005/011` | `CU-ALM-07..08`, `15..16`, `23..24`. | [movements](../../src/modules/movements), `movementServiceTest.ts`, `movementFiltersTest.ts`, `movements.spec.ts`; `DP-VUE-MOV-001..004`. | Identidad, filtros, ámbito y descarga del cliente. El contenido/fórmulas XLSX reales se revisan en las integraciones de reportes. |
| Compras: `RF-REC-001/002/005/007/008/011` | [ENT](../../../back/docs/requirements/use-cases/purchases/index.md), `CU-ENT-01..12`. | [purchases](../../src/modules/purchases), `purchaseTest.ts`, `purchases.spec.ts`; `DP-VUE-COM-001/002/003`, ficha `CP-VUE-COM-003-01`. | Altas en ambas variantes; corrección/cancelación representativas en materiales. Solicitudes y estimaciones no demuestran historia, stock o transacción real. |
| Salidas de artículos: `RF-ISS-001..006`, `RN-013/014` | [SAL](../../../back/docs/requirements/use-cases/issues/index.md), `CU-SAL-01..07` y `15..21`. | [issues](../../src/modules/issues), `issueTest.ts`, `issues.spec.ts`; `DP-VUE-ISS-001..004`, fichas `CP-VUE-ISS-002-01/02/03`. | Altas de las tres variantes; el recorrido navegador surtido/devolución usa materiales y mermas, no consumibles: BRE-VUE-003. Stock y pertenencia real no se prueban con el harness. |
| Salidas de merma: `RF-WST-002..007`, `RN-013/014` | `CU-SAL-08..14`. | Mismo módulo y fichas, con recurso `wastes` y su API específica. | Evidencia de interacción y contrato; la devolución limita la captura por saldo leído, Express vuelve a comprobar el saldo vigente. |
| Políticas transversales: `RN-001/009/010` | Operaciones protegidas y escrituras de los CU anteriores. | Guardas, `usePageAccess`, reglas públicas, `apiClientTest.ts`, `routerTest.ts`, `pageAccessTest.ts`. | Ocultar controles y validar formularios no demuestra autorización/validación definitiva. La evidencia servidor se mantiene en backend. |

Los nombres anteriores corresponden a archivos de [tests/unit](../../tests/unit)
y [tests/e2e](../../tests/e2e). Cada diseño enlaza sus consumidores; las fichas
críticas conservan datos/pasos. No se deduce cobertura de todos los casos por
compartir un composable o por tener un único recorrido que pase.

## Brechas y decisiones pendientes

| ID | Condición revisada | Tipo y tratamiento pendiente | Responsable de resolver |
| --- | --- | --- | --- |
| BRE-VUE-001 | `CU-ALM-10`, alternativa A2 exige apertura contextual de Agregar stock y traslado de captura; Vue muestra rechazo y requiere localizar el registro. | Diferencia funcional. Adaptar el cliente al flujo o registrar aprobación funcional de una variante. No declarar el CU íntegramente satisfecho en Vue ni modificar la ficha para ocultarlo. | Desarrollo y responsable funcional. |
| BRE-VUE-002 | `CU-AUT-02`: la suite Vue no incluye un recorrido específico de cierre. | Brecha de prueba. Diseñar el cierre/retorno y el rechazo posterior del acceso; la comprobación del servidor requiere además el nivel HTTP correspondiente. | Desarrollo/revisión técnica. |
| BRE-VUE-003 | `CU-SAL-19/20`: el navegador no representa surtido/devolución de consumibles en el recorrido revisado. Las unitarias parametrizan el transporte de los tres recursos, pero la frontera de devolución descrita usa materiales. | Brecha de evidencia específica. Seleccionar un representante de navegador sin repetir toda la matriz unitaria. No afirmar que falta necesariamente la implementación. | Desarrollo/revisión técnica. |
| BRE-VUE-004 | Reportes de usuarios, clientes y proveedores no tienen en la suite revisada la misma evidencia de navegador que Personas por área. Las respuestas de descarga son simuladas. | Cobertura parcial. Revisar representantes por recurso y el archivo real en el nivel que corresponda; una descarga con MIME correcto no acredita filas/fórmulas. | Desarrollo/revisión técnica. |
| BRE-VUE-005 | Los recorridos seleccionados interceptan la API; no hay aquí evidencia de navegador contra Express/PostgreSQL real. | Límite de integración. Conservar integraciones backend y seleccionar un recorrido conjunto con entorno/base aislados cuando se requiera acreditar esa unión. | Responsable técnico y preparación del entorno. |

Estas brechas no se resuelven cambiando únicamente la redacción ni por ejecutar
otra vez los casos existentes. Su aceptación o cierre requiere una decisión y
evidencia del resultado, conforme al [plan de pruebas](../../../back/docs/testing/test-plan.md).
