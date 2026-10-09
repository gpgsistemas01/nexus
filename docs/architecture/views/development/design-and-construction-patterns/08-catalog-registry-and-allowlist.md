# 8. Registro de catálogos con lista blanca

Los catálogos auxiliares administrables aplican un **registro de configuración con lista blanca** acotado:
`catalogService` relaciona cada nombre público con su modelo Prisma, sus campos y sus
etiquetas. Controller, rutas y plantilla se comparten, mientras cada catálogo conserva
una URL y una entrada de navegación propias. En frontend, la página sólo compone el
flujo; formulario, modal, aplicación, transporte y DataTable mantienen la misma
separación utilizada por los demás CRUD. Así se evita duplicar seis implementaciones
sin permitir que el cliente seleccione modelos o campos arbitrarios. Las lecturas
operativas de cada dominio permanecen separadas para alimentar sus selectores.

La lista blanca es una frontera de seguridad. La página y el API administrativo
comprueban `catalogs:manage`; ocultar el enlace sólo mejora la navegación y nunca
reemplaza la autorización del servidor.

El flujo común no termina en los parciales visuales. En frontend, el listado se adapta
con `createCrudApplication.getAll`, se entrega a `createDataTable` mediante su opción
`ajax` y las altas o ediciones usan `handleSubmit`, que cierra el modal, presenta el
mensaje y recarga la DataTable conservando o reiniciando la página según el modo. Así,
Catálogos comparte el mismo ciclo observable que Clientes y Proveedores sin duplicar el
manejo de carga, error o refresco. En backend, el router aplica autenticación y
`catalogs:manage` antes del controller; el controller conserva el contrato DataTables y
delega normalización, lista blanca, validación y persistencia al servicio. El registro
**de configuración con lista blanca** es la única variación deliberada frente a un servicio por recurso.
Las columnas se entregan directamente a `createDataTable` y se componen desde los
campos del catálogo activo; no se mantienen seis arreglos equivalentes. La acción
reutiliza `buildMdbEditActionButton` con la etiqueta **Editar registro**, sin agregar `catalog` a
los contextos de negocio de `renderActionButtons`.
Las reglas visibles se crean mediante `createCatalogValidation` en la capa compartida
`utils/validations`, igual que los demás formularios; `catalogForm` sólo aporta etiqueta
y límites del recurso actual.

El campo **Activo** forma parte del contrato común de los seis catálogos administrables.
El registro lo declara entre sus campos permitidos, el backend valida que sea booleano,
la pantalla lo presenta en formulario y listado, y Prisma lo conserva con valor inicial
activo. Las lecturas operativas sólo ofrecen registros activos; el listado administrativo
incluye ambos estados para permitir su reactivación.

El parámetro `catalog` se valida en la frontera HTTP contra `MANAGED_CATALOG_NAMES` y
el servicio vuelve a resolverlo desde `MANAGED_CATALOGS`; así no se puede seleccionar
un modelo arbitrario aunque el servicio se invoque fuera de la ruta. Como en los demás
módulos que reciben `id` en la URL, el servicio resuelve la existencia de la entidad y
traduce tanto el `P2025` como el `P2023` de Prisma a una entrada no encontrada que
incluye la etiqueta del catálogo. El validator HTTP se reserva para el contrato del body
y para `catalog`, que selecciona una configuración permitida y requiere rechazo antes del controller.

El registro contiene exactamente estos catálogos; ningún otro módulo forma parte de este
flujo compartido:

| Catálogo visible | Identificador de URL y API | Modelo Prisma | Campos administrables |
| --- | --- | --- | --- |
| Áreas | `departments` | `Department` | `name` (máximo 50), `isActive` booleano |
| Roles | `roles` | `Role` | `name` (máximo 50), `isActive` booleano |
| Presentaciones | `presentations` | `Presentation` | `name` (máximo 50), `isActive` booleano |
| Unidades de medida | `unit-measures` | `UnitMeasure` | `name` (máximo 20), `symbol` (máximo 10), `isActive` booleano |
| Motivos de ajuste | `reasons` | `StockAdjustmentReason` | `name` (máximo 100), `isActive` booleano |
| Estados de cumplimiento | `fulfillment-statuses` | `FulfillmentStatus` | `name` (máximo 50), `isActive` booleano |

**Clientes** y **Proveedores** no pertenecen a este registro: conservan sus módulos,
rutas, permisos, formularios y reglas de negocio propios.

En términos de negocio, clientes y proveedores **sí son catálogos comerciales** porque
son datos maestros reutilizados por salidas y compras. La distinción anterior es de
implementación: no son catálogos auxiliares ni deben agregarse al registro compartido.
Ambos conservan su indicador Activo en base de datos, backend, formulario y listado; sus
selectores operativos excluyen inactivos, mientras sus pantallas propietarias los mantienen
visibles para consulta y reactivación.

### Diagrama del patrón de catálogos administrables

**Diagrama:** `DIA-ARQ-CAT-001`. El diagrama muestra la variante permitida por la lista blanca
y sus módulos consumidores. Las flechas representan imports/uso de configuración,
no un recorrido HTTP. Fuente: routers, controllers, catalogService y constants/catalogs.

```mermaid
flowchart TB
    route["routes/api/admin/catalogApiRoute.js"] --> controller["controllers/api/admin/catalogController.js"]
    route --> validation["validators/forms/catalogValidations.js"]
    controller --> service["services/admin/catalogService.js"]
    service --> registry["constants/catalogs.js<br/>MANAGED_CATALOGS"]
    service --> db["repository/baseRepository.js<br/>getDb()[model]"]
    web["controllers/web/admin/catalogController.js"] --> service
```

El registro se reutiliza para Áreas, Roles, Presentaciones, Unidades de medida,
Motivos de ajuste y Estados de cumplimiento. Clientes y proveedores reutilizan otros
mecanismos CRUD, pero no consumen este registro de modelos permitidos.

### Diagrama del ciclo CRUD compartido

**Diagrama:** `DIA-ARQ-CAT-002`. **Pregunta:** ¿qué configuración permite reutilizar
el mismo CRUD sin aceptar modelos o campos arbitrarios? **Alcance:** dependencias de
construcción; las flechas apuntan desde el consumidor a la configuración o pieza común.

```mermaid
flowchart TB
    service["catalogService.js<br/>getCatalog + normalización + validación"] --> registry["constants/catalogs.js<br/>MANAGED_CATALOGS<br/>modelo · campos · longitudes · etiquetas"]
    validation["catalogValidations.js<br/>catalog permitido + contrato del body"] --> names["MANAGED_CATALOG_NAMES"]
    page["catalogsPage + form + modal + DataTable<br/>recurso activo y campos"] --> application["application/admin/catalogs/catalogs.js<br/>requests configurados"]
    application --> crud["createCrudApplication<br/>lectura y mutaciones comunes"]
    page --> shared["useForm · handleSubmit · createDataTable<br/>carga · errores · refresco"]
```

El registro limita modelo y campos del servidor; el configurador del navegador fija
URLs, claves y argumentos del catálogo activo. La escritura exige `catalogs:manage`.
`isActive` es un campo de creación/edición, no una operación DELETE. Las lecturas
operativas conservan módulos propios y filtran opciones activas. Los pasos del actor y
sus excepciones se consultan en los casos de uso de catálogos; esta figura muestra
cómo se comparte su realización técnica.

### Comportamiento del CRUD compartido

Los mapas anteriores representan código y configuración. Los pasos de consulta, alta,
edición y desactivación están en las secuencias canónicas de los
[catálogos backend](../../processes/backend-code-sequences/catalogs/index.md) y
[frontend](../../processes/frontend-code-sequences/catalogs/index.md). No se conserva
otra secuencia general que repita esos recorridos.
