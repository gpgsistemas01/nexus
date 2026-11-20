<a id="cu-alm-20"></a>
# `CU-ALM-20` — Retirar oferta de consumible

**Patrones:** `[BE-P01](../../../development/design-and-construction-patterns/03-patterns-in-code.md#pipeline-dto-y-políticas-declarativas)`, `[BE-P03](../../../development/design-and-construction-patterns/03-patterns-in-code.md#transacción-eventos-y-auditoría)`, `[BE-P04](../../../development/design-and-construction-patterns/03-patterns-in-code.md#transacción-eventos-y-auditoría)`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`consumableApiRoute.js`](../../../../../../src/routes/api/warehouse/consumableApiRoute.js) |
| `Controller` | control | [`consumableController.js`](../../../../../../src/controllers/api/warehouse/consumableController.js) |
| `Domain` | control | [`consumableService.js`](../../../../../../src/services/warehouse/consumables/consumableService.js) |
| `Usage` | control | [`supplierMaterialService.js`](../../../../../../src/services/warehouse/materials/supplierMaterialService.js) |
| `MaterialService` | control | [`materialService.js`](../../../../../../src/services/warehouse/materials/materialService.js) |
| `DatabaseErrors` | control | [`databaseError.js`](../../../../../../src/errors/databaseError.js) |
| `ErrorHandler` | control | [`errorMiddleware.js`](../../../../../../src/middleware/errorMiddleware.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `FileBaseRepository` | control | [`baseRepository.js`](../../../../../../src/repository/baseRepository.js) |
| `FileDatabaseUrl` | control | [`databaseUrl.js`](../../../../../../src/lib/databaseUrl.js) |
| `FilePrisma` | control | [`prisma.js`](../../../../../../src/lib/prisma.js) |

## Composición de archivos

Los archivos que construyen, configuran o reexportan funciones aparecen como componentes
individuales. Las flechas representan imports reales, resueltos al cargar los módulos;
las llamadas durante la operación se muestran en las secuencias siguientes. Cada nombre
identifica un archivo y la tabla conserva su ruta completa.

```mermaid
flowchart TB
    subgraph Component0["Backend"]
        FileDatabaseUrl["databaseUrl.js"]
        FilePrisma["prisma.js"]
        FileBaseRepository["baseRepository.js"]
    end
    FilePrisma -->|import| FileDatabaseUrl
    FileBaseRepository -->|import| FilePrisma
```

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as consumableApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant Controller@{ "type": "control" } as consumableController.js
    participant Domain@{ "type": "control" } as consumableService.js
    participant MaterialService@{ "type": "control" } as materialService.js
    participant Usage@{ "type": "control" } as supplierMaterialService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant DatabaseErrors@{ "type": "control" } as databaseError.js
    participant ErrorHandler@{ "type": "control" } as errorMiddleware.js

    participant FileBaseRepository@{ "type": "control" } as baseRepository.js

    Client->>Route: DELETE /api/warehouse/consumables/:id

    Route->>Auth: verifyApiTokenRequired(req, res, next)
    activate Auth
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    deactivate Auth
    Route->>Auth: authorizeUserApi(PERMISSIONS.MATERIALS_WRITE)(req, res, next)
    activate Auth
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    deactivate Auth
    Route->>Controller: removeConsumable(req, res)
    activate Controller
    Controller->>Domain: deleteConsumable(req.params.id de SupplierMaterial)
    activate Domain
    Domain->>MaterialService: deleteMaterial(id, { type: CONSUMABLE })
    MaterialService->>FileBaseRepository: getDb()
    FileBaseRepository-->>MaterialService: getDb(): PrismaClient | TransactionClient — tx si se recibió
    MaterialService->>Prisma: db.$transaction(async tx => ...)
    Prisma->>Prisma: tx.supplierMaterial.findUnique({ id, select: currentStock/supplierId/material.type })
    break UUID de relación mal formado
        Prisma-->>MaterialService: error 22P02 y rollback
        MaterialService->>DatabaseErrors: normalizeDatabaseError(error)
        DatabaseErrors-->>MaterialService: normalizeDatabaseError(): RecordIdentifierInvalid
        MaterialService-->>Domain: throw RecordIdentifierInvalid
        Domain-->>Controller: throw RecordIdentifierInvalid
        Controller->>ErrorHandler: next(error) — propagación del rechazo por Express
        ErrorHandler-->>Client: HTTP 400 { code: RECORD_ID_INVALID, message }
    end
    alt [relación inexistente o tipo distinto de CONSUMABLE]
        Prisma-->>MaterialService: findUnique(): Promise[null]
        Domain-->>Controller: throw MaterialNotFound
    else Relación encontrada
        alt Existencia distinta de cero
            MaterialService-->>Controller: throw MaterialDeleteStockConflict y rollback
        else Existencia en cero
            MaterialService->>Usage: existsDeletableSupplierMaterial({ tx, id, supplierId })
            Usage->>Prisma: supplierMaterial.findFirst({ id, currentStock: 0, material sin historial del proveedor })
            alt Hay compras, salidas u otros registros de inventario
                MaterialService-->>Domain: throw MaterialDeleteHistoryConflict y rollback
                Domain-->>Controller: throw MaterialDeleteHistoryConflict
            else Oferta sin historial
                MaterialService->>Prisma: tx.supplierMaterial.delete({ id })
                Note over MaterialService,Prisma: Material, Supplier y documentos históricos se conservan
                Prisma-->>MaterialService: delete(): Promise[{ id, materialId }]
                Domain-->>Controller: deleteConsumable(): Promise[SupplierMaterial]
                Controller-->>Client: HTTP 200 { material: { id, materialId }, code }
            end
        end
    end
    opt AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```
