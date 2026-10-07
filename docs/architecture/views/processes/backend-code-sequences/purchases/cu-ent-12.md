<a id="cu-ent-12"></a>
# `CU-ENT-12` — Generar reporte de compras de consumible

**Patrones:** `BE-P07`.

    opt Error de lectura o exportación
        Core-->>ErrorHandler: error propagado por Express
        ErrorHandler-->>Client: HTTP de error { code, message }
        end
    end
```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptReportApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptReportController.js
    participant Facade@{ "type": "control" } as src/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js
    participant Core@{ "type": "control" } as src/controllers/api/warehouse/reportController.js
    participant Query as src/services/warehouse/reportService.js
    participant List as src/services/warehouse/goodsReceipts/goodsReceiptService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Excel as src/utils/reportExcelUtils.js
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/warehouse/reports/goods-receipts/consumables/excel
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Route->>Auth: authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ)(req, res, next)
    alt Token o permiso rechazados
        Route-->>Client: HTTP 401 o 403 — error de middleware
    else Pipeline aceptado
        Route->>Controller: exportConsumableGoodsReceiptReportExcel(req, res)
        alt Exportación resuelta
            Controller->>Core: exportGoodsReceiptReportExcel({ req, res, materialType, findGoodsReceiptReportRows })
            Core->>Core: getReportMonthDateRange(reportMonth) cuando el reporte es mensual
            Core->>Facade: findConsumableGoodsReceiptReportRows(options)
            Facade->>Query: findGoodsReceiptReportRows({ ...options, type: CONSUMABLE })
            Query->>List: findAllGoodsReceipts({ ...filtros, type, includeCounts: false, skip: 0, take: 100000 })
            List->>Prisma: goodsReceipt.findMany({ where: contexto y filtros })
            Prisma-->>List: findMany(): Promise[GoodsReceipt[]]
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
    end
```
