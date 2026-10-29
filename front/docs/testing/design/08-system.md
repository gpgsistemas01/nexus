# Diseño de pruebas: Recuperación y recorrido de sistema

## Recuperación, cierre y persistencia

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-WH-011` | RF-VUE-006/007/008; captura e inventario | `CU-ALM-10` A2 y `CU-ALM-13`; unitario y navegador. Decisiones permiso/metadatos/rechazo definitivo/confirmación y fronteras cero/positivo. | `wasteDuplicateRecoveryTest.ts` impide transición sin permiso, con contexto inválido, resultado incierto o desmontaje. `warehouse.spec.ts` comprueba cancelar/conservar, confirmar/trasladar y Guardar separado; fichas `CP-VUE-WH-011-01/02`. | [CP-VUE-WH-011-01](../cases/cp-vue-wh-011-01.md); [CP-VUE-WH-011-02](../cases/cp-vue-wh-011-02.md) |
| `DP-VUE-SESSION-004` | RF-VUE-001/002/014; sesión y recuperación | `RF-AUT-003`, `CU-AUT-02`; navegador simulado y sistema. Transición autenticado → cierre → acceso rechazado. | `sessionRecovery.spec.ts` comprueba POST, eliminación de cookies y vuelta al login; `application.spec.ts` ejecuta el router real y comprueba también `/me`/refresh 401. Ficha `CP-VUE-SESSION-004-01`. | [CP-VUE-SESSION-004-01](../cases/cp-vue-session-004-01.md) |
| `DP-VUE-REC-003` | `CU-IDA-09`, `CU-CAT-04/08` | Navegador y sistema; Particiones por recurso/filtro y fallo → reintento. | `records.spec.ts` parametriza los tres reportes, conserva búsqueda, omite paginación y recupera 503 sin repetir automáticamente. El caso de sistema abre los XLSX y verifica inclusión/exclusión. Ficha `CP-VUE-REC-003-01`. | [CP-VUE-REC-003-01](../cases/cp-vue-rec-003-01.md) |
| `DP-VUE-SYS-001` | `CU-AUT-01/02`, `CU-CAT-06/08/04`, `CU-IDA-09` | Sistema; Recorrido entre capas y transiciones de sesión. | Un login real permite crear cliente; Prisma y recarga confirman la fila. Los XLSX respetan búsqueda, el refresh emite cookies y el cierre impide acceder. Ficha `CP-VUE-SYS-001-01`; no se atribuyen todos los CU a ese recorrido. | [CP-VUE-SYS-001-01](../cases/cp-vue-sys-001-01.md) |
| `DP-VUE-SYS-002` | Riesgo de preparar fixtures en la base habitual | Unitario; particiones de configuración y equivalencia de destinos. | `systemEnvironmentTest.ts` admite test explícita y rechaza ausencia, nombre no test, protocolo ajeno, misma base con credenciales/query/alias loopback diferentes y destino directo distinto. La configuración comprueba esto antes de arrancar servidores. | [systemEnvironmentTest.ts](../../../tests/unit/system/systemEnvironmentTest.ts) |

Las fichas se encuentran en el [registro selectivo](../03-test-cases.md). El diseño
añade evidencia sobre condiciones identificadas; no altera requisitos ni reemplaza
las integraciones de inventario que permanecen en el backend.

## Herramientas documentales

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-MAN-001` | Manual que enseña funciones no permitidas, mezcla capturas de cuentas o modifica registros durante su preparación. | Unitario y navegador; tabla de decisiones por perfil, permiso de tarea y estado, particiones de configuración y publicación pendiente/completa. | Los quince perfiles seleccionan tareas y capturas propias. Operativos no tienen ajustes, surtido o devolución; Almacén y Sistemas conservan sus capacidades. Archivos de credenciales, rutas inválidas y artefactos incompletos se controlan separadamente. | [CP-VUE-MAN-001-01](../cases/cp-vue-man-001-01.md) |
