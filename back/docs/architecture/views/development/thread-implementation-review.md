# Revisión de implementación del hilo de compras e inventario

La referencia recuperable es el [PR 1069](https://github.com/gpgsistemas01/nexus/pull/1069)
y su rama `codex/revisar-compras-de-consumibles-y-materiales`, punta `c339ef22`.
La conversación interna de `codex://threads/task_e_6ac41b69f0fc83318050080dcf599946`
no está disponible mediante las herramientas de esta revisión. Esta matriz cubre
sus cambios recuperables y las solicitudes explícitas de esta revisión; no atribuye
al hilo requisitos que no se pudieron leer.

## Cambios comprobados

| Capacidad | Situación encontrada | Implementación y evidencia vigente |
| --- | --- | --- |
| Compras separadas de materiales/consumibles | Implementada en API, Prisma y Vue; los commits del hilo no estaban unidos completamente a features. | Contexto de ruta y tipo fijados por servidor; validación de partidas homogéneas, reportes y folios separados. `goodsReceiptContextDbTest.js`, `purchaseTest.ts`, `purchaseQuickCreateTest.ts` y `purchases.spec.ts`. |
| Totales al cancelar la última partida | Faltaba preservar correctamente el encabezado y recuperar históricos con evidencia. | Servicio conserva el último total activo y migración incremental repara desde auditoría, sin reactivar partidas canceladas. `goodsReceiptCancellationTotalsDbTest.js` y concurrencia HTTP. Integrado en `ac7fed17`. |
| Acciones de tabla en móvil | El cambio anterior dependía de la interfaz retirada. | `ServerTable` fija la columna de acciones y `TableAction` mantiene tamaño táctil. `tableActions.spec.ts` usa pulsaciones reales con desplazamiento y tamaños móvil/escritorio. |
| Interfaz Vue sin EJS | Persistían motor, rutas, archivos, dependencias y manuales anteriores. | Retirados en `5d64f607`; Vue consume contratos públicos de `back/src/shared`. API sin motor de vistas. Pruebas de rutas de sistema, build y navegador. |
| Motor y componentes Excel vigentes | SheetKit ya sustituía ExcelJS en producción; la importación reutilizaba EditorDialog, RemoteSelect, Axios y useFileExport. | `@sheetkit/node` fijado en 1.0.1, versión actual consultada. Lectura/escritura en worker, límites de archivos y comprobaciones cruzadas del XLSX. ExcelJS permanece sólo como fixture/oráculo de desarrollo. |
| Altas y edición por Excel | Existían, cada una con modo/plantilla independiente. | Un archivo por inventario mezcla operaciones por fila, con IDs/versiones y vista previa común. Se conservan contratos anteriores para recuperar pendientes. `inventoryImportControllerDbTest.js` e `inventoryImport.spec.ts`. |
| Conteo físico por Excel | Sólo estaba documentado como propuesta; no había modo de conteo. | Ajustar o Editar y ajustar reemplaza el saldo por el conteo final, exige motivo/observaciones y genera AJU/AME con historia y conversiones. Vacío inválido, cero válido, datos compartidos una sola escritura, lote atómico e idempotente. |
| Pendientes/parciales ya entregadas | Sólo había propuesta. Surtir normal descontaba otra vez y podía fallar con stock desactualizado. | Registro histórico por lote de hasta 100 folios con corte, revisión original, declaración y recibo durable. Completa sólo lo faltante sin modificar stock/movimientos. `historicalDeliveryControllerDbTest.js`, `historicalDeliveryTest.ts`, `historicalDelivery.spec.ts`. |
| Procedencia, reportes y devoluciones posteriores | No existía evidencia histórica operativa. | Marca visible en consulta/lista/Excel, desconocidos sin rellenar y devolución física actual explícita, validada también por servidor. |
| Documentación de conciliación | Declaraba los flujos como pendientes. | [Conciliación implementada](inventory-reconciliation.md), [archivo único](inventory-excel-import.md), requisitos, OpenAPI, manuales Vue y diseños/casos de prueba sincronizados. |

Los tests de navegador con API simulada comprueban controles y transporte. Las
integraciones HTTP/Prisma prueban persistencia, rollback y concurrencia en una base
aislada. Los resultados de ejecución se conservan fuera de estos documentos;
esta matriz identifica capacidades y fuentes, sin sustituir la evidencia de cada corrida.

## Uso con inventario muy desactualizado

Contar existencias físicas actuales y conciliarlas mediante Ajustar en el archivo único.
Después revisar por folio las salidas entregadas antes del corte y registrar sus
entregas históricas. Continuar con Surtir para entregas nuevas. No reconstruir compras,
fechas ni costos desconocidos; no volver a descontar entregas antiguas ya realizadas.
