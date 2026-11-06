# CP-VUE-SYS-001-01 — recorrido cliente, servidor y persistencia

## Diseño y trazabilidad

`CU-AUT-01/02`, `CU-CAT-06/08/04`, `CU-IDA-09`, `DP-VUE-SYS-001`. Representante de unión entre capas, filtros y transiciones de sesión.

## Especificación del caso y datos

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-VUE-SYS-001-01` | Base dedicada, distinta de desarrollo y migrada; Vue y Express propios, Chromium sin interceptar API. setup.ts crea fixtures y manifiesto temporal. | Sufijo único y cuenta de prueba creados por setup.ts; cliente/proveedor y registros de exclusión; valores exactos en manifiesto temporal de la corrida, sin credenciales reales. | Login desde Vue; crear cliente; consultar Prisma y recargar. Filtrar/exportar Usuarios, Clientes y Proveedores; abrir XLSX con ExcelJS. Retirar sólo accessToken, recargar y observar refresh. Cerrar sesión; solicitar `/me`, refresh y una URL protegida. | Una fila activa de cliente, visible tras recarga. Cada XLSX real tiene encabezado/filas, contiene el representante y excluye la otra fixture. Refresh real 200 restablece cookies HttpOnly. Cierre elimina ambas cookies; `/me` y refresh responden 401 y la URL protegida abre login. El cliente persistido permanece una sola vez. | setup.ts elimina sólo filas, asignaciones, auditoría y catálogos de su manifiesto y después elimina el manifiesto temporal. |

## Fuente ejecutable y alcance

[application.spec.ts](../../../tests/system/application.spec.ts), `sistema: login, alta persistida, reportes reales, renovación y cierre con rutas protegidas`. `setup.ts` limpia sus filas, asignaciones, auditoría y catálogos creados y elimina el manifiesto. No prueba todos los roles, fórmulas o transacciones de inventario.
