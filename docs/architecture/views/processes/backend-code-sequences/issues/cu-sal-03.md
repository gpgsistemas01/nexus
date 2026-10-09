<a id="cu-sal-03"></a>
# `CU-SAL-03` — Editar encabezado de salida de material

**Patrones:** `BE-P01`, `BE-P04`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`materialGoodsIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`goodsIssueHandlers.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/shared/goodsIssueHandlers.js) |
| `Facade` | control | [`materialGoodsIssueService.js`](../../../../../../src/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js) |
| `Core` | control | [`goodsIssueService.js`](../../../../../../src/services/warehouse/goodsIssues/goodsIssueService.js) |
| `Helpers` | control | [`goodsIssueHelpers.js`](../../../../../../src/services/warehouse/goodsIssues/goodsIssueHelpers.js) |
| `Inventory` | control | [`movementService.js`](../../../../../../src/services/inventory/movementService.js) |
| `DTO` | control | [`goodsIssueDTO.js`](../../../../../../src/dtos/goodsIssueDTO.js) |
| `Header` | control | [`issueHeaderService.js`](../../../../../../src/services/warehouse/issues/issueHeaderService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `ValidationRules` | control | [`goodsIssueValidations.js`](../../../../../../src/validators/forms/goodsIssueValidations.js) |
| `Formatter` | control | [`formattersUtils.js`](../../../../../../src/utils/formattersUtils.js) |
| `FileMaterialGoodsIssueController` | control | [`materialGoodsIssueController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueController.js) |
| `FileBaseRepository` | control | [`baseRepository.js`](../../../../../../src/repository/baseRepository.js) |
| `FilePrisma` | control | [`prisma.js`](../../../../../../src/lib/prisma.js) |
| `FileDatabaseUrl` | control | [`databaseUrl.js`](../../../../../../src/lib/databaseUrl.js) |

### Configuración y construcción

El módulo específico configura y exporta el handler generado en el archivo de la línea `Controller`: [`materialGoodsIssueController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueController.js).

## Composición de archivos

Los archivos que construyen, configuran o reexportan funciones aparecen como componentes
individuales. Las flechas representan imports reales, resueltos al cargar los módulos;
las llamadas durante la operación se muestran en las secuencias siguientes. Cada nombre
identifica un archivo y la tabla conserva su ruta completa.

```mermaid
flowchart TB
    subgraph Component0["Backend"]
        FileMaterialGoodsIssueController["materialGoodsIssueController.js"]
        Controller["goodsIssueHandlers.js"]
        FileDatabaseUrl["databaseUrl.js"]
        FilePrisma["prisma.js"]
        FileBaseRepository["baseRepository.js"]
        Route["materialGoodsIssueApiRoute.js"]
        Inventory["movementService.js"]
        Core["goodsIssueService.js"]
        Facade["materialGoodsIssueService.js"]
        Formatter["formattersUtils.js"]
    end
    FileMaterialGoodsIssueController -->|import| Facade
    FileMaterialGoodsIssueController -->|import| Controller
    FilePrisma -->|import| FileDatabaseUrl
    FileBaseRepository -->|import| FilePrisma
    Route -->|import| FileMaterialGoodsIssueController
    Inventory -->|import| FileBaseRepository
    Inventory -->|import| Formatter
    Core -->|import| Inventory
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `editMaterialGoodsIssueHeader` | `FileMaterialGoodsIssueController` | `Controller` · `buildHeaderHandler(...)` |

## Secuencia de entrada y coordinación

El primer nivel conserva método, controles HTTP, normalización, adaptación del tipo,
respuesta y publicación. La llamada del adaptador al núcleo es la frontera que amplía
el segundo nivel; ambas figuras realizan el mismo caso, sin añadir otra operación.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as materialGoodsIssueApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant ValidationRules@{ "type": "control" } as goodsIssueValidations.js
    participant Validator@{ "type": "control" } as validatorMiddleware.js
    participant Controller@{ "type": "control" } as goodsIssueHandlers.js

    Note over Controller: Handler generado
    Client->>Route: PATCH /api/warehouse/goods-issues/materials/:id/header
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>ValidationRules: goodsIssueHeaderValidation[] — cadena ejecutada por Express
    Route->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: editMaterialGoodsIssueHeader(req, res)
        Controller-->>Client: HTTP 200 { goodsIssue, code }
```

## Detalle de coordinación del controller

Continúa la colaboración anterior. Conserva el orden de los mensajes del código y
separa los archivos que ejecutan esta parte del recorrido; los otros detalles del caso
completan las llamadas a helpers y la propagación del resultado.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Controller@{ "type": "control" } as goodsIssueHandlers.js
    participant Formatter@{ "type": "control" } as formattersUtils.js
    participant Facade@{ "type": "control" } as materialGoodsIssueService.js
    participant Core@{ "type": "control" } as goodsIssueService.js
    participant DTO@{ "type": "control" } as DTO funcional<br/>goodsIssueDTO.js
    participant ErrorHandler@{ "type": "control" } as app.js

    Note over Controller: Handler generado
    Controller->>DTO: createGoodsIssueHeaderDtoForEdit(req.body)
    activate DTO
    DTO-->>Controller: createGoodsIssueHeaderDtoForEdit(): Object — DTO normalizado
    deactivate DTO
    Controller->>Formatter: sanitizeEmptyStrings(dto)
    Controller->>Facade: updateMaterialGoodsIssueHeader(options con DTO, identificadores y actor cuando corresponde)
    Facade->>Core: updateGoodsIssueHeader({ ...options, type: MATERIAL })
    Note over Facade,Core: Realización detallada en la colaboración de dominio
    alt Servicio resuelto
        Core-->>Facade: updateGoodsIssueHeader(): Promise[GoodsIssue]
        Facade-->>Controller: updateMaterialGoodsIssueHeader(): Promise[GoodsIssue]
        Controller-->>Client: HTTP 200 { goodsIssue, code }
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló la transacción
        Facade-->>Controller: error propagado
        Controller->>ErrorHandler: next(error) — propagación de Express
        ErrorHandler-->>Client: HTTP de error { code, message }
    end
```

## Colaboración interna del dominio

Este nivel amplía la invocación `Facade → Core` anterior. Conserva consultas, reglas,
helpers y contexto de persistencia. Su error retorna al adaptador y se propaga según
la primera figura; los mensajes se numeran de nuevo dentro de esta colaboración.

```mermaid
sequenceDiagram
    autonumber
    participant Facade@{ "type": "control" } as materialGoodsIssueService.js
    participant Core@{ "type": "control" } as goodsIssueService.js
    participant Helpers@{ "type": "control" } as goodsIssueHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Header@{ "type": "control" } as issueHeaderService.js

    participant FileBaseRepository@{ "type": "control" } as baseRepository.js

    Facade->>Core: updateGoodsIssueHeader({ ...options, type: MATERIAL })
    activate Core
    alt Servicio resuelto
        Core->>Helpers: buildGoodsIssueContextWhere(type)
        Core->>FileBaseRepository: getDb()
        FileBaseRepository-->>Core: getDb(): PrismaClient | TransactionClient — conserva tx
        Core->>Prisma: goodsIssue.findUnique({ where: { id, ...contextWhere }, include: estados y detalles })
        Core->>Header: resolveIssueHeaderData(options)
        Core->>Prisma: goodsIssue.update({ where: { id, ...contextWhere }, data: headerData })
        Core-->>Facade: updateGoodsIssueHeader(): Promise[GoodsIssue]
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló la transacción
    end
    deactivate Core
```
