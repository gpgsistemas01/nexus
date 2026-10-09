<a id="cu-ent-06"></a>
# `CU-ENT-06` — Generar reporte de compras de material

**Patrones:** `BE-P07`.

    opt Error de lectura o exportación
        Core-->>ErrorHandler: error propagado por Express
        ErrorHandler-->>Client: HTTP de error { code, message }
        end
    end
## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`materialGoodsReceiptReportApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsReceipts/materials/materialGoodsReceiptReportApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Controller` | control | [`materialGoodsReceiptReportController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptReportController.js) |
| `Facade` | control | [`materialGoodsReceiptService.js`](../../../../../../src/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js) |
| `Core` | control | [`reportController.js`](../../../../../../src/controllers/api/warehouse/reportController.js) |
| `Query` | control | [`reportService.js`](../../../../../../src/services/warehouse/reportService.js) |
| `List` | control | [`goodsReceiptService.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptService.js) |
| `Excel` | control | [`reportExcelUtils.js`](../../../../../../src/utils/reportExcelUtils.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `Formatter` | control | [`formattersUtils.js`](../../../../../../src/utils/formattersUtils.js) |

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

    participant Formatter@{ "type": "control" } as Formato

    Client->>Route: GET /api/warehouse/reports/goods-receipts/materials/excel
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: exportMaterialGoodsReceiptReportExcel(req, res)
    alt Exportación resuelta
        Controller->>Core: exportGoodsReceiptReportExcel({ req, res, materialType, findGoodsReceiptReportRows })
        Core->>Formatter: getReportMonthDateRange(reportMonth) cuando el reporte es mensual
        Formatter-->>Core: getReportMonthDateRange(): Object
        Core->>Facade: findMaterialGoodsReceiptReportRows(options)
        Facade->>Query: findGoodsReceiptReportRows({ ...options, type: MATERIAL })
        Query->>List: findAllGoodsReceipts({ ...filtros, type, includeCounts: false, skip: 0, take: 100000 })
        List->>Prisma: goodsReceipt.findMany({ where: contexto y filtros })
        activate Prisma
        Prisma-->>List: findMany(): Promise[GoodsReceipt[]]
        deactivate Prisma
        List-->>Query: findAllGoodsReceipts(): Promise[{ data }] — sin conteos
        Query-->>Facade: findGoodsReceiptReportRows(): Promise[Object[]]
        Facade-->>Core: findMaterialGoodsReceiptReportRows(): Promise[Object[]]
        Core->>Query: buildMonthlyGoodsReceiptSummary(rows) si se solicita resumen mensual
        Query-->>Core: buildMonthlyGoodsReceiptSummary(): Object
        Core->>Excel: sendExcelReport({ res, data, sheetName, filename })
        Excel-->>Client: HTTP 200 archivo XLSX
    else Error de lectura o exportación
        Core-->>ErrorHandler: error propagado por Express
        ErrorHandler-->>Client: HTTP de error { code, message }
    end
```
