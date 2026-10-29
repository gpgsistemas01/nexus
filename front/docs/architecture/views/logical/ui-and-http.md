# 1. Interfaz Vue, HTTP y ubicación de las pruebas

Esta guía explica para desarrollo los contratos de presentación y transporte
del cliente. El [índice Vue](../../../index.md) identifica sus fuentes, audiencia y límites;
el contrato HTTP normativo permanece en OpenAPI.

## Decisiones aplicadas

Las tablas presentan la información y agrupaciones definidas para cada recurso.
Los componentes Vue gestionan renderizado, eventos, estado y ciclo de vida;
Vuetify aporta los controles y sus estados de interacción.

| Necesidad | Herramienta aplicada | Responsabilidad |
| --- | --- | --- |
| Tabla con búsqueda, paginación, orden y encabezados agrupados | `ServerTable` sobre `VDataTableServer`, incluido en Vuetify | Proporciona controles y estados para datos paginados desde la API, con celdas y acciones Vue. |
| Selectores remotos | `VAutocomplete` y la directiva `v-intersect` de Vuetify | Cargan la página siguiente al llegar al final, sin un botón obligatorio ni listeners Select2. Un fallo requiere reintento explícito; no genera solicitudes repetidas. |
| Captura de formularios | `VDialog`, grid Vuetify y VeeValidate | Controlan foco, Escape, scroll, distribución adaptable y errores por campo. El modal presenta secciones; el composable conserva validación y envío. |
| Confirmar eliminación y avisar resultados | [SweetAlert2](https://sweetalert2.github.io/) | Confirmación con foco inicial en Cancelar, spinner durante el envío, bloqueo de duplicados y reintento explícito; toast al confirmar una operación. Los formularios continúan en Vue y los errores corregibles permanecen junto al campo. |
| Menú principal | `VNavigationDrawer`, `VAppBar` y `VList` | Menú denso, plegable a una barra en escritorio y temporal con fondo en móvil; gestiona el espacio del contenido. |
| HTTP y sesión | Axios | Una instancia compartida, timeout, cancelación e [interceptor de renovación](https://axios-http.com/docs/interceptors). Sin token accesible al cliente ni librería HTTP diferente por formulario. |
| Panel de filtros | `VExpansionPanels` | Gestiona apertura y navegación por teclado. Buscar, limpiar y actualizar reutilizan los controles del mismo tema. |

La [tabla de Vuetify](https://vuetifyjs.com/en/components/data-tables/) acepta
encabezados con `children` y un modo de servidor. La búsqueda, el orden y la
paginación se resuelven en el backend; no se descargan todas las filas para filtrarlas
en el navegador. Los slots mantienen botones y celdas como componentes Vue.

## Tema, estilos y controles

| Elemento | Fuente y aplicación |
| --- | --- |
| Tema y paleta | `app/plugins/vuetify.ts`: tabla verde, subencabezado ámbar, modal oscuro con franja ámbar, menú oscuro y selección celeste; acciones azul/gris según control. |
| Defaults de controles | `shared/ui/controlDefaults.ts` y `VDefaultsProvider` en layout/modal: densidad, variante, bordes y mensajes. El login conserva su composición. |
| Ajustes compartidos | `shared/ui/warehouse.css`: foco, contornos, consulta y detalles de los controles; conserva errores de Vuetify. |
| Tipografía | Montserrat Variable de Fontsource incluida en assets; `style.css` define `--v-font-body` y `--v-font-heading`. Incluye login y evita descarga de fuentes durante el uso. |
| Distribución y accesibilidad | Grid, diálogos y paneles Vuetify controlan adaptación, scroll, foco y Escape. Acciones con icono, nombre y tooltip; el color acompaña su significado. |
| Alcance CSS | SFC con CSS scoped; `:deep()` sólo para los detalles adaptados de controles. Vue conserva la propiedad del DOM. |

Cada página tiene un `h1` centrado con el nombre del módulo. Las tablas muestran
«Tabla de Existencias», «Tabla de Consumibles», «Tabla de Mermas» o «Tabla de» + catálogo.
Almacén/Catálogos identifican grupos del menú y barra, sin otro título sobre la página.
Las [decisiones ADR-VUE-006](../../decisions.md) fijan Vuetify y SweetAlert2;
los [marcos compartidos](#consistencia-de-listados-y-tablas) concentran su aplicación.

### Campos y modos del modal

`formFields.ts` describe secciones con controles editables y valores de consulta.
`InventoryEditor` compone el marco compartido `EditorDialog`, con cabecera, cuerpo
desplazable y acciones siempre visibles;
a partir del tamaño móvil de Vuetify ocupa la pantalla. `InventoryFormField`
concentra la adaptación de inputs, checkbox, textarea y selector remoto.

Los [modos de operación](../../../requirements/requirements-specification/06-operation-modes-and-effects.md)
definen los campos modificables. El [modelo de Inventario](class-and-type-models/05-inventory.md)
identifica destinos y datos; los [contratos de formularios](../../contracts/form-and-event-contracts.md)
definen los eventos que conecta el contenedor.

Los selectores de Inventario conservan la consulta de opciones y el alta contextual
de proveedor en Materiales/Consumibles mediante `InventoryWorkspace`.
[Compras](../development/frontend-technical-documentation/06-purchases.md) compone las altas rápidas con los editores Vue existentes
de Proveedores e Inventario mediante `PurchaseWorkspace`.
Su alta de artículo fija proveedor y omite stock/costo inicial capturado.

Un costo ausente en la respuesta no se convierte silenciosamente en cero al editar:
la validación exige una captura explícita. Cero sigue siendo un valor válido.
Los campos de consulta nunca amplían el payload admitido por el servidor.

### SweetAlert2 y errores

| Situación | Responsable y comportamiento |
| --- | --- |
| Confirmar baja | `shared/ui/feedback.ts` configura SweetAlert2 con foco en Cancelar, `preConfirm` y `showLoaderOnConfirm`. Cancelar no escribe; enviar bloquea duplicados; fallar permite reintento explícito. |
| Texto del aviso | `titleText`/`text`, sin interpolar HTML. La entrada raíz de SweetAlert2 incluye su CSS; `nexus-feedback-container` queda sobre los overlays Vuetify. |
| Desmontaje | Cancela la solicitud y cierra sólo la confirmación de su consumidor. |
| Cancelación de detalle de compra | El diálogo de consulta usa temporalmente `retainFocus=false` y bloquea cierre/acciones; SweetAlert2 administra el foco. Los demás modales mantienen `retainFocus=true`. |
| Consulta de registro | `showSubmit=false` reutiliza el marco sin botón de guardado. `RecordEditorDialog` usa `minmax(0, 1fr)` para contener tablas anchas sin estirar los campos. |
| Baja de inventario | `useInventoryRemoval` conserva el ID de la relación proveedor–artículo; `useInventory` coordina actualización y aviso. |
| Error corregible | Campo o `VAlert` en el contexto de captura, conflicto, catálogo o listado; los formularios permanecen en Vue. |

## Tabla y selectores

| Recurso | Estructura visible |
| --- | --- |
| Materiales | Dos niveles: Material, Medidas (Base/Altura), Stock actual, Stock Mínimo, Presentación y Conversión (Cantidad/Unidad). Costo/Activo dependen del permiso. |
| Mermas | La estructura anterior más Pesos por unidad (Cono/Total con cono/Neto); consulta de referencias históricas disponible. |
| Consumibles | Consumible, Existencia, Stock Mínimo, Presentación y Unidad; costo/estado según permisos. |

`ServerTable` usa `VDataTableServer`; API resuelve búsqueda, orden y paginación.
Sólo se ordena por columnas admitidas: nombre en los tres recursos y base/altura/stock
mínimo en Materiales. Los parámetros conservan el contrato DataTables de la API.
Las acciones dependen de permiso y elegibilidad recibida.

| Evento del selector | Resultado |
| --- | --- |
| Buscar o cambiar proveedor | Reinicia páginas y cancela/invalida la consulta anterior. |
| Llegar al final | Solicita una página con una única carga pendiente. |
| Recibir opciones repetidas | Deduplica por ID; el avance cuenta filas recibidas, no opciones únicas. |
| Página vacía | Termina la carga aunque el conteo del servidor esté desactualizado. |
| Error | Conserva opciones y página fallida para reintento explícito; éste cancela debounce pendiente. |
| Selección fuera de página | `useSelectedOption` conserva etiqueta/datos del mismo ID; cambia o limpia al cambiar el ID. |
| Desmontaje | Aborta/invalida y bloquea nuevas consultas. |

`RemoteSelect` presenta y emite intenciones; `useRemoteOptions` adapta el comportamiento
compartido. La [secuencia del lookup](../processes/02-shared-runtime/03-remote-lookup.md)
explica la coordinación con `useRemoteLookup`.

## Alta contextual desde un selector

`RemoteSelect` compone `VAutocomplete`. Su slot `append-item` ofrece **Registrar…**
si hay búsqueda no vacía, falta coincidencia exacta visible y el contexto/permiso lo
admite. Emite `create(search)`; La API comprueba unicidad. Teclado y texto multilínea
conservan el comportamiento del control.

### Componentes revisados y decisión

| Alternativa | Capacidad y límite para este caso | Decisión |
| --- | --- | --- |
| [VAutocomplete de Vuetify](https://vuetifyjs.com/en/api/v-autocomplete/) | Selector de la biblioteca instalada, con búsqueda, menús y slots. El [código oficial](https://github.com/vuetifyjs/vuetify/blob/master/packages/vuetify/src/components/VAutocomplete/VAutocomplete.tsx) expone `append-item` y `no-data`. | Reutilizarlo con una extensión pequeña en `RemoteSelect`, manteniendo apariencia y controles del proyecto. |
| [VCombobox de Vuetify](https://vuetifyjs.com/en/components/combobox/) | Permite valores que no estaban en la lista. Eso no demuestra un alta validada ni devuelve por sí mismo el UUID persistido. | No sustituir estos selectores: su valor debe identificar un registro confirmado por el servidor. |
| [Vue Multiselect](https://vue-multiselect.js.org/#sub-tagging) | `taggable` y `@tag` notifican la intención de añadir una opción. La aplicación debe construirla y completar el guardado. | Alternativa de comunidad válida; no se añade otra biblioteca para un evento cubierto por el selector actual. |
| [Vueform Multiselect](https://github.com/vueform/multiselect) | `createOption` y `onCreate` permiten aceptar, transformar o rechazar la nueva opción, incluso de forma asíncrona. | También requiere integrar el formulario y la API de Nexus; no justifica cambiar todos los controles existentes para este flujo. |

El código propio se limita al contrato, los permisos y la coordinación del formulario.
Se reutilizan `DirectoryEditorPage`, `InventoryEditorPage` y sus servicios/validadores.
No se programa un selector completo ni se crea un modal distinto para cada consumidor.

### Casos de alta contextual en Vue

| Contexto | Comportamiento del selector | Contenedor y retorno |
| --- | --- | --- |
| Materiales / Consumibles | Registrar proveedor con lectura/alta autorizadas; precarga el texto buscado. | `InventoryWorkspace` y `DirectoryCreationPage`; conserva la captura del artículo y selecciona el proveedor activo confirmado. |
| Compras de Materiales / Consumibles | Registrar proveedor o artículo. | `PurchaseWorkspace`; proveedor usa Directorio y artículo fija proveedor/`creationContext=goodsReceipt` mediante Inventario. |
| Salidas de Materiales / Consumibles / Mermas | Registrar cliente cuando el encabezado es editable y hay permisos. | `IssueWorkspace` y `DirectoryCreationPage`; el cliente vuelve mediante callback tras guardar. |
| Merma: proveedor y plantilla; Presentación, Unidad, Motivo y filtros | Consulta de entidades existentes, sin alta contextual. | Los componentes mantienen búsqueda, paginación y selección del recurso. |
| Asesor y Solicitante de Salidas | Consulta de Personas según dependencias del encabezado. | `useIssueHeaderSelection` aplica filtros y limpieza de selecciones dependientes. |

| Resultado del alta auxiliar | Efecto en la captura origen |
| --- | --- |
| Confirmada y activa | Workspace adapta a `LookupItem`, invoca el callback y conserva etiqueta/selección mientras refresca opciones. |
| Cancelada o con error | Conserva la selección anterior; el error permanece en el auxiliar. |
| Registro inactivo | No selecciona una opción inactiva para una operación activa. |
| Consumidor desmontado | Descarta el callback tardío. |

Los [diagramas general y aplicados](../development/design-and-construction-patterns/09-contextual-creation.md)
identifican Workspaces, `DirectoryCreationPage`, eventos y callbacks. `LookupCreation`
transporta búsqueda/callback; `initialName` sólo precarga el alta. La evidencia está en
[selectCreation.spec.ts](../../../../tests/e2e/selectCreation.spec.ts), con API simulada.

## Propietarios y responsabilidades

| Capa | Propietarios y responsabilidad |
| --- | --- |
| Navegación | `AppLayout`, `AppNavigation` y `app/navigation.ts`: distribución, enlaces autorizados y ruta activa; la presentación recibe enlaces resueltos. |
| Composición entre dominios | `app/pages/*Workspace` y `DirectoryCreationPage`: alta auxiliar, comprobación de permisos y retorno tipado al formulario. |
| Páginas | Contenedores de `modules/*/pages`: conectan sesión, comportamiento y eventos. |
| Presentación | Tablas, filtros, toolbar de reporte y campos de captura: props/eventos; marcos visuales comunes en `shared/components`. |
| Interacción | `useInventory`, `useInventoryList`, `useInventoryReport`, `useInventoryRemoval` y `useInventoryEditor`: coordinación de permisos visuales, listado, reporte, baja y captura en flujos separados. |
| Selección | `useInventorySelection`, `useRemoteOptions`, `useRemoteLookup` y `useSelectedOption`: dependencias, páginas, cancelación y etiqueta seleccionada. |
| Contratos | Servicios de inventario/catálogos/reportes, `inventoryMapper`, `inventoryPageRequest` y `shared/http/pageRequest`: endpoints, DTOs, parámetros y páginas válidas. |
| Esquemas y columnas | `formModel`/`formFields` y `inventoryTable`: captura admitida y orden; formato numérico en `shared/utils/formatNumbers`. |
| Infraestructura | `apiClient`, `apiError` y `feedback`: HTTP/sesión, error normalizado y avisos; `authService` define la solicitud pública de login. |

La [referencia por módulo](../development/frontend-technical-documentation/index.md)
localiza los colaboradores concretos. El proxy deriva `/api` y POST `/cerrar-sesion`;
Vue Router resuelve páginas. El cierre procesa cookies y vuelve a `/inicio-sesion`.

## Axios y sesión

`apiClient` encapsula la instancia Axios y el interceptor de autenticación;
`createAuthSession` proporciona identidad y permisos a los contenedores. Las
condiciones de renovación y los resultados del transporte se definen en el
[contrato HTTP](../../contracts/client-contracts.md#sesión-y-errores). La
[secuencia de renovación](../processes/01-session/04-concurrent-renewal.md)
identifica las llamadas entre sus propietarios.

## Ubicación y contrato de las pruebas

| Ubicación | Comprueba | Límite |
| --- | --- | --- |
| `front/tests/unit` | Captura, navegación, estado, mappers e interceptores. El adaptador simulado permite ejecutar Axios real. | Sin backend ni PostgreSQL reales. |
| `front/tests/e2e` | Componentes reales en Chromium: interacción, payload, permisos visibles y recuperación. | `/api/*` simulado; no acredita contraseña válida ni stock persistido. |
| `back/tests/integration` | HTTP real, autorización y persistencia con base aislada. | Sus garantías requieren el entorno del servidor. |

Las rutas de página son navegación Vue; `/api/*` define el intercambio HTTP que las
pruebas del cliente observan. Fixtures de `front/tests/fixtures` representan respuestas;
no importan controllers, servicios privados ni Prisma. Los alias públicos comparten
reglas de captura sin ejecutar el backend dentro de Vue.

La [guía de seguridad](input-security.md) conserva normalización/escape/contraseñas y
[tooling](../../../development/02-tooling.md), la preparación de pruebas.

## Reutilización con Catálogos

Catálogos reutiliza `EditorDialog` y `ServerTable`. Los slots mantienen campos y celdas
del dominio; pesos, stock y referencias permanecen en Almacén. Validación, sesión y HTTP
se coordinan fuera de presentación. Los [patrones y principios](../development/design-and-construction-patterns/01-applicability-and-principles.md)
explican esta distribución.

## Consistencia de listados y tablas

| Componente o fuente | Contrato visual compartido |
| --- | --- |
| `RecordListPanel` | Tarjeta degradada, título, acciones, errores y contador de listados. |
| `ListFilters` | Acordeón y Actualizar/Limpiar/Buscar; filtros propios distribuidos por grid. |
| `TableFrame` | Encabezados verdes, subencabezado ámbar cuando aplica, bordes, filas alternas, hover/foco y paginador. |
| `ServerTable` / `PersonForm` | Reutilizan el marco con `VDataTableServer` paginado o `VTable` para asignaciones locales, respectivamente. |
| Tema y `--table-row-highlight` | Paleta central y aviso de stock bajo conservado en filas pares, hover y foco; reglas comunes sin copiar CSS por pantalla. |
| `TableAction` / `StateBadge` | Acción con nombre, icono, tooltip y bloqueo pendiente / estado activo uniforme. Consulta omite acciones. |
| `PurchaseTotals` | Resumen del encabezado y de corrección con etiquetas de Compras. La corrección exige confirmación antes del request. |
| `confirmMutation` / feedback | El servicio confirma el código recibido; el aviso presenta su mensaje público. No genera códigos ni folios desde la UI. |

Permisos, stock, asignaciones y payloads conservan sus propietarios de dominio.
