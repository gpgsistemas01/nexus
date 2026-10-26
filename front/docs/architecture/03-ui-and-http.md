# 3. Interfaz Vue, HTTP y ubicación de las pruebas

Esta guía explica para desarrollo los contratos de presentación y transporte
del cliente. El [índice Vue](../index.md) identifica sus fuentes, audiencia y límites;
el contrato HTTP normativo permanece en OpenAPI.

## Decisiones aplicadas

Las tablas presentan la información y agrupaciones definidas para cada recurso.
Los componentes Vue gestionan renderizado, eventos, estado y ciclo de vida;
Vuetify aporta los controles y sus estados de interacción.

| Necesidad | Herramienta aplicada | Motivo y alternativa revisada |
| --- | --- | --- |
| Tabla con búsqueda, paginación, orden y encabezados agrupados | `ServerTable` sobre `VDataTableServer`, incluido en Vuetify | Proporciona controles y estados para datos paginados desde Express. [DataTables Vue](https://datatables.net/manual/vue) es una integración oficial válida, con slots y soporte reactivo, y su núcleo 3 ya no requiere jQuery. Mantener dos motores de tabla añadiría adaptadores y estilos para el mismo flujo; Vuetify ya cubre las necesidades actuales. |
| Selectores remotos | `VAutocomplete` y la directiva `v-intersect` de Vuetify | Cargan la página siguiente al llegar al final, sin un botón obligatorio ni listeners Select2. Un fallo requiere reintento explícito; no genera solicitudes repetidas. |
| Captura de formularios | `VDialog`, grid Vuetify y VeeValidate | Controlan foco, Escape, scroll, distribución adaptable y errores por campo. El modal presenta secciones; el composable conserva validación y envío. |
| Confirmar eliminación y avisar resultados | [SweetAlert2](https://sweetalert2.github.io/) | Confirmación con foco inicial en Cancelar, spinner durante el envío, bloqueo de duplicados y reintento explícito; toast al confirmar una operación. Los formularios continúan en Vue y los errores corregibles permanecen junto al campo. |
| Menú principal | `VNavigationDrawer`, `VAppBar` y `VList` | Menú denso, plegable a una barra en escritorio y temporal con fondo en móvil; gestiona el espacio del contenido. |
| HTTP y sesión | Axios | Una instancia compartida, timeout, cancelación e [interceptor de renovación](https://axios-http.com/docs/interceptors). Sin token accesible al cliente ni librería HTTP diferente por formulario. |
| Panel de filtros | `VExpansionPanels` | Gestiona apertura y navegación por teclado. Buscar, limpiar y actualizar reutilizan los controles del mismo tema. |

La [tabla de Vuetify](https://vuetifyjs.com/en/components/data-tables/) acepta
encabezados con `children` y un modo de servidor. La búsqueda, el orden y la
paginación se resuelven en Express; no se descargan todas las filas para filtrarlas
en el navegador. Los slots mantienen botones y celdas como componentes Vue.

La [publicación de DataTables 3](https://datatables.net/blog/2026/datatables-3)
confirma que el núcleo ya no tiene dependencias. La revisión comprobó
`datatables.net-vue3` 3.0.8 y `datatables.net` 3.1.4; no se extrapola la dependencia
de jQuery de las versiones antiguas a la versión actual.

## Estilos y controles adaptados a Vue

Vue no prescribe una apariencia visual. Los colores, bordes, jerarquías y grupos
de MDB se trasladan al tema; los componentes de Vuetify controlan los elementos
interactivos. Cargar el CSS/JavaScript global de MDB sobre los mismos controles
introduciría dos conjuntos de reglas y gestión de estado.

Las páginas usan estos títulos de tabla: «Tabla de Existencias» para
Materiales, «Tabla de Consumibles», «Tabla de Mermas» y «Tabla de» seguido del
nombre de cada catálogo. Cada página tiene un único `h1` centrado; no se repiten
«Almacén» ni «Catálogos» como rótulos sobre él. Esos grupos siguen identificando
la navegación en el menú y la barra superior. Los enlaces y el título de la pestaña
conservan el nombre del módulo, por ejemplo, Materiales.

Se aplican las [variables de tema de Vuetify](https://vuetifyjs.com/en/features/theme/)
y sus [defaults por ámbito](https://vuetifyjs.com/en/features/global-configuration/):

- `app/plugins/vuetify.ts`: paleta de Almacén, tabla con degradado verde y borde
  inferior oscuro, filas alternadas y acciones de filtro azul/gris. El modal
  presenta cabecera oscura y franja ámbar; el menú compacto usa fondo oscuro
  y selección celeste. Las acciones distinguen editar, ajustar, agregar y eliminar
  por color, nombre accesible y tooltip, sin depender sólo del color.
- `shared/ui/controlDefaults.ts` y `VDefaultsProvider` del layout y del modal: densidad, variante, redondeo,
  color y mensajes de los controles. El login conserva sus propios estilos.
- `shared/ui/warehouse.css` adapta sólo las clases de esos defaults: contornos,
  fondo de consulta, foco visible y tooltip. La tabla conserva centrado, bordes,
  degradados, acciones y controles de paginación; la identidad queda alineada a
  la izquierda. Los estilos de estado de error de Vuetify permanecen vigentes.
- Montserrat Variable se sirve desde los assets compilados mediante Fontsource;
  `style.css` configura `--v-font-body` y `--v-font-heading` para Vuetify. No se
  consulta Google Fonts durante el uso. La fuente aplica también al login.
- Los componentes usan [CSS scoped de Vue](https://vuejs.org/api/sfc-css-features.html).
  `:deep()` se limita a celdas y detalles de los controles que realmente se adaptan;
  no se agregan resets globales de Bootstrap ni estilos MDB copiados completos.
- `VRow`/`VCol`, `VDialog` y `VExpansionPanels` resuelven distribución, scroll,
  foco, Escape y apertura. No se crean gestores manuales de modales ni listeners
  de Select2 sobre nodos controlados por Vue.

No se añaden Tailwind, otro motor de tabla ni un generador universal de formularios
para estos flujos. VeeValidate administra validación y errores; Axios administra
transporte y renovación. La selección dependiente, los payloads versionados y la
recuperación de operaciones siguen siendo reglas propias del módulo. Un plugin
visual no conoce esas reglas de la API.

### Campos y modos del modal

`formFields.ts` describe secciones con controles editables y valores de consulta.
`InventoryEditor` compone el marco compartido `EditorDialog`, con cabecera, cuerpo
desplazable y acciones siempre visibles;
a partir del tamaño móvil de Vuetify ocupa la pantalla. `InventoryFormField`
concentra la adaptación de inputs, checkbox, textarea y selector remoto.

| Modo | Datos recuperados y comportamiento |
| --- | --- |
| Crear material/consumible | Datos, proveedor, presentación, unidad, inventario y existencias/observaciones. Muestra Stock inicial como motivo de consulta. Materiales habilita medidas según la unidad; cambiar a piezas limpia las medidas capturadas. |
| Editar | Muestra proveedor, presentación, unidad y medidas como consulta; permite nombre, stock mínimo, costo y estado según el contrato existente. No envía identidad, dimensiones ni stock como cambios. |
| Ajustar stock | Conserva datos, inventario, medidas y pesos visibles como consulta, junto al stock actual. Captura nuevo stock, motivo y observaciones. Conserva la versión original. |
| Crear merma | Selecciona proveedor/material y muestra presentación/unidad heredadas. El material se habilita después del proveedor; cambiar proveedor limpia la referencia y captura anterior. Rollos capturan muestra, cono y peso total; neto y medidas calculadas son de consulta. |
| Editar merma / agregar stock | Conserva pesos y medidas. Muestra rollo completo cuando existe; de lo contrario conserva largo/peso de la referencia histórica. Agregar captura cantidad y observaciones. |

Los selectores de Inventario conservan la consulta de opciones y el alta contextual
de proveedor en Materiales/Consumibles mediante `InventoryWorkspace`.
[Compras](../modules/06-purchases.md) compone las altas rápidas con los editores Vue existentes
de Proveedores e Inventario mediante `PurchaseWorkspace`.
Su alta de artículo fija proveedor y omite stock/costo inicial capturado.

Un costo ausente en la respuesta no se convierte silenciosamente en cero al editar:
la validación exige una captura explícita. Cero sigue siendo un valor válido.
Los campos de consulta nunca amplían el payload admitido por el servidor.

### SweetAlert2 y errores

`shared/ui/feedback.ts` concentra configuración y estilo con `confirmAction`. Se importa SweetAlert2
directamente con Composition API; no se requiere otro wrapper ni una propiedad
global de Vue. Su entrada raíz ya incorpora el CSS base. La confirmación de baja
usa `preConfirm` y `showLoaderOnConfirm`; Cancelar no realiza solicitudes. Un fallo
conserva el diálogo para reintentar y no dispara otra escritura automáticamente.
Al desmontar la página se cancela la solicitud y se cierra sólo su confirmación.
Los nombres y mensajes se pasan mediante `titleText`/`text`, sin interpolar HTML.
La capa `nexus-feedback-container` queda por encima de los overlays Vuetify.
Cuando Compras confirma una cancelación desde su diálogo de consulta, ese diálogo
pausa su retención de foco mediante `retainFocus=false` y bloquea cierre/acciones
hasta resolver la confirmación; SweetAlert2 controla el foco mientras está abierto.
Los otros modales conservan `retainFocus=true`. `showSubmit=false` permite
reutilizar el marco para consulta sin presentar una acción de guardado.
`RecordEditorDialog` limita la columna de captura con `minmax(0, 1fr)` para que
una tabla ancha se desplace dentro de su wrapper sin estirar los campos.

`useInventoryRemoval` coordina la operación y conserva el ID de la relación con el
proveedor. `useInventory` mantiene permisos y coordina actualización/aviso de éxito.
No se usa el modal de captura como una confirmación vacía de eliminación.
Los errores de validación, conflicto, carga de catálogos y listado continúan en el
contexto donde se pueden corregir, mediante mensajes de campo o `VAlert`.

## Tabla y selectores

Materiales y Mermas conservan las dos filas de encabezados: Material, Medidas
(Base/Altura), Stock actual, Stock Mínimo, Presentación y Conversión (Cantidad/Unidad).
Costo y Activo dependen de los permisos originales. Mermas añade Pesos por unidad
(Cono/Total con cono/Neto); una consulta adicional muestra las referencias históricas.
Consumibles conserva Consumible, Existencia, Stock Mínimo, Presentación y Unidad
con su costo/estado según permisos. Las acciones dependen de los permisos de cada
operación y la elegibilidad devuelta por el servidor.

Sólo se habilita orden para columnas reconocidas por la API: nombre en los tres
recursos; base, altura y stock mínimo en Materiales. Los índices enviados conservan
el contrato DataTables que ya admite Express; usar Vuetify no obliga a cambiarlo.

`RemoteSelect` presenta opciones y emite búsqueda, más opciones o reintento.
`useRemoteOptions` resuelve páginas, debounce, cancelación y respuestas tardías.
Cambiar proveedor o búsqueda limpia la página anterior; la opción seleccionada
mantiene su etiqueta visual aunque deje de estar en el resultado de búsqueda.
Llegar al final dispara una sola solicitud pendiente. Un fallo conserva el catálogo
cargado y permite repetir la página fallida, sin avanzar ni duplicar las opciones.
El núcleo compartido elimina IDs repetidos dentro y entre páginas con un `Set`.
La paginación cuenta las filas recibidas, no las opciones únicas; una respuesta
vacía termina la carga aunque el servidor conserve un conteo antiguo. Cambiar
búsqueda reinicia el reintento y cancela la consulta anterior; reintentar cancela
el debounce para no duplicar solicitudes. Desmontar bloquea nuevas consultas.

## Alta contextual desde un selector

Se conserva `VAutocomplete` de Vuetify dentro de
[RemoteSelect](../../src/shared/components/RemoteSelect.vue). El slot `append-item`
presenta **Registrar…** para una búsqueda no vacía sin coincidencia exacta en las
opciones visibles, cuando el flujo lo autoriza y el control está disponible.
La comparación visual no garantiza unicidad en la base: Express conserva ese control.
El widget emite `create(search)`; no fabrica un ID ni registra el texto como entidad.
Las acciones también funcionan con teclado y los textos largos pueden ocupar varias líneas.

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

Las fuentes de esta coordinación son [InventoryWorkspace](../../src/app/pages/InventoryWorkspace.vue),
[PurchaseWorkspace](../../src/app/pages/PurchaseWorkspace.vue),
[IssueWorkspace](../../src/app/pages/IssueWorkspace.vue),
[DirectoryCreationPage](../../src/app/pages/DirectoryCreationPage.vue) y
[RemoteSelect](../../src/shared/components/RemoteSelect.vue). Los
[modelos general y específicos](../patterns/09-contextual-creation.md) explican
los eventos, contratos y propietarios de cada caso.

`LookupCreation` lleva texto y callback del consumidor vivo. Los Workspaces componen
módulos y vuelven a comprobar permisos; `DirectoryCreationPage` concentra el alta
de Proveedor/Cliente y la adaptación a `LookupItem`. `initialName` sólo precarga el
campo adecuado al crear. Cancelar no cambia la selección; un error mantiene el modal.
La selección confirmada conserva su etiqueta aunque la primera página remota aún
no contenga el ID. Los callbacks del formulario descartan respuestas tras desmontar;
un registro inactivo no queda seleccionado para una operación activa.

El [modelo aplicado](../patterns/03-composables-and-callbacks.md#altas-contextuales-mediante-eventos-y-callbacks)
y [selectCreation.spec.ts](../../tests/e2e/selectCreation.spec.ts) documentan la
coordinación y su evidencia de navegador con API simulada.

## Propietarios y responsabilidades

| Ubicación | Responsabilidad |
| --- | --- |
| `app/layouts/AppLayout.vue` | Coordina sesión y distribución general; compone barra, drawer, navegación y ruta activa. |
| `app/components/AppNavigation.vue` | Presenta enlaces Vue ya autorizados y la acción de cerrar sesión; no obtiene permisos ni datos. |
| `app/navigation.ts` | Catálogo de rutas Vue del menú y permiso de cada entrada. |
| `app/pages/*Workspace.vue` | Composición entre módulos y apertura del alta auxiliar con callback del formulario de origen. |
| `app/pages/DirectoryCreationPage.vue` | Contenedor compartido de alta contextual de Proveedor/Cliente, permisos y adaptación del resultado a opción. |
| `shared/http/apiClient.ts` | Instancia Axios, transporte e interceptor de sesión. |
| `shared/http/apiError.ts` | Traduce el contrato público de errores, incluidos JSON recibidos como Blob. |
| `modules/auth/services/authService.ts` | Credenciales y resultado del login; declara esa operación pública para evitar refresh al rechazarla. |
| `modules/warehouse/pages/` | Contenedores que conectan componentes y composables. |
| `modules/warehouse/components/` | Tabla, acciones de fila, captura y selector remoto con props/eventos. |
| `InventoryFilters.vue` | Panel visual con buscar, limpiar y actualizar; emite intenciones sin consultar la API. |
| `InventoryReportToolbar.vue` | Presenta alcance, descarga y reintento del reporte; no realiza solicitudes. |
| `modules/warehouse/composables/useInventory.ts` | Coordina permisos visuales, apertura/cierre del editor y confirmación de operaciones. |
| `useInventoryList.ts` | Lista, filtros, orden, paginación, actualización y cancelación de consultas. |
| `useInventoryReport.ts` | Descarga y ciclo de vida del reporte, con error independiente. |
| `useInventoryRemoval.ts` | Confirmación y escritura de baja, con cancelación al desmontar. |
| `useSelectedOption.ts` | Precarga una opción del mismo ID, incorpora datos remotos y conserva la selección al paginar; descarta la anterior al cambiar o limpiar el ID. Se reutiliza en controles, Compras, Salidas e Inventario. |
| `shared/ui/feedback.ts` | SweetAlert2 y su configuración común; sin estado de negocio ni acceso a la API. |
| `useInventoryEditor.ts` | Captura con VeeValidate, envío versionado y recuperación de merma. |
| `useInventorySelection.ts` | Consulta catálogos y conserva proveedor, unidad y plantilla; coordina los campos que dependen de esas selecciones. No guarda registros ni abre modales. |
| `useRemoteOptions.ts` | Estado de catálogos paginados, sin renderizado. |
| `modules/warehouse/services/` | Adaptadores separados de inventario, catálogos y reportes; `inventoryPageRequest` conserva los parámetros de inventario y `shared/http/pageRequest` valida el contrato paginado común. |
| `modules/warehouse/mappers/inventoryMapper.ts` | Convierte DTOs de inventario en filas de presentación, conservando ambas identidades y versiones. |
| `inventoryTable.ts` | Configuración de columnas y orden permitido, sin acceso a API. El formato numérico vive en `shared/utils/formatNumbers`. |
| `formModel.ts` / `formFields.ts` | Datos permitidos, conexión a validadores públicos y controles de la captura. |

El menú ofrece las secciones implementadas en Vue y filtra enlaces por permiso.
El proxy reenvía `/api` y el POST `/cerrar-sesion`; las rutas de página pertenecen
a Vue Router. El cierre procesa las cookies de respuesta y vuelve a
`/inicio-sesion` del cliente.

## Axios y sesión

Login, `/api/auth/me`, catálogos, inventario y reportes usan el mismo cliente.
El navegador conserva las cookies HttpOnly del mismo origen. El interceptor
comparte una única renovación entre respuestas `401` concurrentes y repite cada
solicitud original una sola vez. El login y la propia renovación se declaran
públicos. No se repiten automáticamente escrituras tras `403`, `409`, `5xx`,
timeout o pérdida de red. La cancelación conserva su significado y no se muestra
como fallo de conexión. Una descarga HTML no se confirma como Excel.

## Por qué las pruebas están en front y usan URLs de la API

Las URLs `/inicio-sesion` o `/almacen/materiales` son navegación de Vue; las URLs
`/api/auth/login` o `/api/warehouse/materials` son contratos HTTP con Express. Las
pruebas del frontend deben observar ambas: qué ve el usuario y qué solicitud envía
el navegador. Cambiar estas últimas por URLs ficticias puede dejar de comprobar
el contrato que realmente se consume.

- `front/tests/unit/`: comprueba captura, navegación, estado, mapeo e interceptores.
  Un adaptador simulado sustituye el transporte de Axios y deja ejecutar sus
  transformaciones/interceptores reales; no arranca Express ni usa PostgreSQL.
- `front/tests/e2e/`: ejecuta componentes reales en Chromium y simula respuestas
  de `/api/*`. Comprueba interacción, payload, permisos visibles, errores y reintentos.
  No demuestra que una contraseña sea válida ni que el stock quede persistido.
- `back/tests/integration/`: comprueba HTTP real, autorización y estado persistido
  con una base de pruebas aislada. Es el propietario de esas garantías.

Los fixtures de API en `front/tests/fixtures/` son datos de contrato para la UI.
No se importan controllers, servicios privados ni Prisma en las pruebas de Vue.
La importación de validadores públicos por sus alias reutiliza una fuente de
reglas; no ejecuta el backend dentro del frontend.

Las reglas de texto plano compartidas rechazan marcado y controles no imprimibles,
incluido NUL, y conservan saltos de línea y tabulaciones en observaciones. Vue muestra
nombres y errores mediante interpolación; no se usa `v-html` ni se almacenan entidades
HTML para sustituir el escape de salida. La validación del navegador ayuda a capturar;
Express vuelve a validar tipos, límites y permisos antes de persistir. Las contraseñas
no se recortan. El contrato de entrada y salida del servidor se mantiene en
[el estándar de seguridad](../../../back/docs/architecture/coding-standards/09-errors-security-audit-and-logging.md#entradas-normalización-y-salida).

La estrategia y sus condiciones observables están en [tooling.md](../development/02-tooling.md).

## Reutilización con Catálogos

La [guía de entradas y salida segura](04-input-security.md) distingue normalización,
validación y escape, documenta SweetAlert2 como texto y enlaza los controles del
servidor. Los patrones de composición y la evaluación SOLID están en
[patrones Vue](../patterns/01-applicability-and-principles.md).

El [módulo de Catálogos](../modules/03-catalogs.md) usa EditorDialog y ServerTable, extraídos del
editor y la tabla de inventario. Sus slots conservan los campos y celdas propios
de cada dominio. Los estilos compartidos pertenecen a esos marcos; las secciones de
pesos, stock y referencias siguen en los componentes de Almacén. La validación,
la sesión y HTTP se coordinan fuera de la presentación.


## Consistencia de listados y tablas

`RecordListPanel` comparte tarjeta con fondo degradado, título, acciones, errores
y contador entre todos los listados. `ListFilters` ofrece el acordeón y los botones
Actualizar/Limpiar/Buscar también en Catálogos, Identidad y Directorio. Los filtros
por área/rol conservan su lógica y se distribuyen mediante columnas Vuetify.

`TableFrame` es el propietario único de la apariencia de tablas paginadas y locales:
encabezado verde, subencabezados ámbar de inventario, bordes, filas alternas,
realce de hover/foco y paginador. `ServerTable` lo compone con `VDataTableServer`;
PersonForm lo utiliza con `VTable` para las asignaciones aún no guardadas, sin
introducir paginación ni solicitudes HTTP para esa captura.

Los colores se centralizan en el tema de Vuetify. Las filas con stock bajo definen
`--table-row-highlight` desde Inventario; el marco conserva ese aviso en filas
pares, al pasar el cursor y al enfocar una acción. Las reglas comunes tienen
especificidad suficiente frente a las tablas base de Vuetify, sin copiar estilos
en cada pantalla.

`TableAction` mantiene nombre accesible, icono, tooltip, color por operación y
bloqueo durante captura pendiente. `StateBadge` presenta el estado activo de forma
uniforme. Las tablas de sólo lectura omiten la columna de acciones. Los permisos,
el stock, las asignaciones y los payloads permanecen en sus módulos.

En Compras, `PurchaseTotals` reutiliza el resumen visual del encabezado y de
corrección, con las etiquetas del módulo. La corrección conserva su
confirmación explícita antes del request. Los avisos de éxito usan el mensaje
traducido del código realmente confirmado por el servicio mediante el catálogo
público `getSuccessMessage` del contrato de respuestas. `confirmMutation` sólo valida
el contrato y devuelve datos; no presenta avisos ni fabrica un código.
