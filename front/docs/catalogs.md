# Catálogos en Vue

## Alcance y acceso

La sección «Catálogos» del menú Vue agrupa las mismas seis páginas administrables
que EJS. Se conserva el menú compacto, la apertura por clic, el cierre al pulsar
fuera y la navegación móvil. Cada enlace y ruta requiere `catalogs:manage`;
Express verifica ese permiso en todas las lecturas y escrituras administrativas.
Una cuenta con acceso exclusivo a catálogos llega a Áreas después del login.
Los iconos oficiales de MDI se importan por nombre en `app/icons.ts`; la fuente es
[Pictogrammers](https://pictogrammers.com/library/mdi/). Al actualizar la copia local,
ejecuta `npm --prefix front ci --include=dev` para instalar `@mdi/js` antes de reiniciar Vite.

| Ruta Vue | Campos | Longitud máxima del nombre |
| --- | --- | --- |
| `/catalogos/departments` | Nombre, Activo | 50 |
| `/catalogos/roles` | Nombre, Activo | 50 |
| `/catalogos/presentations` | Nombre, Activo | 50 |
| `/catalogos/unit-measures` | Nombre, Símbolo, Activo | 20; símbolo: 10 |
| `/catalogos/reasons` | Nombre, Activo | 100 |
| `/catalogos/fulfillment-statuses` | Nombre, Activo | 50 |

Cada página permite buscar por nombre, paginar, crear, editar y activar/desactivar.
La baja lógica se expresa con Activo para conservar el historial. El listado muestra
ambos estados. El orden por nombre lo establece la API; la tabla no ofrece órdenes
que el endpoint no implementa. `/catalogos` selecciona Áreas y una ruta desconocida
muestra la página no encontrada sin consultar un recurso arbitrario.

Se ejecuta con los comandos de [Almacén](warehouse.md#acceso-y-alcance): Express
sirve la API y Vite las vistas Vue. El proxy sólo deriva `/api` y cierre de sesión;
no se navega hacia vistas EJS desde estos enlaces.

## Contratos y validación

`back/src/shared/constants/catalogs.js` concentra únicamente etiquetas, campos y
longitudes públicas, antes visibles en el contexto del formulario EJS. Express
combina ese contrato con los modelos y claves internas de `back/src/constants/catalogs.js`.
Vue importa la parte pública mediante `@nexus/catalogs`, sin acceder a Prisma ni
importar el registro privado del servidor. El Dockerfile frontend copia ese archivo
público junto con las reglas ya compartidas.

`createCatalogValidation` sigue siendo la función propietaria en los validadores
públicos existentes. El alias `@nexus/form-validation` la conecta con VeeValidate.
Todos los campos se registran; abrir el modal, cargar datos o mover foco sin capturar
no muestra errores. La salida de un campo modificado valida ese campo y enviar
valida el formulario completo. Express conserva su validación definitiva.

| Operación | Contrato |
| --- | --- |
| Consulta | `GET /api/admin/catalogs/:catalog`, con `start`, `length` y `search`. |
| Alta | `POST /api/admin/catalogs/:catalog`, nombre y estado; símbolo sólo en unidades. |
| Edición | `PUT /api/admin/catalogs/:catalog/:id`, mismos campos y `expectedVersion` de la lectura. |

La captura no muestra ni envía claves estables de áreas/roles. Cambiar el nombre
visible no cambia la identidad ni los permisos. Se comprueba la forma del listado,
la versión y el código de éxito antes de confirmar una escritura. Las cookies,
renovación de sesión y errores pasan por Axios compartido.

Un conflicto conserva la captura y ofrece «Cerrar y actualizar catálogo». Para
volver a guardar se abre una edición con la versión recién leída; no se sustituye
silenciosamente la versión de una captura antigua. Los fallos de red permiten un
reintento explícito; no se reenvían escrituras automáticamente por esos fallos.
Desmontar cancela solicitudes y descarta confirmaciones tardías. Un 401 lleva al
login conservando la ruta interna; un 403 abre la página de acceso no permitido.

## Reutilización y responsabilidades

| Propietario | Responsabilidad |
| --- | --- |
| `CatalogPage` / `CatalogEditorPage` | Contenedores: componen presentación, sesión, estado y operaciones. |
| `CatalogTable` / `CatalogForm` | Presentación tipada: props y eventos; columnas y controles del catálogo. |
| `useCatalogList` | Configura la consulta y los errores de acceso del catálogo sobre `shared/composables/usePagedList`. |
| `useCatalogEditor` | VeeValidate, captura y envío versionado. |
| `catalogService` / `catalog.ts` | Adaptación de API, lista de campos del payload y contrato tipado. |
| `shared/components/EditorDialog` | Marco modal, foco/scroll de Vuetify, formulario, pie y acciones mediante slots. También lo usa InventoryEditor. |
| `shared/components/ServerTable` | Tabla paginada de Vuetify, traducciones y estilos. Cada módulo conserva columnas, celdas y eventos mediante slots. |
| `shared/http/pageRequest` | Lectura y comprobación del contrato paginado para Catálogos e inventario. |
| `shared/composables/usePagedList` | Estado de consulta, paginación, cancelación y descarte de respuestas anteriores. |
| `shared/composables/useFormInteraction` | Captura y validación al perder el foco, compartidas con login e inventario. |
| `shared/components/FilterActions` | Acciones de filtro con props/eventos; el contenedor procesa la consulta. |
| `shared/ui/controlDefaults` / `feedback` | Tema de controles y avisos de éxito mediante SweetAlert2. |

Se refactorizan las piezas con consumidores reales. Pesos, motivos, recuperación
de mermas y permisos por operación permanecen en Almacén; los catálogos tienen un
formulario pequeño explícito. No se fuerza InventoryFormField ni sus campos de
dominio como generador universal. No se agrega un store para estado local.

Las pruebas y sus condiciones observables se mantienen en [tooling.md](tooling.md#pruebas-de-catálogos).
