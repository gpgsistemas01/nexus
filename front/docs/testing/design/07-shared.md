# Diseño de pruebas: Contratos y componentes transversales

## Consistencia y reutilización de tablas

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-TABLE-001` | Orden incorrecto al compartir tablas | Unitario; particiones por mapa y transición de recurso | `tableQueryTest.ts`: conserva índices discontinuos de inventario, traduce página/tamaño/sentido, descarta una columna exclusiva de proveedor al cambiar a cliente y conserva Fecha descendente del historial. | [tableQueryTest.ts](../../../tests/unit/shared/composables/tableQueryTest.ts) |
| `DP-VUE-LIST-002` | Limpieza compartida pierde filtros, tamaño u orden | Unitario; transición aplicada → borrador → limpio | `listInteractionTest.ts`: limpia texto aplicado y borrador, reinicia filtros y página, conserva tamaño y sentido. | [listInteractionTest.ts](../../../tests/unit/shared/composables/listInteractionTest.ts) |

La suite de navegador existente recorre los consumidores reales de `RecordListPanel`,
`ListFilters`, `TableFrame`, `TableAction` y `StateBadge`, incluidos captura de
responsabilidades, permisos, conflictos y pantallas móviles. Se conservan los
casos existentes; no se sustituyen por pruebas que fijen clases CSS o copien los
colores de la implementación. La revisión visual de escritorio y 320/390 px
comprueba presentación, subencabezados, filas de stock bajo y ausencia de
recortes globales. Las respuestas HTTP se simulan y no demuestran persistencia.

## Crecimiento de catálogos y fronteras arquitectónicas

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-LOOKUP-001` | Cargas interminables y opciones duplicadas al cambiar un catálogo | Unitario; transiciones entre páginas | `remoteLookupTest.ts`: páginas con IDs repetidos avanzan por filas recibidas; una página vacía con conteo antiguo desactiva más carga; un error se reintenta en la misma página y no adelanta el contador. `warehouse.spec.ts` verifica en navegador tres solicitudes (0/20/40), opciones únicas, selección conservada y fin del indicador con conteo antiguo. | [remoteLookupTest.ts](../../../tests/unit/shared/composables/remoteLookupTest.ts); [warehouse.spec.ts](../../../tests/e2e/warehouse.spec.ts) |
| `DP-VUE-LOOKUP-002` | Consultas fuera de contexto | Unitario; transiciones búsqueda/reintento, permiso y desmontaje | `remoteLookupTest.ts`: buscar reinicia reintento a página 1, reintentar cancela debounce, deshabilitar limpia el error y desmontar cancela/bloquea callbacks posteriores. Las pruebas existentes de proveedor y respuestas tardías siguen en `remoteOptionsTest.ts` y `movementFiltersTest.ts`. | [remoteLookupTest.ts](../../../tests/unit/shared/composables/remoteLookupTest.ts); [remoteOptionsTest.ts](../../../tests/unit/modules/warehouse/remoteOptionsTest.ts); [movementFiltersTest.ts](../../../tests/unit/modules/movements/movementFiltersTest.ts) |
| `DP-VUE-LOOKUP-003` | Perder filtros o cancelación al agrupar los parámetros de consulta | Unitario con adaptador HTTP simulado; particiones por recurso, proveedor activo/de captura, área y roles múltiples | Las solicitudes tipadas conservan endpoint, búsqueda, segunda página, filtros y `AbortSignal`. Se ejercitan Compras, Salidas, Inventario y opciones de Identidad sin servidor ni base de datos. | [purchaseTest.ts](../../../tests/unit/modules/purchases/purchaseTest.ts); [issueTest.ts](../../../tests/unit/modules/issues/issueTest.ts); [remoteOptionsTest.ts](../../../tests/unit/modules/warehouse/remoteOptionsTest.ts); [identityTest.ts](../../../tests/unit/modules/identity/identityTest.ts) |
| `DP-VUE-PAGE-001` | RD-VUE-007; conteos inválidos usados en paginación | Unitario; fronteras cero/negativo/fraccionario/entero no seguro | `pageRequestTest.ts`: cero conserva un listado vacío válido; los conteos inválidos rechazan el contrato en el adaptador HTTP y no se presentan como páginas válidas. | [pageRequestTest.ts](../../../tests/unit/shared/http/pageRequestTest.ts) |

`npm run lint` mantiene las fronteras de imports estáticos de `shared`, presentación,
servicios y mappers. La revisión comprueba también ejemplos permitidos (contratos
públicos y transporte compartido) y rechazados (estado de módulos en shared,
Vue/Router/componentes en servicios y mappers) con la configuración real de ESLint.
No se añaden pruebas de tiempo con umbrales de rendimiento ni se atribuye a estos
casos una capacidad de usuarios concurrentes. Las pruebas de navegador simulan la API.

## Seguridad de texto y avisos

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-SEC-001` | Un aviso interpreta el nombre/error como HTML | Unitario; particiones título/descripción/error | `feedbackTest.ts` usa SweetAlert2 real en jsdom con `<img data-injected ...>`: conserva título y texto, no crea el nodo, un error no confirma la eliminación y se cierra al cancelar. El aviso de éxito también conserva el mensaje como texto. | [CP-VUE-SEC-001-01](../cases/cp-vue-sec-001-01.md) |
| `DP-VUE-SEC-002` | Datos antiguos/externos ejecutan marcado pese a validar el alta actual | Unitario; particiones salida de tabla/valor de formulario | `catalogs.spec.ts` recibe un nombre con `img` y `onerror`; Chromium muestra el texto exacto, precarga el mismo valor al editar, no crea el elemento y no asigna la variable del manejador. API simulada, sin escritura. | [catalogs.spec.ts](../../../tests/e2e/catalogs.spec.ts) |

Las reglas de proyecto compartidas se verifican en `formValidationParityTest.js` y
los tres endpoints reales de salidas se cubren con `CP-INT-VAL-007`. El navegador no
decide que una captura sea segura para persistir. El contrato y los patrones están
en [entradas y salida segura](../../architecture/views/development/input-handling.md) y [patrones/SOLID](../../architecture/views/development/design-and-construction-patterns/01-applicability-and-principles.md).
ESLint mantiene `vue/no-v-html` como error; esta regla no certifica ausencia de todos
los posibles usos inseguros del DOM ni sustituye revisar las opciones de un plugin.

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

Los casos de navegador usan los componentes Vuetify reales con API simulada.
No sustituyen integraciones de persistencia ni declaran probado cada modo de edición.
Las guardas de rutas permanecen aisladas de los controles visuales en unitarias;
su doble apunta al contenedor `InventoryWorkspace`, que compone inventario y creación auxiliar.

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
