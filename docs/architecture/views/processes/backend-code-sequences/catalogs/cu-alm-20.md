<a id="cu-alm-20"></a>
# `CU-ALM-20` — Retirar consumible

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/consumableApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/consumableController.js
    participant Domain as src/services/warehouse/consumables/consumableService.js
    participant Usage as src/services/warehouse/materials/supplierMaterialService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler as src/app.js

    Client->>Route: DELETE /api/warehouse/consumables/:id
    Route->>Controller: removeConsumable(req, res)
    activate Controller
    Controller->>Domain: deleteConsumable(req.params.id de SupplierMaterial)
    activate Domain
    Domain->>Prisma: getDb().$transaction(async tx => ...)
    Prisma->>Prisma: tx.supplierMaterial.findUnique({ id })
    alt Relación inexistente
        Prisma-->>Domain: findUnique(): Promise[null]
        Domain-->>Controller: throw MaterialNotFound
    else Relación encontrada
        Domain->>Usage: existsMaterialUsage({ tx, materialId })
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
            Domain-->>Controller: deleteConsumable(): Promise[Material]
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
