<a id="cu-alm-04"></a>
# `CU-ALM-04` — Retirar material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`materialApiRoute.js`](../../../../../../src/routes/api/warehouse/materialApiRoute.js) |
| `Controller` | control | [`materialController.js`](../../../../../../src/controllers/api/warehouse/materialController.js) |
| `Domain` | control | [`materialService.js`](../../../../../../src/services/warehouse/materials/materialService.js) |
| `Usage` | control | [`supplierMaterialService.js`](../../../../../../src/services/warehouse/materials/supplierMaterialService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
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
    participant Route@{ "type": "boundary" } as materialApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant Controller@{ "type": "control" } as materialController.js
    participant Domain@{ "type": "control" } as materialService.js
    participant Usage@{ "type": "control" } as supplierMaterialService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler@{ "type": "control" } as app.js

    participant FileBaseRepository@{ "type": "control" } as baseRepository.js

    Client->>Route: DELETE /api/warehouse/materials/:id

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
    Route->>Controller: removeMaterial(req, res)
    activate Controller
    Controller->>Domain: deleteMaterial(req.params.id de SupplierMaterial)
    activate Domain
    Domain->>FileBaseRepository: getDb()
    FileBaseRepository-->>Domain: getDb(): PrismaClient | TransactionClient — tx si se recibió
    Domain->>Prisma: db.$transaction(async tx => ...)
    Prisma->>Prisma: tx.supplierMaterial.findUnique({ id })
    alt Relación inexistente
        Prisma-->>Domain: findUnique(): Promise[null]
        Domain-->>Controller: throw MaterialNotFound
    else Relación encontrada
        Domain->>Usage: existsMaterialUsage({ tx, materialId })
        Usage->>FileBaseRepository: getDb(tx)
        FileBaseRepository-->>Usage: getDb(): PrismaClient | TransactionClient — conserva tx
        Usage->>Prisma: material.findFirst({ relaciones históricas: some })
        alt Existe historia protegida
            Usage-->>Domain: existsMaterialUsage(): Promise[boolean] (true)
            Domain-->>Controller: throw MaterialDeleteRelationConflict y rollback
        else Sin historia protegida
            Usage-->>Domain: existsMaterialUsage(): Promise[boolean] (false)
            Domain->>Prisma: tx.supplierMaterial.delete({ id })
            Domain->>Prisma: tx.supplierMaterial.count({ materialId })
            opt No quedan relaciones con proveedores
                Domain->>Prisma: tx.material.delete({ materialId })
            end
            Prisma-->>Domain: delete(): Promise[{ id: number }]
            Domain-->>Controller: deleteMaterial(): Promise[Material]
            Controller-->>Client: HTTP 200 { material: { id }, code }
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
