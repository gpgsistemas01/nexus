# Arquitectura del frontend Vue

## Alcance

Esta decisión aplica a `front/`, con Vue 3, TypeScript, componentes `.vue` y
Composition API. El módulo `auth` incorpora el login operativo
con Vuetify, VeeValidate y la API de Express. `warehouse` incorpora Materiales,
Consumibles y Mermas como rutas Vue protegidas. Consulta [el contrato del login](login.md)
y [los flujos de Almacén](warehouse.md).

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
Una guarda de `/almacen` consulta `/api/auth/me` y comprueba el permiso público de
la ruta; un `401` tras renovar sesión devuelve al login, un rechazo de permiso a
`/sin-permiso` y un fallo de conexión a `/sesion-no-disponible`, con reintento.
Las guardas sólo orientan la navegación; Express autoriza cada solicitud.
La configuración del menú vive en `app/navigation.ts`; sólo contiene rutas Vue de
Almacén y Catálogos, agrupadas por `VListGroup` con iconos SVG del proveedor existente.
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

`shared/http/apiClient.ts` se comparte entre login, consulta de sesión y Almacén:
centraliza Axios y renueva una vez las consultas que responden `401`; `apiError.ts`
traduce sus errores. No importa
módulos de negocio. Un módulo no importa páginas o estado
privado de otro; la composición entre ellos pertenece a una pantalla contenedora o
un contrato explícito.

## Patrones combinados y límites

| Patrón o mecanismo | Decisión |
| --- | --- |
| Contenedor/presentación | LoginPage y las páginas de Almacén coordinan; LoginForm, InventoryTable, InventoryFilters, InventoryEditor, InventoryFormField y AppNavigation reciben props y emiten eventos. |
| Composición mediante composables | useInventory coordina permisos/editor; useInventoryList, useInventoryReport, useInventoryEditor, useInventoryRemoval y useRemoteOptions mantienen listado, reporte, captura y catálogos por instancia. |
| Organización por módulos | auth y warehouse agrupan sus responsabilidades. Materiales y Consumibles reutilizan el mismo flujo parametrizado por recurso; Mermas añade captura y recuperación propias. |
| Servicios y adaptadores HTTP | authService conserva el login público sin refresh. Los servicios de inventario, catálogos y reportes usan Axios compartido; inventoryMapper adapta DTOs y conserva identificadores/versiones. |
| Estado compartido | createAuthSession crea una sesión por aplicación; main la proporciona por provide/inject y la guarda usa esa misma instancia. Su usuario es readonly. No se agrega Pinia para este único contrato ni un store por formulario. |
| Slots | InventoryTable usa slots de VDataTableServer; RemoteSelect usa append-item y v-intersect para cargar opciones al desplazarse. |

No se impone Atomic Design, una arquitectura hexagonal completa ni un bus global
de eventos. Agregar carpetas y capas no sustituye responsabilidades claras.

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

## Reutilización con Catálogos

`shared/components/EditorDialog` proporciona el marco de los formularios de
inventario y catálogos, con slots para captura y acciones específicas.
`shared/components/ServerTable` agrupa Vuetify, paginación y estilos; InventoryTable
y CatalogTable definen columnas, celdas y acciones de su dominio.
`shared/http/pageRequest` comprueba el contrato paginado consumido por ambos módulos.
`shared/composables/usePagedList` concentra el estado y ciclo de vida del listado:
consulta, paginación, cancelación, descarte de respuestas antiguas y conservación
de filas sin cambios. Recibe la consulta del servicio como estrategia mediante un
callback tipado; no conoce endpoints, sesión ni permisos concretos.
`useInventoryList` aporta filtros, permiso de lectura y recarga automática;
`useCatalogList` aporta el recurso administrativo y el tratamiento de acceso denegado.
Si una página queda fuera del rango, el núcleo vuelve directamente a la última
página disponible, sin recorrer todas las páginas vacías intermedias.

`shared/composables/useFormInteraction` comparte la interacción con VeeValidate
en login, inventario y catálogos: sólo la captura del usuario marca un campo como
editado; perder el foco sin capturar no muestra errores y el envío valida todo el
formulario. Cada consumidor decide cuándo bloquear cambios y conserva sus reglas,
payloads y operaciones. `shared/components/FilterActions` comparte los botones
Actualizar/Limpiar/Buscar mediante props y eventos, dentro del formulario propietario.

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
