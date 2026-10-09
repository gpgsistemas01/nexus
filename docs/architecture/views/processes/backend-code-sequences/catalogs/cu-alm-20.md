<a id="cu-alm-20"></a>
# `CU-ALM-20` — Retirar consumible

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`consumableApiRoute.js`](../../../../../../src/routes/api/warehouse/consumableApiRoute.js) |
| `Controller` | control | [`consumableController.js`](../../../../../../src/controllers/api/warehouse/consumableController.js) |
| `Domain` | control | [`consumableService.js`](../../../../../../src/services/warehouse/consumables/consumableService.js) |
| `Usage` | control | [`supplierMaterialService.js`](../../../../../../src/services/warehouse/materials/supplierMaterialService.js) |
| `MaterialService` | control | [`materialService.js`](../../../../../../src/services/warehouse/materials/materialService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as Router API
    participant Auth@{ "type": "control" } as Acceso
    participant Controller@{ "type": "control" } as Controller
    participant Domain@{ "type": "control" } as Servicio de dominio
    participant Usage@{ "type": "control" } as Uso del recurso
    participant MaterialService@{ "type": "control" } as Servicio de material
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler@{ "type": "control" } as Errores Express

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
    MaterialService->>Prisma: getDb().$transaction(async tx => ...)
    Prisma->>Prisma: tx.supplierMaterial.findUnique({ id })
    alt [relación inexistente o tipo distinto de CONSUMABLE]
        Prisma-->>MaterialService: findUnique(): Promise[null]
        Domain-->>Controller: throw MaterialNotFound
    else Relación encontrada
        MaterialService->>Usage: existsMaterialUsage({ tx, materialId })
        Usage->>Prisma: material.findFirst({ relaciones históricas: some })
        alt Existe historia protegida
            Usage-->>MaterialService: existsMaterialUsage(): Promise[boolean] (true)
            Domain-->>Controller: throw MaterialDeleteRelationConflict y rollback
        else Sin historia protegida
            Usage-->>MaterialService: existsMaterialUsage(): Promise[boolean] (false)
            MaterialService->>Prisma: tx.supplierMaterial.delete({ id })
            MaterialService->>Prisma: tx.supplierMaterial.count({ materialId })
            opt No quedan relaciones con proveedores
                MaterialService->>Prisma: tx.material.delete({ materialId })
            end
            Prisma-->>MaterialService: delete(): Promise[{ id: string }]
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
