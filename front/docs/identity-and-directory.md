# Identidad y directorio comercial en Vue

## Alcance y navegación

Las cuatro pantallas usan rutas Vue, sesión de Express y permisos por operación.
El menú mantiene el acordeón y la barra de iconos, sin enlaces a pantallas EJS.

| Grupo | Pantalla Vue | Acceso a la página |
| --- | --- | --- |
| Identidad y acceso | `/identidad/personas` | `persons:page-view` |
| Identidad y acceso | `/identidad/usuarios` | `users:manage` |
| Directorio comercial | `/directorio/clientes` | `clients:page-view` |
| Directorio comercial | `/directorio/proveedores` | `suppliers:page-view` |

`/identidad` y `/directorio` seleccionan el primer enlace autorizado del grupo.
Después del login, `/almacen` conserva la entrada compatible y elige el primer
módulo autorizado entre los grupos disponibles. Una cuenta exclusiva de Clientes
o Usuarios llega a su pantalla. Cada pantalla conserva el título «Tabla de…» de EJS.
No se trasladan Compras, Salidas ni Movimientos a Vue con este cambio.

## Datos y operaciones

| Módulo | Captura y consulta | Permisos de operación |
| --- | --- | --- |
| Personas | Nombre completo y responsabilidades por área/rol. Filtros por nombre, área y rol. Una sola responsabilidad por área; requiere al menos una. | `persons:read`, `persons:write`, `person:reports-read`. |
| Usuarios | Usuario, contraseña sólo al crear/cambiarla, y una asignación de área/rol. Muestra la persona vinculada como consulta. | `users:manage`; exportación: `admin:reports-read`. |
| Clientes | Nombre y estado activo. Búsqueda, paginación, alta y edición. | `clients:read`, `clients:create`, `clients:update`, `client:reports-read`. |
| Proveedores | Razón social, nombre comercial y estado activo. Búsqueda por cualquiera de los nombres, paginación, alta y edición. La columna Activo sigue la visibilidad de EJS (`catalogs:manage`). | `suppliers:read`, `suppliers:manage` para alta, `suppliers:update`, `supplier:reports-read`. |

Personas y Usuarios comparten grupo, pero mantienen formularios y contratos distintos.
Una responsabilidad de persona no concede permisos a una cuenta. Editar un usuario
omite `personId` y contraseña, conservando la vinculación existente; cambiar contraseña
sólo envía la clave nueva y la versión original. No se guardan contraseñas en Storage.
La vinculación de cuentas con personas permanece como dato de consulta, como en el
formulario EJS vigente; no se incorpora otro proceso de vinculación.

Los selectores organizacionales usan `/api/admin/departments` y `/api/admin/roles`,
con `departments:read` y `roles:read`. Buscan en servidor, paginan al desplazarse,
permiten reintento y conservan la etiqueta seleccionada aunque cambie la búsqueda.
Una edición de usuario puede mostrar su área/rol original aunque ya no aparezca en
las opciones; cargar el catálogo no reemplaza esa identidad.

## Contratos HTTP

| Operación | Endpoint |
| --- | --- |
| Listar/crear Personas | `GET/POST /api/admin/persons` |
| Editar Persona | `PUT /api/admin/persons/:id` |
| Listar/crear Usuarios | `GET/POST /api/admin/users` |
| Editar Usuario | `PATCH /api/admin/users/:id` |
| Cambiar contraseña | `PATCH /api/admin/users/:id/password` |
| Listar/crear Clientes | `GET/POST /api/sales/clients` |
| Editar Cliente | `PUT /api/sales/clients/:id` |
| Listar/crear Proveedores | `GET/POST /api/warehouse/suppliers` |
| Editar Proveedor | `PUT /api/warehouse/suppliers/:id` |

Las lecturas usan `start`, `length`, `search` y el orden admitido por el recurso.
Personas pide `includeAccesses=true` para conservar todas sus responsabilidades.
Los filtros de área/rol se envían con sus nombres, conforme al contrato actual;
`strictDepartmentFilter=true` se usa al seleccionar un área explícita.
Las escrituras envían únicamente sus campos permitidos y `expectedVersion` de la
lectura original en edición/cambio de contraseña. No existe eliminación en estas API.

Los reportes Excel usan `/api/admin/reports/persons/excel`,
`/api/admin/reports/users/excel`, `/api/sales/reports/clients/excel` y
`/api/warehouse/reports/suppliers/excel`. Se envían búsqueda y orden; Personas
incluye el área. La API de reporte de Personas no aplica filtro de rol: Vue exige
limpiarlo antes de exportar y el servicio también rechaza ese alcance, evitando
presentar un archivo como si respetara un filtro que el servidor ignora.

Proveedores captura razón social, nombre comercial y estado, conforme a `RF-CAT-010`.
Se retiró el teléfono del formulario EJS y de sus instrucciones: no pertenece al
contrato persistente ni es obligatorio para las operaciones actuales. Vue conserva
los mismos campos admitidos. Clientes tampoco añade contactos o facturación que
aún no existen en el contrato.

## Arquitectura y reutilización

- `modules/identity`: `IdentityPage` coordina consulta, permisos, filtros y reportes;
  `PersonEditorPage` y `UserEditorPage` conectan formularios separados con sus composables.
- `modules/directory`: `DirectoryPage` y `useDirectoryEditor` comparten la captura
  comercial parametrizada, con payloads explícitos por recurso.
- `PersonForm`, `UserForm`, `DirectoryForm`, `IdentityTable` y `DirectoryTable`
  presentan props y emiten eventos; no conocen HTTP ni sesión.
- `shared/components/RecordListPanel` compone cabecera, búsqueda y estados;
  las tablas conservan columnas y celdas de su dominio sobre `ServerTable`.
- `RecordEditorDialog` adapta `EditorDialog` a formularios con errores y conflictos.
  `OrganizationFields` compone Área/Rol y delega los selectores a `RemoteSelect`.
- `RemoteSelect`, `useSelectedOption`, tipos de opciones y `useRemoteLookup` viven
  en `shared`, usados por Identidad y Almacén. `useRemoteOptions` conserva como
  estrategia la consulta propia de inventario y su dependencia de proveedor.
- `usePagedList` y `useFormInteraction` conservan consulta y política de validación.
  `useRecordSave` administra sólo el ciclo de envío: bloqueo, cancelación, errores
  y conflicto; también lo usa Catálogos. Cada módulo conserva reglas y construcción del payload.
- `useListSearch` comparte búsqueda/actualización y recibe los filtros de Personas
  mediante un callback. `useListEditor` comparte apertura autorizada, cierre,
  recarga y confirmación de guardado. Cada instancia conserva su propio estado.
- `app/composables/usePageAccess` centraliza la sesión y la navegación por 401/403,
  manteniendo esa política fuera de la presentación y los listados compartidos.
- `requestExcel` y `useFileExport` comparten validación de respuesta, descarga y
  cancelación entre estos módulos y los reportes de Almacén.

Las reglas públicas existentes se importan desde `@nexus/form-validation`, alias
único de `back/src/public/js/utils/validations/validators.js`. Se retiran los alias
redundantes de Almacén/Catálogos. La única edición de ese archivo del backend es
una anotación JSDoc de tipos para las asignaciones; no cambia su comportamiento.
El Dockerfile ya incluye ese propietario público y sus dependencias.

Abrir, cargar opciones o perder foco sin editar no muestra errores. Editar valida
el campo al perder foco y enviar valida todo. Un conflicto conserva captura y bloquea
reenvíos hasta cerrar/recargar; un fallo de red requiere reintento explícito. Desmontar
aborta y descarta respuestas tardías. Un 401 lleva al login conservando destino;
un 403 abre acceso no permitido. Express conserva la autorización y validación definitivas.

Las [pruebas y su diseño](tooling.md#pruebas-de-identidad-y-directorio-comercial)
usan Axios y componentes reales con API simulada; no prueban persistencia ni sustituyen
las integraciones de Express/Prisma.
