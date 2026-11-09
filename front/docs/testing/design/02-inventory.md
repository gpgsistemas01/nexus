# Diseño de pruebas: Inventario y captura de merma

## Importación XLSX

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición observable | Casos |
| --- | --- | --- | --- | --- |
| `DP-VUE-IMP-001` | `RF-VUE-015`, duplicación tras perder la respuesta, acceso indebido y límite de filas | Unitario/transporte y Chromium con API simulada; particiones válido/error/permiso/frontera 500 y transiciones vista previa → envío incierto → recarga → recibo/reintento | Un multipart para validar y un JSON con versión/clave para confirmar. Se aceptan 500 filas y se rechazan 501. Una plantilla no pagina: incluye los registros coincidentes hasta 500 y no entrega subconjuntos silenciosos. La pantalla explica filtros, columnas grises y la hoja Catalogos. Un 200 incompleto se rechaza. Errores bloquean el lote. El pendiente guarda sólo referencia por cuenta/recurso; recuperar conserva su clave. Vista legible a 320 px. | [CP-VUE-IMP-001-01](../cases/cp-vue-imp-001-01.md) |

## Pruebas de Almacén

`DP-VUE-IMP-001` incluye el aviso explícito de que validar no guarda filas y un
duplicado bloquea todo el lote. Chromium verifica el número de fila coincidente,
la descarga del informe y la ausencia del botón de confirmación. Si la confirmación
queda incierta, el aviso de «todavía no guardado» se oculta hasta recuperar el resultado.

Los casos unitarios viven en `tests/unit/modules/warehouse/` y
`tests/unit/shared/http/apiClientTest.ts`. `tests/e2e/warehouse.spec.ts`
comprueba los componentes reales de Vuetify en Chromium. Comparte fixtures de
contratos con las unitarias, sin simular el estado reactivo del formulario.

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-WH-001` | RF-VUE-006/007/008; captura e inventario | Unitario y navegador; particiones de permiso y transiciones de sesión | Entrada directa y navegación entre los tres recursos; sólo lectura oculta escrituras/costos/Excel. Sin permiso rechaza la ruta; 401 vuelve al login tras un refresh fallido; fallo de sesión permite reintentar. Consultas simultáneas comparten una renovación; 403/409/5xx no reenvían escrituras. | [inventoryFormTest.ts](../../../tests/unit/modules/warehouse/inventoryFormTest.ts); [warehouse.spec.ts](../../../tests/e2e/warehouse.spec.ts) |
| `DP-VUE-WH-002` | RF-VUE-006/007/008; captura e inventario | Unitario y navegador; particiones por recurso/operación, fronteras y transición lectura → escritura rival → conflicto | Alta de consumible omite dimensiones; edición omite identidad/stock y conserva ambas versiones; ajuste exige motivo/stock válido y conserva la versión original. Baja usa la relación con el proveedor. Al editar, costo ausente o cero impide enviar; un costo positivo se conserva en el payload. El alta inicial admite cero. Un 409 conserva captura sin reintento automático ni confirmación falsa. | [CP-VUE-WH-002-01](../cases/cp-vue-wh-002-01.md) |
| `DP-VUE-WH-003` | RF-VUE-006/007/008; captura e inventario | Unitario y navegador; captura → respuesta incierta → recarga → recuperación | Rollo de 50 m, referencia neta 10 kg y merma neta 2.5 kg muestra/envía 12.5 m; envía pesos capturados sin neto ni muestras derivados. Repetir conserva cuerpo y operationId, confirma una sola captura y limpia el pendiente. Almacenamiento bloqueado impide enviar; desmontaje descarta confirmación tardía. | [inventoryFormTest.ts](../../../tests/unit/modules/warehouse/inventoryFormTest.ts); [warehouse.spec.ts](../../../tests/e2e/warehouse.spec.ts) |
| `DP-VUE-WH-004` | RF-VUE-006/007/008; captura e inventario | Navegador y adaptador unitario; particiones éxito/error y transiciones de filtro/página | Navegar, recargar, ver detalles y usar filtros/páginas conserva consultas al servidor; un fallo permite recuperar el listado. A 390/320 px no desborda el documento y el menú es accesible. HTML recibido como JSON o Excel no se trata como resultado válido. | [inventoryReportTest.ts](../../../tests/unit/modules/warehouse/inventoryReportTest.ts); [warehouse.spec.ts](../../../tests/e2e/warehouse.spec.ts) |

Relacionan los riesgos existentes `DP-CON-001`, `DP-CON-002`, `DP-MER-004` y
los casos `CU-ALM-01..06`, `CU-ALM-09..10`, sin sustituir sus pruebas persistentes.
`materialControllerDbTest.js`, `inventoryWriteConcurrencyDbTest.js`,
`wasteWeightDbTest.js` e `inventoryReportControllerDbTest.js` conservan la evidencia
HTTP/Prisma en una base aislada; no se usa la base de desarrollo.

## UI, HTTP y pruebas de contrato

La [composición visual](../../architecture/views/logical/components/08-shared-ui.md)
identifica marcos, estilos y selectores propios. El
[contrato HTTP](../../architecture/contracts/client-contracts.md) define las respuestas
que estas pruebas admiten o rechazan.

Las rutas `/api/*` prueban el contrato de Vue. El adaptador Axios conserva
transformaciones e interceptores; Chromium usa componentes reales con API simulada. Las
integraciones HTTP/Prisma quedan en `back/tests`, sin importar código privado al cliente.
Véanse los [límites por nivel](../01-test-plan.md#niveles-y-entornos).

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-WH-005` | RF-VUE-006/007/008; captura e inventario | Navegador; páginas 1 → 2 fallida → reintento → 3 y selección | Un catálogo de 45 proveedores carga de 20 en 20 al llegar al final, no avanza durante un fallo, reintenta esa página y mantiene el nombre seleccionado sin repetir opciones. | [remoteOptionsTest.ts](../../../tests/unit/modules/warehouse/remoteOptionsTest.ts); [warehouse.spec.ts](../../../tests/e2e/warehouse.spec.ts) |
| `DP-VUE-WH-006` | RF-VUE-006/007/008; captura e inventario | Navegador; particiones por recurso/permiso y transiciones de orden/dispositivo | Materiales/Mermas mantienen encabezados agrupados y Consumibles sus columnas; costo/estado se ocultan sin permiso; el orden por medidas usa el índice del backend. Menú compacto/móvil sólo contiene rutas Vue e iconos SVG; Almacén agrupa los tres enlaces en un acordeón operable con teclado. En escritorio, clic abre el panel desde la barra de iconos y clic fuera vuelve a compacto; navegar y Escape cierran el panel. | [inventoryFormTest.ts](../../../tests/unit/modules/warehouse/inventoryFormTest.ts); [warehouse.spec.ts](../../../tests/e2e/warehouse.spec.ts) |
| `DP-VUE-WH-007` | RF-VUE-006/007/008; captura e inventario | Navegador; particiones alta/edición/ajuste y referencia actual/histórica | Proveedor, presentación, unidad, medidas y pesos de consulta siguen visibles sin hacerse editables; la merma mantiene referencia histórica y neto. Cambiar metros a piezas limpia dimensiones; limpiar filtros vuelve a la primera página sin búsqueda/proveedor. | [inventoryFormTest.ts](../../../tests/unit/modules/warehouse/inventoryFormTest.ts); [warehouse.spec.ts](../../../tests/e2e/warehouse.spec.ts) |
| `DP-VUE-WH-008` | RF-VUE-006/007/008; captura e inventario | Unitario y navegador; apertura → desmontaje y cancelar → confirmar → error → reintentar → éxito | Abortar antes de terminar de abrir no deja un popup global pendiente ni envía solicitudes. SweetAlert2 enfoca Cancelar; cancelar no escribe. El primer fallo conserva la confirmación, no repite automáticamente y el reintento confirma la baja por ID de relación y muestra el aviso de éxito. | [feedbackTest.ts](../../../tests/unit/shared/ui/feedbackTest.ts); [warehouse.spec.ts](../../../tests/e2e/warehouse.spec.ts) |
| `DP-VUE-WH-009` | RF-VUE-006/007/008; captura e inventario | Unitario y navegador; apertura → foco sin captura → edición → validación → envío → reapertura | Cargar catálogos o perder foco sin modificar no publica errores. Validar un campo editado no muestra errores de los campos intactos; enviar valida toda la captura. Reabrir no conserva errores anteriores. Login aplica la misma política. | [inventoryFormTest.ts](../../../tests/unit/modules/warehouse/inventoryFormTest.ts); [warehouse.spec.ts](../../../tests/e2e/warehouse.spec.ts) |
| `DP-VUE-WH-010` | RF-VUE-006/007/008; captura e inventario | Unitario; fronteras antes/a los 30 s y transiciones visible/oculta, modal abierto/cerrado, consulta pendiente/fallida y desmontaje | Foco no repite una lectura reciente. La recarga automática no solapa consultas ni activa la carga de la tabla; conserva filas idénticas. Pausa con modal/pestaña oculta, renueva datos vencidos al volver, admite reintento manual y descarta respuestas tras desmontar. | [inventoryListTest.ts](../../../tests/unit/modules/warehouse/inventoryListTest.ts); [warehouse.spec.ts](../../../tests/e2e/warehouse.spec.ts) |

`usePagedList` se prueba desde catálogo e inventario. `inventoryListTest.ts` cubre falta
de permiso (sin consultas manuales ni automáticas) y página fuera de rango (última
disponible). Login, inventario y catálogos comprueban campos intactos/editados y envío
mediante `useFormInteraction`. Navegador usa controles reales y un alta por catálogo, sin
fijar CSS o formato.

Los casos `apiClientTest.ts` mantienen renovación única, límite de un reintento,
rechazo público sin refresh, errores de red sin repetición de escritura y cancelación.
`inventoryReportTest.ts` conserva por separado los parámetros del reporte y el
rechazo de HTML presentado como Excel.

## Un archivo por operación y conteo final

`DP-VUE-IMP-001` cubre `RF-VUE-015`: el selector asigna una operación a todo el
archivo; cambiarla retira el XLSX previo y se bloquea durante una descarga, borrador
o confirmación incierta. Particiones por permiso y por operación compatible/cruzada;
transiciones selección → carga → vista previa → confirmación/recuperación.
Un operador con ajuste y sin costos sólo ve Ajustar existencias. Las descargas
conservan la operación en su nombre; un rechazo deja la captura sin confirmar.
El conteo muestra stock anterior/final, incluido cero, y confirma una sola solicitud.
HTTP/Prisma comprueba columnas de consulta e IDs, identidad, versiones, datos
compartidos, rollback y ausencia de efectos de archivos incompatibles. Chromium
no sustituye esa evidencia persistente.

La captura, consulta y recuperación admiten exclusivamente las tres operaciones del
selector. Se conservan los casos de atomicidad independiente de altas, ediciones
y conteos, y el rechazo de operaciones no admitidas.
