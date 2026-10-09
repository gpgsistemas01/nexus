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
y la correspondencia del estado activo a través de las capas, sin confundir clientes o
proveedores con estrategias del registro auxiliar.

```mermaid
flowchart LR
    admin["Administrador<br/>elige un catálogo"] --> page["Página compartida<br/>listado y formulario"]
    page --> api["Ruta y controller<br/>con catalogs:manage"]
    api --> registry{"Registro de lista blanca<br/>campos y modelo"}
    registry --> service["Servicio compartido<br/>normaliza y valida"]
    service --> prisma["Modelo Prisma<br/>isActive"]
    prisma --> page

    operational["Formulario operativo<br/>requiere una opción"] --> read["Lectura propia del dominio<br/>sólo registros activos"]
    read --> prisma

```

El recorrido superior se reutiliza para Áreas, Roles, Presentaciones, Unidades de medida,
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

### Secuencias técnicas del patrón CRUD en frontend y backend

Los diagramas técnicos se dividen por frontera de ejecución. `DIA-ARQ-CAT-003` explica la
reutilización dentro del navegador y termina en la petición HTTP;
`DIA-ARQ-CAT-004` comienza en esa petición y explica la selección segura del catálogo y
su persistencia. Separarlas mantiene legibles los participantes de cada lado sin
presentar frontend y backend como un único componente. Ambas complementan la actividad
funcional `DIA-ARQ-CAT-002` y juntas documentan el mismo patrón, no dos CRUD distintos.

#### Secuencia compartida del frontend

**Diagrama:** `DIA-ARQ-CAT-003`. La página compone una sola DataTable, formulario y
modal. `createCrudApplication` adapta las mismas operaciones de consulta, alta y edición,
y el servicio HTTP sólo sustituye método, URL y payload según la acción elegida.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrador
    participant Page@{ "type": "boundary" } as src/public/js/pages/admin/catalogs/catalogsPage.js
    participant Table@{ "type": "boundary" } as src/public/js/plugins/datatable/admin/catalogs/catalogDatatable.js
    participant Form@{ "type": "boundary" } as src/public/js/pages/admin/catalogs/catalogForm.js<br/>src/public/js/pages/admin/catalogs/catalogModal.js
    participant FrontApp@{ "type": "control" } as src/public/js/application/admin/catalogs/catalogs.js<br/>src/public/js/application/createCrudApplication.js
    participant Http as src/public/js/services/admin/catalogService.js
    participant Api as API administrativa de catálogos

    Admin->>Page: abrir el catálogo seleccionado
    Page->>Table: createCatalogDatatable()
    Table->>FrontApp: getCatalogEntries({ start, length, search, catalog })
    FrontApp->>Http: getCatalogEntriesRequest({ params })
    Http->>Api: GET /api/admin/catalogs/:catalog
    Api-->>Http: data, recordsTotal, recordsFiltered
    Http-->>FrontApp: respuesta del listado
    FrontApp-->>Table: data, recordsTotal, recordsFiltered
    Table-->>Admin: mostrar listado y acciones permitidas

    Admin->>Form: seleccionar Nuevo/Nueva + entidad o Editar registro
    Form->>Admin: mostrar el formulario correspondiente
    Admin->>Form: capturar y seleccionar Guardar o Actualizar
    Form->>Form: validateFields(catalogValidation, formData)
    alt alta
        Form->>FrontApp: registerCatalogEntry({ formData, catalog })
        FrontApp->>Http: createCatalogEntryRequest({ catalog, data })
        Http->>Api: POST /api/admin/catalogs/:catalog
    else edición, incluida activación o desactivación
        Form->>FrontApp: editCatalogEntry({ formData, id, catalog })
        FrontApp->>Http: editCatalogEntryRequest({ catalog, data, id })
        Http->>Api: PUT /api/admin/catalogs/:catalog/:id
    end
    Api-->>Http: registro y código de éxito
    Http-->>FrontApp: respuesta de la mutación
    FrontApp-->>Form: registro y mensaje de éxito
    Form->>Form: cerrar modal, notificar y reloadMainTable()
```

#### Secuencia compartida del backend

**Diagrama:** `DIA-ARQ-CAT-004`. El backend conserva el mismo pipeline de autenticación,
autorización y validación para el recurso solicitado. El controller traduce el contrato
HTTP y el servicio resuelve `catalog` contra `MANAGED_CATALOGS` antes de acceder al modelo
Prisma permitido.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/admin/catalogApiRoute.js
    participant Validation@{ "type": "control" } as src/middleware/authMiddleware.js<br/>src/middleware/validatorMiddleware.js<br/>src/validators/forms/catalogValidations.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/catalogController.js
    participant BackService@{ "type": "control" } as src/services/admin/catalogService.js<br/>src/constants/catalogs.js
    participant Db as Prisma / PostgreSQL

    Client->>Route: GET, POST o PUT /api/admin/catalogs/:catalog
    Route->>Validation: verifyApiTokenRequired, authorizeUserApi(CATALOGS_MANAGE), validate
    alt acceso, catálogo o body inválido
        Validation-->>Client: rechazo sin consultar ni modificar datos
    else petición autorizada y válida
        Validation->>Controller: continuar con params, query y body
        alt consulta GET
            Controller->>BackService: findAllCatalogEntries(catalog, { skip, take, search })
            BackService->>BackService: getCatalog(catalog) resuelve MANAGED_CATALOGS
            BackService->>Db: model.findMany(), model.count()
            Db-->>BackService: registros y totales
            BackService-->>Controller: resultado paginado
            Controller-->>Client: data, recordsTotal, recordsFiltered
        else alta POST
            Controller->>BackService: createCatalogEntry(catalog, body)
            BackService->>BackService: normalizar, validar y resolver MANAGED_CATALOGS
            BackService->>Db: model.create({ data })
            Db-->>BackService: registro creado
            BackService-->>Controller: registro creado
            Controller-->>Client: 201, registro y código de éxito
        else edición PUT
            Controller->>BackService: updateCatalogEntry(catalog, id, body)
            BackService->>BackService: normalizar, validar y resolver MANAGED_CATALOGS
            BackService->>Db: model.update({ where: { id }, data })
            Db-->>BackService: registro actualizado
            BackService-->>Controller: registro actualizado
            Controller-->>Client: 200, registro y código de éxito
        end
    end
```

No se requiere una secuencia separada para cada catálogo ni para cada verbo HTTP: los
fragmentos de cada lado hacen explícitas las únicas bifurcaciones del CRUD vigente. Si se
incorpora una eliminación real o una operación con transacción o efectos adicionales,
esa coordinación sí debe representarse en otro diagrama. Ambos diagramas deben revisarse
cuando cambie la composición compartida, el contrato HTTP, el orden de middleware o la
resolución de `MANAGED_CATALOGS`; `npm run docs:check` comprueba sus rutas y referencias.
