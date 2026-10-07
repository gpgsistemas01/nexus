<a id="cu-ent-12"></a>
# `CU-ENT-12` — Generar reporte de compras de consumible

> Esta secuencia usa la ruta y la fachada específicas de consumibles; los componentes con nombres históricos de material pertenecen al núcleo compartido de inventario.

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/reportController.js
    participant Query@{ "type": "control" } as src/services/warehouse/reportService.js
    participant Excel as src/utils/reportExcelUtils.js
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/warehouse/reports/goods-receipts/consumables/excel
    Route->>Controller: exportConsumableGoodsReceiptReportExcel(req, res)
    activate Controller
    Controller->>Query: consumableGoodsReceiptService.findConsumableGoodsReceiptReportRows({ search, startDate, endDate, supplierId, personId, orderBy, orderDir })
    activate Query
    alt Servicio resuelto
        Query-->>Controller: consumableGoodsReceiptService.findConsumableGoodsReceiptReportRows(): Promise[Object[]]
        Controller->>Excel: sendExcelReport({ res, data, sheetName, filename })
        Excel-->>Client: HTTP 200 archivo XLSX
    else AppError propagado
        Query-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Query
    deactivate Controller
```

