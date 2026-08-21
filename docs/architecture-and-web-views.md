# Arquitectura y catálogo visual de vistas web

Este documento es el mapa visual, versionado junto con el código, para comprender el
sistema y localizar sus pantallas. Los diagramas usan **Mermaid**, por lo que GitHub los
renderiza directamente sin guardar imágenes que puedan quedar desactualizadas.

La documentación se divide deliberadamente en dos niveles:

- este documento **curado** explica contexto, decisiones, responsabilidades y flujos;
- el [mapa generado del código](generated/code-map.md) inventaría endpoints y
  dependencias reales entre áreas, y puede verificarse con `npm run docs:check`.

Así, un generador no intenta adivinar el porqué del diseño y los inventarios mecánicos
no dependen de que alguien recuerde actualizar una tabla a mano.

### ¿Qué se actualiza automáticamente?

| Artefacto | Fuente | Actualización |
| --- | --- | --- |
| `docs/generated/code-map.md` | Routers e imports de `src` | Se regenera con `npm run docs:architecture`; CI ejecuta `npm run docs:check` automáticamente y bloquea cambios desactualizados. |
| `docs/generated/database-schema.md` | Modelos y relaciones de `prisma/schema.prisma` | Se regenera con el mismo comando; se valida en cada pull request. |
| `docs/generated/data-dictionary.md` | Campos, claves, tipos y relaciones propietarias de `prisma/schema.prisma` | Se regenera con el mismo comando; complementa el ER sin duplicarlo manualmente. |
| Diagramas de contexto, contenedores, secuencia y navegación de este documento | Decisiones de arquitectura y experiencia de usuario | Son curados: deben actualizarse cuando cambia el diseño y revisarse en el pull request. |
| Catálogo de pantallas | Rutas, permisos, controladores, EJS y comportamiento visible | Es curado porque el código por sí solo no puede inferir correctamente propósito, navegación ni estado funcional. |

La separación es intencional: generar relaciones mecánicas evita trabajo repetitivo,
pero no se presenta como «automática» una explicación que requiere criterio humano. En
los pull requests CI no modifica el branch: exige revisar los artefactos derivados
junto con el código que los produjo. Como red de seguridad, un push a `main` regenera
ambos documentos y crea un commit únicamente si detecta diferencias.

## 1. Arquitectura del sistema

### Contexto

```mermaid
flowchart LR
    user["Personal de almacén,<br/>ventas y administración"]
    browser["Navegador web"]
    nexus["Nexus<br/>plataforma de control operativo"]
    postgres[("PostgreSQL")]

    user --> browser
    browser -->|"HTTPS · HTML / JSON / Socket.IO"| nexus
    nexus -->|"Prisma / SQL"| postgres
```

### Contenedores y capas

```mermaid
flowchart TB
    subgraph client["Navegador"]
        pages["Vistas EJS renderizadas"]
        scripts["JavaScript de páginas, módulos y servicios"]
        pages --> scripts
    end

    subgraph server["Aplicación Node.js / Express"]
        middleware["Middleware<br/>autenticación · autorización · validación"]
        webRoutes["Rutas y controladores web"]
        apiRoutes["Rutas y controladores API REST"]
        services["Servicios de dominio"]
        realtime["Socket.IO"]
        prisma["Prisma Client"]

        middleware --> webRoutes
        middleware --> apiRoutes
        webRoutes --> services
        apiRoutes --> services
        services --> prisma
        services --> realtime
    end

    database[("PostgreSQL")]
    pages <-->|"HTML"| webRoutes
    scripts <-->|"JSON"| apiRoutes
    scripts <-->|"eventos"| realtime
    prisma <-->|"SQL"| database
```

### Recorrido de una interacción

```mermaid
sequenceDiagram
    actor U as Usuario
    participant V as Vista EJS + JS
    participant R as Ruta / middleware
    participant C as Controlador
    participant S as Servicio
    participant P as Prisma / PostgreSQL

    U->>V: abre una pantalla o ejecuta una acción
    V->>R: petición web o API
    R->>R: autentica, autoriza y valida
    R->>C: delega la petición
    C->>S: coordina el caso de uso
    S->>P: consulta o modifica datos
    P-->>S: resultado
    S-->>C: resultado de dominio
    C-->>V: HTML o JSON
    V-->>U: actualiza la interfaz
```

## 2. Mapa visual de navegación

Las líneas continuas representan navegación vigente. Las rutas entre paréntesis son
las URL visibles; el acceso efectivo depende de los permisos calculados para la sesión.

```mermaid
flowchart LR
    root["/ "] -->|"sin sesión"| login["Inicio de sesión<br/>/inicio-sesion"]
    root -->|"con sesión"| materials["Existencias<br/>/almacen/materiales"]
    login -->|"credenciales válidas"| materials

    subgraph warehouse["Almacén"]
        materials
        wastes["Mermas<br/>/almacen/mermas"]
        requisitions["Requisiciones<br/>/requisiciones"]
        purchases["Registro de compras<br/>/compras"]
        goodsIssues["Salidas de almacén<br/>/salidas/materiales"]
        wasteIssues["Salidas de mermas<br/>/salidas/mermas"]
        suppliers["Proveedores<br/>/proveedores"]
    end

    subgraph sales["Ventas"]
        clients["Clientes<br/>/clientes"]
    end

    subgraph admin["Administración"]
        users["Usuarios<br/>/usuarios-sistemas"]
        persons["Personas<br/>/personas"]
        materialMovements["Movimientos de materiales<br/>/movimientos/materiales"]
        wasteMovements["Movimientos de merma<br/>/movimientos/mermas"]
    end

    materials --> wastes
    materials --> requisitions
    requisitions --> purchases
    purchases --> goodsIssues
    goodsIssues --> materialMovements
    wastes --> wasteIssues
    wasteIssues --> wasteMovements
    suppliers --> purchases
    clients --> goodsIssues
    materials --> clients
    materials --> users
    users --> persons
```

## 3. Catálogo de pantallas

| Área | Pantalla y ruta | Propósito visible | Interacciones principales | Implementación EJS |
| --- | --- | --- | --- | --- |
| Acceso | Inicio de sesión (`/inicio-sesion`) | Autenticar una cuenta. | Capturar credenciales e iniciar sesión. | `src/views/pages/home/login/loginPage.ejs` |
| Almacén | Existencias (`/almacen/materiales`) | Consultar materiales y stock. | Filtrar, paginar y abrir el alta/edición de material. | `src/views/pages/warehouse/materials/materialsPage.ejs` |
| Almacén | Mermas (`/almacen/mermas`) | Consultar y administrar existencias de merma. | Filtrar, registrar/editar y ajustar stock. | `src/views/pages/warehouse/wastes/wastesPage.ejs` |
| Almacén | Requisiciones (`/requisiciones`) | Consultar y capturar requisiciones de compra. | Registrar requisición y sus detalles. | `src/views/pages/warehouse/purchaseRequisitions/purchaseRequisitionsPage.ejs` |
| Almacén | Registro de compras (`/compras`) | Consultar y registrar entradas de compra. | Filtrar, registrar compra, materiales/proveedores y corregir detalles. | `src/views/pages/warehouse/goodsReceipts/goodsReceiptsPage.ejs` |
| Almacén | Salidas de almacén (`/salidas/materiales`) | Consultar y registrar entregas de materiales. | Filtrar, registrar salida, seleccionar cliente y devolver detalles. | `src/views/pages/warehouse/goodsIssues/goodsIssuesPage.ejs` |
| Almacén | Salidas de mermas (`/salidas/mermas`) | Presentar el punto de acceso a salidas de merma. | La pantalla actual es informativa; el flujo aún no expone formulario ni tabla. | `src/views/pages/warehouse/wasteIssues/wasteIssuesPage.ejs` |
| Almacén | Proveedores (`/proveedores`) | Consultar y administrar proveedores. | Crear/editar desde modal. | `src/views/pages/warehouse/suppliers/suppliersPage.ejs` |
| Ventas | Clientes (`/clientes`) | Consultar y administrar clientes. | Crear/editar desde modal. | `src/views/pages/sales/clients/clientsPage.ejs` |
| Administración | Usuarios (`/usuarios-sistemas`) | Administrar cuentas y asignaciones. | Crear/editar usuario, roles y departamentos. | `src/views/pages/admin/users/usersPage.ejs` |
| Administración | Personas (`/personas`) | Administrar personas participantes del negocio. | Filtrar y crear/editar datos y asignaciones. | `src/views/pages/admin/persons/personsPage.ejs` |
| Administración | Movimientos de materiales (`/movimientos/materiales`) | Auditar movimientos del inventario de materiales. | Filtrar, consultar y exportar el historial. | `src/views/pages/admin/movements/movementsPage.ejs` |
| Administración | Movimientos de merma (`/movimientos/mermas`) | Auditar movimientos del inventario de merma. | Filtrar, consultar y exportar el historial. | `src/views/pages/admin/movements/movementsPage.ejs` |
| Sistema | No encontrada (`/error/404`) | Recuperar al usuario de una URL inexistente. | Volver al inicio apropiado según la sesión. | `src/views/pages/error/notFound/notFoundPage.ejs` |

### Redirecciones de compatibilidad

```mermaid
flowchart LR
    oldMaterials["/materiales"] -->|"308"| newMaterials["/almacen/materiales"]
    oldWastes["/mermas"] -->|"308"| newWastes["/almacen/mermas"]
    oldGoods["/salidas-materiales"] -->|"308"| newGoods["/salidas/materiales"]
    oldWasteIssues["/salidas-mermas"] -->|"308"| newWasteIssues["/salidas/mermas"]
    oldProfiles["/perfiles"] -->|"308"| newPersons["/personas"]
```

## 4. Cómo mantener la documentación visual

Al agregar, renombrar o retirar una vista web:

1. Actualizar el mapa de navegación y el catálogo de este documento.
2. Regenerar el catálogo de rutas; no copiarlo al `README.md`.
3. Verificar que ruta, permiso, controlador, plantilla y JavaScript de página conserven
   nombres coherentes.
4. Si cambia un límite del sistema o una dependencia externa, actualizar también los
   diagramas de contexto y contenedores.
5. Revisar los diagramas en la vista previa de Markdown de GitHub antes de fusionar.
6. Ejecutar `npm run docs:architecture` cuando cambien routers o imports entre áreas y
   confirmar con `npm run docs:check` antes de enviar el cambio. La misma verificación
   se ejecuta automáticamente en CI para pull requests y pushes a la rama principal.

Los diagramas describen el diseño a nivel de sistema; el código sigue siendo la fuente
de verdad para los detalles de endpoints, payloads y reglas de autorización. Las vistas
nuevas deben seguir las [convenciones y patrones para diagramas](diagram-conventions.md),
incluida la distinción entre notación visual, patrón documental y patrón con evidencia
en el código.

## 5. Organización consistente de front y back

La clasificación completa de factories, composición, pipeline, transacciones, eventos
y test harness se mantiene en [patrones de diseño y construcción](design-and-construction-patterns.md).
Esta sección aplica esas decisiones a la organización de capas y recursos.

La unidad de organización es el **dominio funcional** (`admin`, `sales`, `warehouse`),
no el tipo de operación CRUD. Una funcionalidad debe conservar el mismo dominio y el
mismo nombre de recurso al recorrer sus capas. Por ejemplo, `warehouse/wastes` enlaza
la ruta API, el controlador, el servicio del navegador y la página de mermas sin crear
un flujo paralelo para registrar o editar.

| Responsabilidad | Backend | Frontend |
| --- | --- | --- |
| Composición | `src/routes/{api,web}/index.js` registra prefijos y routers | La plantilla de página incluye el único entry point de la pantalla |
| Transporte | `routes` declara método, permiso y validadores; `controllers` traduce HTTP/DTO | `public/js/services` encapsula HTTP; `application` traduce la respuesta al caso de uso |
| Negocio | `services/<dominio>` contiene reglas y transacciones reutilizables | `application/<dominio>` coordina casos de uso sin depender de elementos visuales |
| Presentación | El controlador web entrega el contexto de la vista | `pages/<dominio>/<recurso>` conserva siempre el entry point y, cuando existen, el formulario y modal del contexto; incluso acceso, shell y consultas de movimientos siguen esa jerarquía. `ui`, `plugins` y `views/shared` reúnen piezas independientes del recurso |

Reglas para extender un CRUD:

1. Añadir el router al registro central correspondiente, manteniendo el dominio tanto
   en la ruta como en los directorios de sus capas.
2. Reutilizar DTOs, servicios de dominio, formularios, modales, tablas y selectores
   existentes antes de crear otro proceso; parametrizar el contexto cuando dos flujos
   sólo difieran en material/merma u otro recurso.
3. Mantener autorización y reglas de negocio en el servidor. El cliente únicamente
   adapta transporte, interacción y presentación.
4. Reservar `application` para casos de uso y `pages` para composición. Una llamada
   HTTP no debe implementarse directamente desde una página.
5. Ordenar las operaciones públicas de cada recurso de forma predecible en todas sus
   capas: **lectura/listado, creación, actualización general, actualizaciones
   especializadas y eliminación o acciones terminales**. Los imports se ordenan por
   dominio y nombre; no se reordena según el momento en que se añadió una función.
6. Ubicar las pruebas unitarias de controllers en
   `tests/unit/controllers/<tipo>/<dominio>` y las CRUD con persistencia en
   `tests/integration/controllers`, siguiendo las estrategias de
   `docs/service-test-coverage.md`.
7. Al editar EJS, preservar el cierre final de `contentFor` en su posición; no
   eliminarlo y volverlo a agregar como efecto secundario de una refactorización.

### Reutilización aplicada en flujos de salidas

Las salidas de material y de merma conservan servicios HTTP separados porque sus
endpoints y respuestas pertenecen a contextos distintos. En cambio, su capa
`application` reutiliza `createIssueApplication`, que compone `createCrudApplication`
para listado, registro y edición, y sólo agrega las mutaciones de encabezado, detalles
y devolución. La adaptación común de `formData`, identificadores y respuestas exitosas
vive en `createApplicationMutation`; no hay dos implementaciones del mismo proceso.
Cada contexto sólo inyecta sus requests y las claves de datos de su respuesta. Las
páginas y datatables siguen consumiendo nombres de
dominio (`registerGoodsIssue`, `registerWasteIssue`, etc.), por lo que el componente
compartido no filtra abstracciones genéricas hacia la UI.

El modal compartido de devolución tampoco mantiene un actualizador propio para sus
cantidades: reutiliza `setSummaryValue` de `totalsSummaryUI`, el mismo helper que
sincroniza el valor numérico de `data-value` y su representación formateada en los
resúmenes de formularios.

`createIssueApplication` sí es un export porque es una función de construcción usada
por ambos módulos de salida; no es la instancia de ninguno de ellos. Cada invocación
produce un objeto inmutable independiente, que queda privado como
`goodsIssueApplication` o `wasteIssueApplication`. Esta separación permite reutilizar
la configuración del proceso sin mezclar requests, claves de respuesta o estado entre
contextos.

Las instancias `personApplication`, `userApplication`, `clientApplication` y sus
equivalentes de almacén son detalles privados de cada módulo. Exportar directamente
esas instancias obligaría a páginas, formularios, datatables y selects a conocer
operaciones genéricas como `getAll` o `edit`, y haría que un cambio en la factory se
convirtiera en un cambio transversal de la UI. Por ello cada contexto mantiene exports
nombrados de dominio; éstos son referencias a los métodos construidos y no duplican su
ejecución.

El mismo criterio se aplica a clientes, personas, usuarios, proveedores, materiales,
mermas y entradas mediante `createCrudApplication`: listado, registro y edición
comparten la adaptación de transporte. `additionalMutations` mantiene también ese
contrato para cambio de contraseña, stock, eliminación, corrección, cancelación y
operaciones de detalle, pero cada módulo exporta nombres de dominio y claves de
respuesta propios. En materiales, el contexto de creación atraviesa la adaptación
común sólo para omitir `maxUnitCost` durante una entrada de compra; el resto del objeto
ya seleccionado por `materialForm` pasa sin un segundo mapeo y el DTO del servidor
mantiene la normalización. En entradas y salidas, los identificadores de documento y
detalle se propagan por el mismo adaptador. De este modo una diferencia de contexto se
configura y no abre otra ejecución de aplicación.

Los módulos de aplicación tampoco convierten listados a opciones cuando el plugin de
Select2 ya declara el `mapOption` del dominio. Los filtros de proveedor y material
inicializan el mismo select remoto sin una consulta o transformación paralela; sólo los
filtros con selección predeterminada conservan una función de precarga. Asimismo,
`deleteMaterial` recibe `{ id }`, igual que las mutaciones construidas por la factory,
y el datatable adapta el identificador de su fila al invocarlo.

`application/warehouse/wasteIssues/wasteIssues.js` permanece dentro de una carpeta de
recurso, en paralelo con `goodsIssues/goodsIssues.js`, porque ambos flujos tienen varias
mutaciones relacionadas. `wasteForm`, `wasteModal` y `wasteFields` permanecen en
`pages/warehouse/wastes` porque conocen selectores, validaciones, modos y operaciones
propias de ese recurso; que el datatable abra ese modal no convierte al modal en un
componente independiente del contexto. Sólo una abstracción sin conocimiento de merma
debe moverse a `ui` o a una carpeta compartida. El modal reutiliza los getters de
inventario para leer la presentación tanto del contrato plano como de la relación
`supplierMaterial.material` devuelta por Prisma; así no presupone relaciones opcionales
al alternar los campos dimensionales durante altas, ediciones o ajustes. En las salidas,
la coordinación específica permanece en su archivo de página y las operaciones realmente
comunes del formulario están en `ui/issues/issueFormUI.js`.
La presentación de sus modos se resuelve mediante una configuración única por modo;
la inicialización calcula una sola vez el estado deshabilitado del formulario y delega
una sola vez el estado del encabezado. Así, salidas de material y de merma comparten las
mismas transiciones sin cadenas de ramas ni sincronizaciones visuales repetidas.
Las decisiones privadas que sólo tenían un consumidor se mantienen en ese flujo: la
selección de la mutación vive en `useIssueForm`, la resolución del modo en las acciones
de tabla y la sincronización de cantidad en su evento. Se extrae una función únicamente
cuando existe reutilización entre consumidores o cuando constituye un adaptador común.

Los formularios y modales de clientes, materiales y proveedores se consumen desde
varias pantallas, pero siguen perteneciendo a su recurso. Por ello viven en
`pages/admin/persons`, `pages/admin/users`, `pages/sales/clients`,
`pages/warehouse/materials` y `pages/warehouse/suppliers`. Las pantallas sin CRUD también
respetan la jerarquía completa, por ejemplo `pages/admin/movements`,
`pages/home/login` y `pages/home/index`; no quedan entry points sueltos en la raíz de un
dominio. Las vistas EJS replican `views/pages/<dominio>/<recurso>`; sus partials
propietarios permanecen junto al recurso y los partials reutilizados por varios recursos
se ubican en `views/shared`, como los formularios comunes de salidas. El entry point de cada CRUD sólo inicializa la tabla y carga su formulario,
mientras el formulario y el modal
conservan sus responsabilidades en módulos hermanos. Los flujos externos los importan desde el contexto propietario en vez de crear una carpeta
intermedia basada sólo en que hay más de un consumidor. `ui` queda reservado para
comportamiento que recibe su contexto por parámetros y no importa aplicaciones de un
recurso concreto.

Los comportamientos compartidos de formulario se importan desde módulos enfocados:
errores (`ui/forms/formErrorsUI.js`), estado y campos (`ui/forms/formStateUI.js`), detalle
(`ui/forms/detailFormUI.js`) y totales (`ui/forms/totalsSummaryUI.js`). Las operaciones que sólo tienen
un consumidor no forman parte de esa API: se mantienen privadas dentro del CRUD que
las necesita.

En compras, las filas de detalle reutilizan la identidad visible de inventario
(`material + medidas + proveedor`) que ya muestran salidas y almacén. Los modales
principales de compras y salidas se componen mediante `views/shared/inventory/inventoryCrudModal.ejs`;
cada CRUD declara sus campos y el componente transversal adapta ese contrato al layout
común. El wrapper de salidas permanece en `shared/issues` porque agrega exclusivamente
la configuración compartida por salidas de material y merma. En el cliente,
`ui/inventory/inventoryCrudModalUI.js` prepara el estado CRUD común del formulario antes de
que compras o salidas apliquen los datos y acciones propios de su contexto. Los modales
secundarios de devolución de salida y corrección de compra reutilizan el diálogo
desplazable compartido y el mismo helper de apertura MDB, sin reglas de altura propias
que interfieran con el cálculo responsivo del componente. La coordinación propietaria
de corrección mantiene sólo el cálculo de totales que comparte entre la apertura y los
eventos del formulario; la preparación usada una sola vez permanece en la apertura. La
identidad visible del material seleccionado se presenta mediante el valor informativo
compartido en las correcciones de compra y devoluciones de salida. No se reutiliza el
`materialSelect` porque estas operaciones nunca permiten sustituir el material del
detalle: un texto evita comunicar una selección futura, no participa en el formulario
enviado y conserva el select para los CRUD donde sí existe esa decisión. Su tarjeta
reutiliza la misma presentación visual de etiqueta y valor que los costos y totales
informativos de los documentos.

Los filtros compartidos de DataTables separan los valores visibles en el formulario de
los valores que ya fueron aplicados. `tableFilterState` toma una instantánea al enviar
el formulario o limpiarlo; paginación, búsqueda, actualizaciones en tiempo real y
exportación reutilizan esa instantánea y no activan cambios que el usuario todavía no
confirmó con **Buscar / filtrar**. Esta regla se mantiene en el componente compartido
para que listados de personas, inventario, movimientos, compras y salidas sigan el
mismo flujo sin implementaciones específicas por CRUD.

## 6. Herramientas

- **Ahora:** Mermaid para diagramas curados y el generador local para rutas e imports.
- **Si crece la arquitectura:** Structurizr DSL/C4 para mantener múltiples vistas desde
  un modelo central.
- **Si se necesitan reglas de dependencias:** dependency-cruiser o Madge para ciclos y
  límites entre módulos.
- **Para la API:** OpenAPI describe el contrato y Swagger UI puede visualizarlo; no
  reemplazan estos diagramas. Consulta la [decisión sobre el contrato](api-contract.md).

No se añade otra herramienta hasta que exista esa necesidad. Esto mantiene el flujo
actual simple y evita diagramas duplicados.
