<a id="cu-sal-13"></a>
# `CU-SAL-13` — Devolver merma surtida

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    Note over Router,Controller: Variables de frontera: id, detailId, returnDto, userId y tx
    participant Router as src/routes/api/warehouse/wasteIssueApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/wasteIssueController.js
    participant ReturnDto as «object»<br/>returnDto<br/>src/dtos/wasteIssueDTO.js
    participant Service as src/services/warehouse/wasteIssues/detailReturns/wasteIssueReturnService.js
    participant Status as src/services/warehouse/wasteIssues/wasteIssueFulfillmentService.js
    participant Prisma as Prisma / PostgreSQL
    participant Socket as src/utils/socketUtils.js

    Client->>Router: POST /api/warehouse/waste-issues/:id/details/:detailId/returns + accessToken
    Router->>Controller: registerWasteIssueDetailReturn(req, res)
    Controller->>ReturnDto: createWasteIssueDtoForReturn(req.body) → sanitizeEmptyStrings(...)
    ReturnDto-->>Controller: returnDto normalizado
    Controller->>Service: returnWasteIssueDetail({ id, detailId, returnDto, userId })
    Service->>Prisma: iniciar $transaction
    Service->>Prisma: cargar WasteIssue y WasteIssueDetail surtido
    Service->>Service: validar estado, cantidad surtida y devoluciones previas
    alt Cantidad de merma no retornable
        Service-->>Service: error de dominio
        Service-->>Controller: rollback y error
    else Cantidad válida
        Service->>Service: aplicar devolución de existencia de merma con tx
        Service->>Prisma: crear WasteIssueReturn
        Service->>Prisma: recargar todos los detalles con tx
        alt todos los detalles quedan Cancelado
            Service->>Status: derivar cumplimiento Cancelado y estado documental Cancelada
        else existe algún detalle no cancelado
            Service->>Status: derivar cumplimiento agregado sin cancelar el encabezado
        end
        Prisma-->>Service: salida de merma actualizada y commit
        Service-->>Controller: wasteIssueReturn
        Controller->>Socket: publicar después del commit
        Controller-->>Client: 200 devolución registrada
    end
```
