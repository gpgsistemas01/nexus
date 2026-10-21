# Interfaz Vue, HTTP y ubicación de las pruebas

## Decisiones aplicadas

Se conserva la organización y la información de las tablas existentes en EJS.
Sus plugins orientan el comportamiento esperado; los componentes Vue gestionan
el renderizado, eventos, estado y ciclo de vida de la nueva interfaz.

| Necesidad | Herramienta aplicada | Motivo y alternativa revisada |
| --- | --- | --- |
| Tabla con búsqueda, paginación, orden y encabezados agrupados | `VDataTableServer`, incluido en Vuetify | Proporciona controles y estados para datos paginados desde Express. [DataTables Vue](https://datatables.net/manual/vue) es una integración oficial válida, con slots y soporte reactivo, y su núcleo 3 ya no requiere jQuery. Mantener dos motores de tabla añadiría adaptadores y estilos para el mismo flujo; Vuetify ya cubre las necesidades actuales. |
| Selectores remotos | `VAutocomplete` y la directiva `v-intersect` de Vuetify | Cargan la página siguiente al llegar al final, sin un botón obligatorio ni listeners Select2. Un fallo requiere reintento explícito; no genera solicitudes repetidas. |
| Formularios y confirmaciones | `VDialog` | Controla foco, Escape, fondo y cierre. El estado y el envío pertenecen al contenedor/composable, no al modal visual. |
| Avisos de éxito | `VSnackbar` | Un aviso breve después de guardar. Los errores de captura siguen junto a los campos; errores recuperables del listado permanecen visibles con reintento. [SweetAlert2](https://sweetalert2.github.io/) puede usarse con Vue, pero no es necesario instalar un segundo sistema de modales para estos casos. |
| Menú principal | `VNavigationDrawer`, `VAppBar` y `VList` | Menú denso, plegable a una barra en escritorio y temporal con fondo en móvil; gestiona el espacio del contenido. |
| HTTP y sesión | Axios | Una instancia compartida, timeout, cancelación e [interceptor de renovación](https://axios-http.com/docs/interceptors). Sin token accesible al cliente ni librería HTTP diferente por formulario. |
| Captura de formularios | VeeValidate y reglas públicas existentes | Se mantiene el contrato de validación sin reescribirlo en otra biblioteca. |

La [tabla de Vuetify](https://vuetifyjs.com/en/components/data-tables/) acepta
encabezados con `children` y un modo de servidor. La búsqueda, el orden y la
paginación se resuelven en Express; no se descargan todas las filas para filtrarlas
en el navegador. Los slots mantienen botones y celdas como componentes Vue.

La [publicación de DataTables 3](https://datatables.net/blog/2026/datatables-3)
confirma que el núcleo ya no tiene dependencias. La revisión comprobó
`datatables.net-vue3` 3.0.8 y `datatables.net` 3.1.4; no se extrapola la dependencia
de jQuery de las versiones antiguas a la versión actual.

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
| `InventoryReportToolbar.vue` | Presenta alcance, descarga y reintento del reporte; no realiza solicitudes. |
| `modules/warehouse/composables/useInventory.ts` | Coordina permisos visuales, apertura/cierre del editor y confirmación de operaciones. |
| `useInventoryList.ts` | Lista, filtros, orden, paginación, actualización y cancelación de consultas. |
| `useInventoryReport.ts` | Descarga y ciclo de vida del reporte, con error independiente. |
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
