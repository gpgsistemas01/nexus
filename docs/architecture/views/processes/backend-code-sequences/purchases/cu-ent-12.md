<a id="cu-ent-12"></a>
# `CU-ENT-12` — Generar reporte de compras de consumible

**Patrones:** `BE-P07`.

    opt Error de lectura o exportación
        Core-->>ErrorHandler: error propagado por Express
        ErrorHandler-->>Client: HTTP de error { code, message }
        end
    end
## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Route` | boundary | [`consumableGoodsReceiptReportApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptReportApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Controller` | control | [`consumableGoodsReceiptReportController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptReportController.js) |
| `Facade` | control | [`consumableGoodsReceiptService.js`](../../../../../../src/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js) |
| `Core` | control | [`reportController.js`](../../../../../../src/controllers/api/warehouse/reportController.js) |
| `Query` | control | [`reportService.js`](../../../../../../src/services/warehouse/reportService.js) |
| `List` | control | [`goodsReceiptService.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptService.js) |
| `Excel` | control | [`reportExcelUtils.js`](../../../../../../src/utils/reportExcelUtils.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as Router API
    participant Auth@{ "type": "control" } as Acceso
    participant Controller@{ "type": "control" } as Controller
    participant Facade@{ "type": "control" } as Adaptador del tipo
    participant Core@{ "type": "control" } as Núcleo del dominio
    participant Query@{ "type": "control" } as Consulta de dominio
    participant List@{ "type": "control" } as Listado
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Excel@{ "type": "control" } as Reporte Excel
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: GET /api/warehouse/reports/goods-receipts/consumables/excel
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: exportConsumableGoodsReceiptReportExcel(req, res)
    alt Exportación resuelta
        Controller->>Core: exportGoodsReceiptReportExcel({ req, res, materialType, findGoodsReceiptReportRows })
        Core->>Core: getReportMonthDateRange(reportMonth) cuando el reporte es mensual
        Core->>Facade: findConsumableGoodsReceiptReportRows(options)
        Facade->>Query: findGoodsReceiptReportRows({ ...options, type: CONSUMABLE })
        Query->>List: findAllGoodsReceipts({ ...filtros, type, includeCounts: false, skip: 0, take: 100000 })
        List->>Prisma: goodsReceipt.findMany({ where: contexto y filtros })
        activate Prisma
        Prisma-->>List: findMany(): Promise[GoodsReceipt[]]
        deactivate Prisma
        List-->>Query: findAllGoodsReceipts(): Promise[{ data }] — sin conteos
        Query-->>Facade: findGoodsReceiptReportRows(): Promise[Object[]]
        Facade-->>Core: findConsumableGoodsReceiptReportRows(): Promise[Object[]]
        Core->>Core: buildMonthlyGoodsReceiptSummary(rows) si se solicita resumen mensual
        Core->>Excel: sendExcelReport({ res, data, sheetName, filename })
        Excel-->>Client: HTTP 200 archivo XLSX
    else Error de lectura o exportación
        Core-->>ErrorHandler: error propagado por Express
        ErrorHandler-->>Client: HTTP de error { code, message }
    end
```
