# 5. Movimientos en Vue

## Propósito y fuentes

Describe para desarrollo las consultas de [movements](../../src/modules/movements),
relacionadas con `CU-ALM-07..08`, `15..16` y `23..24` del
[caso Vue de movimientos/reportes](../requirements/04-inventory-and-document-use-cases.md#cu-vue-013).
La evidencia del cliente está en [movements.spec.ts](../../tests/e2e/movements.spec.ts).
El [índice Vue](../index.md) conserva los criterios de esta descripción técnica.

## Alcance y permisos

Las tres consultas tienen estas rutas Vue:

| Vista | Ruta Vue | API de consulta |
| --- | --- | --- |
| Materiales | `/movimientos/materiales` | `/api/admin/movements/materials` |
| Consumibles | `/movimientos/consumibles` | `/api/admin/movements/consumables` |
| Mermas | `/movimientos/mermas` | `/api/admin/movements/wastes` |

`/movimientos` abre Materiales. Las tres vistas y el grupo del menú requieren
`movements:read`; una cuenta que sólo tiene ese permiso también entra desde
`/almacen` al primer historial autorizado. El menú contiene únicamente rutas Vue.
Express sigue autorizando cada solicitud.

Son historiales de sólo lectura: no permiten crear, modificar ni borrar movimientos.
Las operaciones de inventario generan el historial en el servidor. No se envía
`expectedVersion` para consultar o exportar.

## Presentación y filtros

Se conservan los títulos «Historial de Movimientos de materiales», «Historial de
Movimientos de consumibles» e «Historial de Movimientos de merma», y las diez
columnas originales: Fecha, Tipo, Folio, Material (Consumible en su vista), Base,
Altura, Proveedor, Stock anterior, Movimiento y Nuevo stock. Las fechas ya vienen
formateadas por el servidor y se conservan; las cantidades admiten decimales,
signos y saldos históricos desconocidos, representados con «—».

El acordeón permite buscar por texto, tipo (Entrada, Salida, Ajuste o Devolución),
proveedor, recurso y fechas. La captura es un borrador hasta pulsar Buscar; cambiar
página, actualizar o exportar usa los filtros aplicados. Limpiar filtros reinicia
la consulta y su paginación. Sólo Fecha, Tipo y Folio admiten orden del servidor;
el inicial es Fecha descendente.

Seleccionar un recurso requiere elegir primero proveedor. Cambiarlo limpia el
recurso y cancela/descarta opciones del proveedor anterior. Los selectores son
paginados, con búsqueda, carga incremental y reintento mediante `RemoteSelect` y
`useRemoteLookup`. Incluyen proveedores inactivos para consultar historia. Las
opciones de materiales/consumibles usan `material.id`, no el ID de la oferta
`SupplierMaterial`; las mermas usan su propio ID.

Los selectores respetan permisos de lectura independientes: `suppliers:read`,
`materials:read` para materiales/consumibles y `wastes:read` para mermas. Si faltan,
el historial puede consultarse con el resto de filtros sin solicitar esas opciones.
La validación de fechas comprueba formato, calendario y orden del rango al buscar;
no aparecen errores sólo por abrir la página.

## Exportación y actualización

`admin:reports-read` habilita Exportar Excel. El modal reutiliza `EditorDialog` y
ofrece Mes actual, Mes específico y Filtros aplicados en la tabla. Los dos primeros
solicitan `monthlyReport=true`; el servidor resuelve el mes actual en Ciudad de
México. Un mes específico requiere `YYYY-MM`. Los reportes mensuales ignoran los
filtros de la tabla; el personalizado exporta todos los registros coincidentes,
sin limitarse a la página visible. Las rutas son
`/api/admin/reports/movements/<recurso>/excel` y el cliente valida la respuesta Blob
Excel. Un fallo conserva el modal para reintentar; el permiso de exportación es
independiente del de consulta.

La actualización reutiliza la estrategia Vue de Almacén: consulta en segundo plano
cada 30 segundos cuando la pestaña está visible y al recuperar foco si pasó ese
intervalo. No añade Socket.IO al navegador. Se pausa durante cargas y mientras el
reporte está abierto o descargándose; conserva los datos visibles durante refresh.

## Responsabilidades y reutilización

- `MovementPage` coordina permisos, filtros aplicados, listado y reporte por instancia.
- `useMovementFilters` mantiene el borrador y la dependencia proveedor/recurso.
- `MovementFilters`, `MovementTable` y `ReportScopeDialog` reciben props y emiten
  eventos; no conocen Axios, sesión ni persistencia.
- `movementService` adapta los contratos existentes de Express, las identidades de
  opciones y las tres modalidades de exportación mediante el cliente Axios compartido.
- `usePagedList`, `useListSearch`, `useReportScope` sobre `useFileExport`, `ListFilters`, `ServerTable` y
  `useVisibleRefresh` se reutilizan con otros módulos. Los formatos numéricos de
  inventario e historial comparten `shared/utils/formatNumbers`.

No se agrega una dependencia, store global ni generador de CRUD para estas consultas.
Consulta [arquitectura](../architecture/01-structure-and-boundaries.md) y [diseño de pruebas](../testing/01-test-design.md#movimientos-diseño-de-comprobación).
