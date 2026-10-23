# Arquitectura del frontend Vue

## Alcance

Esta decisión aplica a `front/`, con Vue 3, TypeScript, componentes `.vue` y
Composition API. El módulo `auth` incorpora el login operativo
con Vuetify, VeeValidate y la API de Express. `warehouse` incorpora Materiales,
Consumibles y Mermas como rutas Vue protegidas. Consulta [el contrato del login](login.md)
y [los flujos de Almacén](warehouse.md). Personas/Usuarios y Clientes/Proveedores
se describen en [Identidad y Directorio comercial](identity-and-directory.md).
`movements` incorpora los tres historiales de sólo lectura con filtros y reportes;
consulta [su contrato y responsabilidades](movements.md).

## Contenedores y presentación

Los contenedores en `pages/` componen la pantalla, coordinan operaciones y conectan
estado y eventos. Los componentes en `components/` reciben datos mediante props y
emiten intenciones mediante eventos. Pueden tener estado visual local; no consultan
la API ni conocen la autenticación o la persistencia.

Las props no se mutan. El propietario del estado realiza los cambios. Los eventos
usan acciones concretas, como `submit`, `close` o `action`. No se agrega un contenedor
para cada botón: la frontera debe permitir reutilizar, entender o probar una parte.

El login operativo aplica estas fronteras: LoginPage compone LoginForm y conecta
sus eventos con useLoginForm. Almacén las aplica en sus contenedores, tabla y
editor, descritos más adelante. Cada llamada a sus composables crea estado propio;
la sesión es el único contrato compartido por aplicación.

## Navegación

`main.ts` instala Vue Router 5 mediante `createAppRouter`. El router de
`src/app/router/index.ts` usa historial HTML5 con la base de Vite. Su fábrica permite
inyectar historial en memoria para comprobar navegación sin navegador.
`/` redirige a `/inicio-sesion` (LoginPage). `/almacen` selecciona el primer módulo
autorizado y sus rutas hijas abren Materiales, Consumibles y Mermas. El catch-all
carga NotFoundPage. Las páginas usan imports dinámicos para carga diferida:
las rutas eligen contenedores y éstos componen presentación y composables.

Los enlaces internos usan RouterLink. Nginx y `front/vercel.json` configuran el
fallback a index.html; para Render Static Site se documenta el rewrite equivalente
en el README. `main.ts` carga e instala el proveedor único de
`app/plugins/vuetify.ts` antes de registrar el router. La carga diferida del
proveedor está dentro del arranque recuperable. Los temas `nexus` y `warehouse`
pertenecen a login y Almacén, respectivamente.
La guarda de las rutas protegidas consulta `/api/auth/me` y comprueba el permiso público de
la ruta; un `401` tras renovar sesión devuelve al login, un rechazo de permiso a
`/sin-permiso` y un fallo de conexión a `/sesion-no-disponible`, con reintento.
Ambas pantallas conservan la ruta original en `returnTo`. AccessErrorPage coordina
el reintento con estado pendiente y resultado visible; la guarda vuelve a comprobar
sesión y permisos. `app/router/protectedDestination` comparte con LoginPage el
retorno a rutas protegidas registradas y descarta destinos externos o de error.
Las guardas sólo orientan la navegación; Express autoriza cada solicitud.
La configuración del menú vive en `app/navigation.ts`; sólo contiene rutas Vue de
Almacén, Compras, Movimientos, Identidad, Directorio comercial y Catálogos, agrupadas por `VListGroup` con iconos SVG del proveedor existente.
En escritorio se reserva una barra de iconos: al pulsar Almacén o el botón de
menú se expande el drawer con el acordeón y un fondo modal. Clic fuera, Escape o navegar
lo cierran y dejan la barra compacta. En móvil sólo se muestra el drawer temporal.
El grupo conserva estado visual local y sólo recibe enlaces autorizados.
El proxy conserva la API y la acción de cierre de sesión. Consulta
[las decisiones de UI, HTTP y pruebas](ui-and-http.md).
Si falla la carga inicial, StartupErrorPage permite reintentar; no se deja un rechazo
de bootstrap sin manejar. El transporte y los errores HTTP se centralizan en `shared/http`;
cada módulo adapta el resultado a su flujo.

## Organización por módulos

`modules/<dominio>/` agrupa páginas, componentes y lógica de la misma capacidad.
Al migrar operaciones se conservan los dominios actuales: autenticación, administración,
ventas y almacén, con materiales, compras y salidas dentro de almacén. El módulo `catalogs` incorpora
los seis catálogos administrables de EJS; su [contrato y responsabilidades](catalogs.md)
se mantienen por separado de inventario.
`pages/`, `components/` y `composables/` existen cuando hay implementación concreta;
no se crean árboles vacíos. Una pieza usada sólo en un módulo permanece en él.

`shared/http/apiClient.ts` se comparte entre login, consulta de sesión y los módulos protegidos:
centraliza Axios y renueva una vez las consultas que responden `401`; `apiError.ts`
traduce sus errores. No importa
módulos de negocio. Un módulo no importa páginas o estado
privado de otro; la composición entre ellos pertenece a una pantalla contenedora o
un contrato explícito.

## Patrones combinados y límites

| Patrón o mecanismo | Decisión |
| --- | --- |
| Contenedor/presentación | Las páginas de cada módulo coordinan; los formularios, tablas, filtros y AppNavigation reciben props y emiten eventos. |
| Composición mediante composables | useInventory coordina permisos/editor; useInventoryList, useInventoryReport, useInventoryEditor, useInventoryRemoval y useRemoteOptions mantienen listado, reporte, captura y catálogos por instancia. |
| Organización por módulos | auth, warehouse, movements, catalogs, identity y directory agrupan sus responsabilidades. Los recursos equivalentes comparten flujos parametrizados; Mermas y las asignaciones de Personas conservan captura y recuperación propias. |
| Servicios y adaptadores HTTP | authService conserva el login público sin refresh. Los servicios de los módulos protegidos usan Axios compartido; sus adaptadores comprueban DTOs y conservan identificadores/versiones. |
| Estado compartido | createAuthSession crea una sesión por aplicación; main la proporciona por provide/inject y la guarda usa esa misma instancia. Su usuario es readonly. No se agrega Pinia para este único contrato ni un store por formulario. |
| Slots | InventoryTable usa slots de VDataTableServer; RemoteSelect usa append-item y v-intersect para cargar opciones al desplazarse. |

No se impone Atomic Design, una arquitectura hexagonal completa ni un bus global
de eventos. Agregar carpetas y capas no sustituye responsabilidades claras.

La [guía de patrones y SOLID](patterns.md) documenta los consumidores reales,
el diagrama de dependencias y los límites de cada principio. El tratamiento de
capturas, mensajes y datos recibidos pertenece a [entradas y salida segura](input-security.md).

## Adaptación del frontend EJS

LoginPage conserva fondo, tarjeta y disposición del login EJS. LoginForm presenta
controles Vuetify mediante props/eventos; useLoginForm conecta las reglas públicas
a VeeValidate y controla estado, errores y envío. “Recordar usuario” nunca persiste
contraseñas y no cambia la duración de las cookies. No se agrega Pinia para este
formulario local. Después del acceso, Vue Router abre `/almacen` o una ruta interna registrada que requiere sesión; la
guarda selecciona el primer módulo autorizado, incluidos Catálogos para una cuenta
con acceso exclusivo a su administración.

Almacén sigue esta composición:

```text
app/layouts/AppLayout (sesión, navegación y RouterView)
  → app/components/AppNavigation (props y enlaces Vue)
  → InventoryPage (resource: materials | consumables | wastes)
      → useInventory → useInventoryList / useInventoryReport
          → services de inventario / catálogos / reportes → Axios compartido
      → InventoryFilters → VExpansionPanels (props y eventos)
      → InventoryTable → VDataTableServer / InventoryRowActions (props y eventos)
      → useInventoryRemoval → shared/ui/feedback → SweetAlert2
      → InventoryReportToolbar (alcance, descarga y reintento mediante eventos)
      → InventoryEditorPage → useInventoryEditor → VeeValidate
          → InventoryEditor → shared/EditorDialog → InventoryFormField → RemoteSelect (presentación)
          → useRemoteOptions (catálogos, búsqueda, paginación y cancelación)
```

`inventory.ts` contiene los contratos y la configuración de los tres recursos;
`formFields.ts` describe las secciones y campos editables/de consulta de cada modo. `formModel.ts` conecta
reglas públicas y construye payloads por operación, sin copiar validadores.
No se incorpora un generador universal de formularios. Las tres rutas crean estado
independiente y desmontan consultas, temporizadores y capturas al cambiar de módulo.

Las reglas del login se mantienen en `back/src/public/js/utils/validations/loginValidation.js`,
importadas directamente por el formulario EJS. Vite y TypeScript las resuelven mediante
alias junto con los mensajes públicos. Esto exige conservar las fuentes compartidas
al compilar y usar la raíz como contexto del Dockerfile frontend. La imagen final
contiene sólo assets y Nginx. El backend continúa construyéndose por separado.

- `back/src/views/pages` se transforma en páginas y composición Vue; los parciales
  reutilizables de `views/shared` orientan los componentes visuales.
- `public/js/pages`, formularios y modales se adaptan al estado reactivo y al ciclo
  de vida de Vue. No se copia el control manual del mismo DOM junto al renderizado Vue.
- `public/js/application` puede conservar adaptadores puros y coordinación independientes
  del DOM. Los servicios HTTP requieren importar sus dependencias y configurar el origen
  de la API, incluyendo la renovación de sesión.
- `public/js/ui/forms/formUI.js` usa eventos, selectores y plugins: su `useForm` no
  es un composable Vue y necesita adaptación, no sólo un cambio de carpeta.
- Las dependencias de DataTables y Select2 se sustituyen o encapsulan controlando montaje,
  actualización y limpieza. Un plugin y Vue no deben administrar simultáneamente el mismo DOM.
- Se conservan los contratos de errores, expectedVersion y operationId cuando correspondan.
  El backend valida permisos, reglas y valores derivados aunque la interfaz los anticipe.
- Las reglas públicas de `back/src/shared` deben conservar un propietario único; no se
  duplican como otra copia en `front/src/shared`. Un paquete común requerirá ajustar
  dependencias y contextos de construcción. No se publica código privado del backend.

El tema y los defaults se centralizan en `app/plugins/vuetify.ts` y `shared/ui/controlDefaults.ts`.
La [guía de interfaz](ui-and-http.md#estilos-y-controles-adaptados-a-vue) documenta
la adaptación visual de MDB, los campos recuperados y SweetAlert2.

## Reutilización entre módulos

`shared/components/EditorDialog` proporciona el marco de los formularios de
los módulos, con slots para captura y acciones específicas.
`shared/components/TableFrame` concentra borde, encabezados, subencabezados,
franjas, foco/hover y pie de tabla. `ServerTable` lo compone con la paginación de
Vuetify; la tabla local de responsabilidades de Personas también usa ese marco.
Las tablas de cada módulo definen sus columnas y celdas. `TableAction` comparte
botones con icono, nombre accesible, tooltip y estado deshabilitado; `StateBadge`
presenta Activo con el mismo Sí/No y tratamiento visual.
`useTableQuery` traduce orden y paginación con el mapa de índices permitido por
cada dominio, incluido el orden descendente inicial del historial.
`identity` y `directory` mantienen sus formularios y contratos descritos en
[Identidad y Directorio](identity-and-directory.md). Los selectores (`RemoteSelect`,
`useRemoteLookup`, `useSelectedOption`) y tipos de opciones pertenecen a `shared`.
`useRemoteOptions` aporta la estrategia y dependencia de proveedor de inventario.
`useRemoteLookup.state` publica el `LookupState` reactivo de presentación, sin que
los consumidores repitan la conversión de refs; Organización, Inventario y
Movimientos lo reutilizan.
`requestExcel` y `useFileExport` comparten las descargas con Almacén.

Todos los módulos de listado usan `RecordListPanel` para la cabecera, tarjeta,
contador, error y reintento; botones, mensajes, filtros y tablas entran por slots.
Catálogos, Identidad y Directorio componen su búsqueda sobre `ListFilters`; Almacén
y Movimientos aportan sus filtros propios sobre ese mismo acordeón y ocultan el
buscador interno del panel. Los títulos conservan su texto y reciben la misma
presentación que el encabezado original de EJS. El contador se omite si no hay
permiso para consultar el listado.
`RecordEditorDialog` comparte los errores, el marco de campos y la recuperación
de conflictos sobre `EditorDialog`, conservando la nota y el texto de recarga de
cada formulario. Las columnas, controles y payloads siguen en su dominio.

`shared/http/pageRequest` comprueba el contrato paginado consumido por los módulos.
`shared/composables/usePagedList` concentra el estado y ciclo de vida del listado:
consulta, paginación, cancelación, descarte de respuestas antiguas y conservación
de filas sin cambios. Recibe la consulta del servicio como estrategia mediante un
callback tipado; no conoce endpoints, sesión ni permisos concretos.
`useInventoryList` aporta filtros, permiso de lectura y recarga automática;
`useCatalogList` aporta el recurso administrativo y el tratamiento de acceso denegado.
Si una página queda fuera del rango, el núcleo vuelve directamente a la última
página disponible, sin recorrer todas las páginas vacías intermedias.

`useListSearch` coordina búsqueda, actualización y limpieza en los módulos:
una búsqueda nueva vuelve a la primera página; repetir la consulta aplicada en
esa página actualiza una sola vez. Identidad aporta sus filtros mediante un
callback. `clearSearch` reinicia texto y página, acepta el reinicio de filtros del módulo y
conserva tamaño y orden. Cada página sigue limpiando sus selectores y borradores.
`useListEditor` comparte apertura condicionada por permisos, cierre, recarga y aviso
de guardado en Catálogos, Identidad y Directorio. Recibe la política de apertura y
la función de recarga; no conoce recursos ni endpoints y mantiene estado por instancia.
Almacén conserva su coordinador porque también pausa la recarga automática y
orquesta eliminaciones e ingresos de stock.

`app/composables/usePageAccess` adapta la sesión a los permisos de las páginas y
centraliza la navegación por errores 401/403. Conserva el destino completo al
volver al login. Vive en `app`, porque conoce sesión y router; los composables
compartidos de listado y los componentes visuales permanecen independientes de ellos.

`shared/composables/useFormInteraction` comparte la interacción con VeeValidate
en login y los formularios de los módulos: sólo la captura del usuario marca un campo como
editado; perder el foco sin capturar no muestra errores y el envío valida todo el
formulario. Cada consumidor decide cuándo bloquear cambios y conserva sus reglas,
payloads y operaciones. `shared/components/FilterActions` comparte los botones
Actualizar/Limpiar/Buscar mediante props y eventos, dentro del formulario propietario.
Catálogos reutiliza `useRecordSave` con Identidad y Directorio para bloqueo de envíos,
cancelación al desmontar, errores y conflictos. `useCatalogEditor` conserva su esquema
VeeValidate, campos y payload con la versión leída; no duplica ese ciclo de transporte.

Se aplica composición y estrategia por callbacks a comportamientos equivalentes.
No se introduce herencia entre módulos ni un generador de CRUD con reglas mezcladas.
Se conservan separados los composables de captura y listado cuando cambian sus
reglas, permisos y recuperación. Consulta [Catálogos](catalogs.md).

## Convenciones y validación

Componentes `.vue` en PascalCase, composables `useNombre.ts` y funciones con exports
nombrados. Imports relativos de módulos con `.js` (resuelto al fuente `.ts` por TypeScript/Vite);
componentes con `.vue`. Se usa `<script setup lang="ts">` y props/eventos tipados. El formato y los nombres se rigen por el
[estándar de codificación](../../back/docs/architecture/coding-standards/index.md),
incluida su sección de Vue/TypeScript; no se define un estándar paralelo aquí.
Los componentes de presentación no importan clientes HTTP ni almacenes de sesión.
Las suscripciones, temporizadores y plugins se liberan al desmontar cuando corresponda.

Cada migración debe comprobar el flujo visible, carga/error/vacío y permisos, y mantener
la validación del servidor. Vitest cubre funciones y composables; pruebas de componentes
observan props, eventos y comportamiento; una prueba de navegador valida recorridos
representativos. Vitest y Vue Test Utils ejecutan los casos de navegación y estado visible en
`front/tests/`, con jsdom y limpieza al terminar cada prueba. No constituyen una
prueba de navegador real. Los comandos y la selección de herramientas se mantienen
en [la guía de herramientas](tooling.md). CI ejecuta ESLint, pruebas y compilación con tipos.

## Referencias

- [Composables de Vue](https://vuejs.org/guide/reusability/composables.html).
- [Props](https://vuejs.org/guide/components/props.html) y [eventos de componentes](https://vuejs.org/guide/components/events.html).
- [Gestión de estado](https://vuejs.org/guide/scaling-up/state-management.html).
- ISO/IEC 25010:2023 sirve para acordar criterios de calidad; ISO/IEC/IEEE 42010:2022,
  para describir decisiones y dependencias. Ninguna exige estas carpetas ni convierte
  su adopción en conformidad automática.

## Consultas de historial

Movimientos compone los flujos compartidos de listado, búsqueda, opciones y descarga.
`ListFilters` ofrece el acordeón y las acciones tanto a inventario como a historial;
cada adaptador conserva sus campos y reglas. `useVisibleRefresh` comparte el ciclo
de actualización visible de 30 segundos sin trasladar listeners a la presentación.
Los contratos específicos y límites están en [Movimientos](movements.md).


## Crecimiento y mantenimiento

La revisión del frontend conserva módulos por capacidad, páginas diferidas por
Vue Router, TypeScript estricto y estado local por instancia. Los componentes
visuales comparten marcos y controles; los servicios adaptan contratos de Express.
La sesión compartida y Axios concentran autenticación, renovación y errores.
Los listados se consultan y ordenan en el servidor; el navegador presenta páginas
de 10, 20 o 50 registros. Los selectores solicitan opciones en páginas de 20,
con búsqueda diferida y cancelación al cambiar de contexto o desmontar.

Se corrigen dos riesgos del núcleo de consulta:

- `useRemoteLookup` usa un `Set` para eliminar IDs repetidos dentro y entre páginas.
  Cada carga compara los IDs existentes y recibidos una vez, en lugar de buscar
  cada opción nueva dentro del conjunto acumulado. El avance cuenta las filas
  recibidas del servidor; no depende del número de opciones únicas. Una página
  vacía termina la carga aunque el conteo sea antiguo, evitando solicitudes sin
  fin al cambiar el catálogo durante la consulta.
- El cambio de búsqueda reinicia opciones, errores y página de reintento. Reintentar
  cancela el debounce pendiente; desmontar bloquea también callbacks conservados
  por el consumidor. `requestPage` rechaza conteos negativos, fraccionarios o fuera
  del rango entero seguro antes de usarlos en la paginación.

ESLint comprueba imports estáticos de estas fronteras además de los controles de
presentación existentes: `shared` no importa `app` ni módulos de negocio; servicios
y mappers no importan Vue, Router, Vuetify, páginas, componentes, composables ni
el estado de sesión. Los contratos públicos `@nexus/*` y la inyección de callbacks
conservan la dirección de dependencias. Estas reglas forman parte del lint que CI
ya ejecuta; no sustituyen revisar ciclos ni la responsabilidad de un contrato nuevo.

Para agregar otra capacidad, se conserva el listado/consulta en el módulo y se
componen los contratos de `shared`; se extrae una pieza cuando tiene consumidores
con la misma responsabilidad. Las reglas, payloads y permisos específicos siguen
en su dominio. La recuperación de merma continúa separada del guardado genérico
porque conserva `operationId` y captura pendiente.

El router central y `useInventoryEditor` todavía tienen responsabilidades acotadas.
Separar registros de rutas por dominio o extraer otra estrategia del editor debe
responder a nuevas responsabilidades o cambios independientes, con los recorridos
actuales como protección; su tamaño por sí solo no justifica más capas.

La evidencia se detalla en [herramientas y pruebas](tooling.md). Esta revisión evalúa
estructura, contratos y recursos del cliente; no estima usuarios concurrentes ni
capacidad de Express/PostgreSQL. Para esa estimación se requieren cargas y medidas
de latencia, consultas, tamaño de reportes y consumo del entorno de despliegue.

## Documentos de compra

[Compras](purchases.md) comparte listado, interacción de formulario, selectores,
marcos de tabla/modal y reportes con los módulos existentes. Sus partidas y
transiciones conservan un coordinador propio. `app/pages/PurchaseWorkspace`
compone las altas rápidas de proveedores y artículos mediante callbacks;
Compras no importa las páginas privadas de esos módulos. La vista previa usa
únicamente las reglas públicas; Express conserva stock y totales definitivos.
