# Diseño de pruebas: Contratos y componentes transversales

## Formularios de registro

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-FORM-001` | Escrituras inválidas, duplicadas o posteriores al cierre al compartir el ciclo de formulario | Unitario; particiones y transiciones consulta → edición → validación → envío/error/conflicto/desmontaje | Apertura sin errores; rechazo local sin request; bloqueo durante envío y conflicto; resultado confirmado, corrección tras error y desmontaje durante validación asíncrona sin escritura. | [recordFormTest.ts](../../../tests/unit/shared/composables/recordFormTest.ts); suites de Catálogos, Directorio, Identidad, Compras y Salidas. |

## Consistencia y reutilización de tablas

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-TABLE-001` | Orden incorrecto al compartir tablas | Unitario; particiones por mapa y transición de recurso | `tableQueryTest.ts`: conserva índices discontinuos de inventario, traduce página/tamaño/sentido, descarta una columna exclusiva de proveedor al cambiar a cliente y conserva Fecha descendente del historial. | [tableQueryTest.ts](../../../tests/unit/shared/composables/tableQueryTest.ts) |
| `DP-VUE-LIST-002` | Limpieza compartida pierde filtros, tamaño u orden | Unitario; transición aplicada → borrador → limpio | `listInteractionTest.ts`: limpia texto aplicado y borrador, reinicia filtros y página, conserva tamaño y sentido. | [listInteractionTest.ts](../../../tests/unit/shared/composables/listInteractionTest.ts) |

Las pruebas de navegador cubren `RecordListPanel`, `ListFilters`, `TableFrame`, `TableAction` y
`StateBadge`: responsabilidades, permisos, conflictos y móvil. La revisión visual cubre
escritorio y 320/390 px, subencabezados, stock bajo y recortes. No sustituir estos casos
por aserciones de CSS o colores. Aplican los [límites de
simulación](../01-test-plan.md#niveles-y-entornos).

## Crecimiento de catálogos y fronteras arquitectónicas

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-LOOKUP-001` | Cargas interminables y opciones duplicadas al cambiar un catálogo | Unitario; transiciones entre páginas | `remoteLookupTest.ts`: páginas con IDs repetidos avanzan por filas recibidas; una página vacía con conteo antiguo desactiva más carga; un error se reintenta en la misma página y no adelanta el contador. `warehouse.spec.ts` verifica en navegador tres solicitudes (0/20/40), opciones únicas, selección conservada y fin del indicador con conteo antiguo. | [remoteLookupTest.ts](../../../tests/unit/shared/composables/remoteLookupTest.ts); [warehouse.spec.ts](../../../tests/e2e/warehouse.spec.ts) |
| `DP-VUE-LOOKUP-002` | Consultas fuera de contexto o alta ofrecida antes de completar la búsqueda | Unitario; transiciones búsqueda/reintento, permiso y desmontaje | `remoteLookupTest.ts`: la espera de 250 ms ya es pendiente; cambiar texto sustituye esa búsqueda y reinicia la página. Reintentar cancela la espera; deshabilitar o desmontar limpia/invalida la consulta. | [remoteLookupTest.ts](../../../tests/unit/shared/composables/remoteLookupTest.ts); [remoteOptionsTest.ts](../../../tests/unit/modules/warehouse/remoteOptionsTest.ts); [movementFiltersTest.ts](../../../tests/unit/modules/movements/movementFiltersTest.ts) |
| `DP-VUE-LOOKUP-003` | Perder filtros o cancelación al agrupar los parámetros de consulta | Unitario con adaptador HTTP simulado; particiones por recurso, proveedor activo/de captura, área y roles múltiples | Las solicitudes tipadas conservan endpoint, búsqueda, segunda página, filtros y `AbortSignal`. Se ejercitan Compras, Salidas, Inventario y opciones de Identidad sin servidor ni base de datos. | [purchaseTest.ts](../../../tests/unit/modules/purchases/purchaseTest.ts); [issueTest.ts](../../../tests/unit/modules/issues/issueTest.ts); [remoteOptionsTest.ts](../../../tests/unit/modules/warehouse/remoteOptionsTest.ts); [identityTest.ts](../../../tests/unit/modules/identity/identityTest.ts) |
| `DP-VUE-PAGE-001` | RD-VUE-007; conteos inválidos usados en paginación | Unitario; fronteras cero/negativo/fraccionario/entero no seguro | `pageRequestTest.ts`: cero conserva un listado vacío válido; los conteos inválidos rechazan el contrato en el adaptador HTTP y no se presentan como páginas válidas. | [pageRequestTest.ts](../../../tests/unit/shared/http/pageRequestTest.ts) |

`npm run lint` comprueba imports de `shared`, presentación, servicios y mappers. Revisar
contratos/transporte permitidos y dependencias rechazadas: estado de módulos en `shared` y
Vue/Router/componentes en servicios o mappers. Estas pruebas no miden rendimiento ni
capacidad concurrente.

## Seguridad de texto y avisos

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-SEC-001` | Un aviso interpreta el nombre/error como HTML | Unitario; particiones título/descripción/error | `feedbackTest.ts` usa SweetAlert2 real en jsdom con `<img data-injected ...>`: conserva título y texto, no crea el nodo, un error no confirma la eliminación y se cierra al cancelar. El aviso de éxito también conserva el mensaje como texto. | [CP-VUE-SEC-001-01](../cases/cp-vue-sec-001-01.md) |
| `DP-VUE-SEC-002` | Datos antiguos/externos ejecutan marcado pese a validar el alta actual | Unitario; particiones salida de tabla/valor de formulario | `catalogs.spec.ts` recibe un nombre con `img` y `onerror`; Chromium muestra el texto exacto, precarga el mismo valor al editar, no crea el elemento y no asigna la variable del manejador. API simulada, sin escritura. | [catalogs.spec.ts](../../../tests/e2e/catalogs.spec.ts) |

`formValidationParityTest.js` verifica reglas compartidas; `CP-INT-VAL-007`, los tres
endpoints reales de salidas. Los contratos están en [Entradas y salida
segura](../../architecture/views/development/input-handling.md) y
[Patrones/SOLID](../../architecture/views/development/design-and-construction-patterns/01-applicability-and-principles.md).
`vue/no-v-html` es error de lint; todavía deben revisarse otros usos del DOM y opciones de
plugins.

## Responsabilidades de documentos

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-DOC-001` | Contratos de documento por modo | Unitario y navegador; regresión por modo y particiones de estado | Requests y mensajes de alta, edición, surtido, corrección, cancelación y devolución conservan sus contratos después de separar propietarios. Consulta/devolución no guardan el documento; selección de surtido protege detalles persistidos/cancelados y no muta el documento leído. | [purchaseTest.ts](../../../tests/unit/modules/purchases/purchaseTest.ts); [issueTest.ts](../../../tests/unit/modules/issues/issueTest.ts) |

La cobertura permanece en las suites de Compras y Salidas. Los tipos de escritura
se comprueban con `npm run check`; no se fijan rutas internas ni llamadas privadas
como criterio de arquitectura. La [tabla de propietarios](../../architecture/views/development/design-and-construction-patterns/08-document-responsibilities.md)
describe la colaboración que comprueban estas pruebas.

## Altas contextuales desde selectores

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-SEL-001` | RF-VUE-012; selección contextual | `CU-CAT-02/06`, `CU-ALM-02/18`, soporte de `CU-ENT-02/08` y Salidas; navegador y unitario. Particiones por consumidor/permiso, coincidencia/ausencia y transiciones abrir → cancelar/error/reintentar/guardar. | `selectCreation.spec.ts` representa proveedor en Materiales/Consumibles y Compras, artículo en ambas Compras y cliente en las tres Salidas. Comprueba precarga, retorno, captura conservada, contratos de compra, teclado y exclusión de alta en filtros/catálogos/merma o sin permiso. `inventoryFormTest.ts` añade proveedor inactivo, selección fuera de la página remota y respuesta tras desmontaje. Fichas `CP-VUE-SEL-001-01/02/03`. | [CP-VUE-SEL-001-01](../cases/cp-vue-sel-001-01.md); [CP-VUE-SEL-001-02](../cases/cp-vue-sel-001-02.md); [CP-VUE-SEL-001-03](../cases/cp-vue-sel-001-03.md) |

Las pruebas de navegador usan Vuetify y API simulada; no acredita todos los modos ni persistencia. Las
unitarias aíslan las guardas de ruta con un doble de `InventoryWorkspace`, coordinador de
inventario y altas auxiliares.

## Selección y separación del editor

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-SEL-002` | RF-VUE-012; selección contextual | Mostrar una etiqueta ajena al ID o perder datos al recargar; unitario, transiciones precarga → remoto → página distinta, cambio/limpieza de ID y precarga tardía. | `selectedOptionTest.ts` comprueba actualización de nombre/estado/datos, conservación fuera de página, descarte al limpiar/cambiar y estado independiente por formulario. No autoriza ni persiste registros. | [selectedOptionTest.ts](../../../tests/unit/shared/composables/selectedOptionTest.ts) |

`inventoryFormTest.ts` comprueba `useInventorySelection` y el editor para
limpieza de medidas y proveedor/plantilla, bloqueo de
captura pendiente, reintentos e identidad/versiones. `purchaseTest.ts` e
`issueTest.ts` conservan precarga de documentos, altas recientes y formularios de
consulta. Los recorridos de navegador existentes comprueban los consumidores
reales de `RemoteSelect`, incluidos filtros y altas contextuales con API simulada.

## Referencia de contratos TypeScript

| Riesgo | Nivel y técnica | Condición y fuente ejecutable |
| --- | --- | --- |
| Omitir firmas, expandir estructuras inferidas como contratos independientes o conservar declaraciones obsoletas. | Unitario; particiones TS/SFC, tipos locales/externos, aliases, genéricos, objetos anónimos, imports renombrados y cambios/retirada de fuentes. | `typeDocumentationTest.ts`: conserva campos, parámetros propiedad, props/eventos/slots y referencias locales en tablas; mantiene aliases y objetos anónimos dentro de su declaración, sin crear diagramas por contrato. Comprueba generación determinista, fuentes cambiadas y eliminación de salidas obsoletas. No valida reglas del negocio. |
