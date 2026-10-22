# Interfaz Vue, HTTP y ubicación de las pruebas

## Decisiones aplicadas

Se conserva la organización y la información de las tablas existentes en EJS.
Sus plugins orientan el comportamiento esperado; los componentes Vue gestionan
el renderizado, eventos, estado y ciclo de vida de la nueva interfaz.

| Necesidad | Herramienta aplicada | Motivo y alternativa revisada |
| --- | --- | --- |
| Tabla con búsqueda, paginación, orden y encabezados agrupados | `VDataTableServer`, incluido en Vuetify | Proporciona controles y estados para datos paginados desde Express. [DataTables Vue](https://datatables.net/manual/vue) es una integración oficial válida, con slots y soporte reactivo, y su núcleo 3 ya no requiere jQuery. Mantener dos motores de tabla añadiría adaptadores y estilos para el mismo flujo; Vuetify ya cubre las necesidades actuales. |
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

Se aplican las [variables de tema de Vuetify](https://vuetifyjs.com/en/features/theme/)
y sus [defaults por ámbito](https://vuetifyjs.com/en/features/global-configuration/):

- `app/plugins/vuetify.ts`: paleta de Almacén, tabla con degradado verde y borde
  inferior oscuro, filas alternadas y acciones de filtro azul/gris. El modal
  recupera cabecera oscura y franja ámbar de EJS; el menú compacto usa fondo oscuro
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
`InventoryEditor` presenta cabecera, cuerpo desplazable y acciones siempre visibles;
a partir del tamaño móvil de Vuetify ocupa la pantalla. `InventoryFormField`
concentra la adaptación de inputs, checkbox, textarea y selector remoto.

| Modo | Datos recuperados y comportamiento |
| --- | --- |
| Crear material/consumible | Datos, proveedor, presentación, unidad, inventario y existencias/observaciones. Muestra Stock inicial como motivo de consulta. Materiales habilita medidas según la unidad; cambiar a piezas limpia las medidas capturadas. |
| Editar | Muestra proveedor, presentación, unidad y medidas como consulta; permite nombre, stock mínimo, costo y estado según el contrato existente. No envía identidad, dimensiones ni stock como cambios. |
| Ajustar stock | Conserva datos, inventario, medidas y pesos visibles como consulta, junto al stock actual. Captura nuevo stock, motivo y observaciones. Conserva la versión original. |
| Crear merma | Selecciona proveedor/material y muestra presentación/unidad heredadas. El material se habilita después del proveedor; cambiar proveedor limpia la referencia y captura anterior. Rollos capturan muestra, cono y peso total; neto y medidas calculadas son de consulta. |
| Editar merma / agregar stock | Conserva pesos y medidas. Muestra rollo completo cuando existe; de lo contrario conserva largo/peso de la referencia histórica. Agregar captura cantidad y observaciones. |

El alta de proveedores desde el selector EJS queda fuera de esta migración de
Materiales, Consumibles y Mermas: requiere un formulario Vue de Proveedores. No se
abre una pantalla EJS desde el menú ni desde estos controles.

Un costo ausente en la respuesta no se convierte silenciosamente en cero al editar:
la validación exige una captura explícita. Cero sigue siendo un valor válido.
Los campos de consulta nunca amplían el payload admitido por el servidor.

### SweetAlert2 y errores

`shared/ui/feedback.ts` concentra configuración y estilo. Se importa SweetAlert2
directamente con Composition API; no se requiere otro wrapper ni una propiedad
global de Vue. Su entrada raíz ya incorpora el CSS base. La confirmación de baja
usa `preConfirm` y `showLoaderOnConfirm`; Cancelar no realiza solicitudes. Un fallo
conserva el diálogo para reintentar y no dispara otra escritura automáticamente.
Al desmontar la página se cancela la solicitud y se cierra sólo su confirmación.
Los nombres y mensajes se pasan mediante `titleText`/`text`, sin interpolar HTML.

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

## Propietarios y responsabilidades

| Ubicación | Responsabilidad |
| --- | --- |
| `app/layouts/AppLayout.vue` | Coordina sesión y distribución general; compone barra, drawer, navegación y ruta activa. |
| `app/components/AppNavigation.vue` | Presenta enlaces Vue ya autorizados y la acción de cerrar sesión; no obtiene permisos ni datos. |
| `app/navigation.ts` | Catálogo de rutas Vue del menú y permiso de cada entrada. |
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
| `useSelectedOption.ts` | Conserva la opción elegida al paginar o buscar; se reutiliza en selector, unidad y material de referencia. |
| `shared/ui/feedback.ts` | SweetAlert2 y su configuración común; sin estado de negocio ni acceso a la API. |
| `useInventoryEditor.ts` | Captura con VeeValidate, envío versionado y recuperación de merma. |
| `useRemoteOptions.ts` | Estado de catálogos paginados, sin renderizado. |
| `modules/warehouse/services/` | Adaptadores separados de inventario, catálogos y reportes; `inventoryPageRequest` conserva el contrato común de paginación. |
| `modules/warehouse/mappers/inventoryMapper.ts` | Convierte DTOs de inventario en filas de presentación, conservando ambas identidades y versiones. |
| `inventoryTable.ts` | Configuración de columnas y formato visual, sin acceso a API. |
| `formModel.ts` / `formFields.ts` | Datos permitidos, conexión a validadores públicos y controles de la captura. |

El menú sólo ofrece Materiales, Consumibles y Mermas. No enlaza a vistas EJS.
El proxy del frontend sólo reenvía `/api` y el POST `/cerrar-sesion`, que limpia las
cookies y redirige a `/inicio-sesion` de Vue. Esta acción de autenticación no monta
una vista EJS. Las vistas antiguas permanecen disponibles en el servidor Express
para sus consumidores existentes; no forman parte de la navegación Vue.

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

La estrategia y sus condiciones observables están en [tooling.md](tooling.md).
