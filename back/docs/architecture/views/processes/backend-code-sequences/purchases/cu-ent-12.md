<a id="cu-ent-12"></a>
# `CU-ENT-12` — Generar reporte de compras de consumible

**Patrones:** `BE-P07`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`consumableGoodsReceiptReportApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptReportApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Controller` | control | [`consumableGoodsReceiptReportController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptReportController.js) |
| `Facade` | control | [`consumableGoodsReceiptService.js`](../../../../../../src/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js) |
| `Core` | control | [`reportController.js`](../../../../../../src/controllers/api/warehouse/reportController.js) |
| `Query` | control | [`goodsReceiptReportService.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptReportService.js) |
| `Pagination` | control | [`paginationRepository.js`](../../../../../../src/repository/paginationRepository.js) |
| `List` | control | [`goodsReceiptService.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptService.js) |
| `Data` | control | [`warehouseReportExcel.js`](../../../../../../src/utils/reports/warehouseReportExcel.js) |
| `Summary` | control | [`goodsReceiptReportSummary.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptReportSummary.js) |
| `Excel` | control | [`reportExcelUtils.js`](../../../../../../src/utils/reportExcelUtils.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `Formatter` | control | [`formattersUtils.js`](../../../../../../src/utils/formattersUtils.js) |
| `FileBaseRepository` | control | [`baseRepository.js`](../../../../../../src/repository/baseRepository.js) |
| `FilePrisma` | control | [`prisma.js`](../../../../../../src/lib/prisma.js) |
| `FileDatabaseUrl` | control | [`databaseUrl.js`](../../../../../../src/lib/databaseUrl.js) |

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
    participant Route@{ "type": "boundary" } as consumableGoodsReceiptReportApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant Controller@{ "type": "control" } as consumableGoodsReceiptReportController.js

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
```

## Detalle de coordinación del controller

Continúa la colaboración anterior. Conserva el orden de los mensajes del código y
separa los archivos que ejecutan esta parte del recorrido; los otros detalles del caso
completan las llamadas a helpers y la propagación del resultado.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Controller@{ "type": "control" } as consumableGoodsReceiptReportController.js
    participant Core@{ "type": "control" } as reportController.js
    participant Formatter@{ "type": "control" } as formattersUtils.js
    participant ErrorHandler@{ "type": "control" } as app.js
    participant Facade@{ "type": "control" } as consumableGoodsReceiptService.js
    participant Query@{ "type": "control" } as goodsReceiptReportService.js
    participant Data@{ "type": "control" } as warehouseReportExcel.js
    participant Excel@{ "type": "control" } as reportExcelUtils.js

    Controller->>Core: exportGoodsReceiptReportExcel(opciones del recurso)
    Core->>Formatter: getReportMonthDateRange(reportMonth) si aplica
    Formatter-->>Core: getReportMonthDateRange(): rango de fechas
    Core->>Facade: findConsumableGoodsReceiptReportRows(filtros)
    Facade->>Query: findGoodsReceiptReportRows(filtros y tipo)
    Query-->>Facade: findGoodsReceiptReportRows(): AsyncIterable de filas
    Facade-->>Core: findConsumableGoodsReceiptReportRows(): AsyncIterable de filas
    Core->>Data: buildGoodsReceiptReportData(rows, opciones)
    Data-->>Core: buildGoodsReceiptReportData(): AsyncIterable de filas Excel
    Core->>Excel: sendExcelReport(opciones y generador)
    loop Consumo del generador hasta completar detalle y resumen
        Excel->>Data: buildGoodsReceiptReportData(continuación del generador)
        Data->>Query: findGoodsReceiptReportRows(continuación del generador)
        Query-->>Data: findGoodsReceiptReportRows(): siguiente fila del lote
        Data-->>Excel: buildGoodsReceiptReportData(): siguiente fila Excel
    end
    Excel-->>Client: HTTP 200 archivo XLSX
    opt Error de consulta o exportación
        Core-->>ErrorHandler: error propagado por Express
        ErrorHandler-->>Client: HTTP de error con código y mensaje
    end
```

## Detalle de consulta y proyección por lote

```mermaid
sequenceDiagram
    autonumber
    participant Query@{ "type": "control" } as goodsReceiptReportService.js
    participant Pagination@{ "type": "control" } as paginationRepository.js
    participant List@{ "type": "control" } as goodsReceiptService.js
    participant FileBaseRepository@{ "type": "control" } as baseRepository.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL

    Query->>Pagination: findBatches(opciones y fetchPage)
    loop Lotes de QUERY_BATCH_SIZES.DOCUMENTS
        Pagination->>List: findAllGoodsReceipts(filtros, tipo y includeCounts false)
        List->>FileBaseRepository: getDb()
        FileBaseRepository-->>List: getDb(): PrismaClient
        List->>Prisma: goodsReceipt.findMany(contexto, filtros y lote)
        Prisma-->>List: findMany(): Promise[GoodsReceipt[]]
        List-->>Pagination: findAllGoodsReceipts(): Promise[Page]
        Pagination-->>Query: findBatches(): siguiente lote
    end
```

## Detalle de acumulación del resumen durante la escritura

```mermaid
sequenceDiagram
    autonumber
    participant Excel@{ "type": "control" } as reportExcelUtils.js
    participant Data@{ "type": "control" } as warehouseReportExcel.js
    participant Summary@{ "type": "control" } as goodsReceiptReportSummary.js

    Excel->>Data: buildGoodsReceiptReportData(continuación del generador)
    Data->>Summary: createMonthlyGoodsReceiptSummary()
    Summary-->>Data: createMonthlyGoodsReceiptSummary(): acumulador add y finish
    loop Por cada partida obtenida de la consulta
        Data->>Summary: add(row)
        Data-->>Excel: buildGoodsReceiptReportData(): fila de detalle y fórmulas
    end
    Data->>Summary: finish()
    Summary-->>Data: finish(): resúmenes y totales
    Data-->>Excel: buildGoodsReceiptReportData(): filas de resumen y fórmulas
```


La consulta y el adaptador Excel devuelven generadores. Sus cuerpos se ejecutan al
consumirlos desde `sendExcelReport`; el listado se recorre por lotes, sin conteos,
y el resumen acumula las filas del mismo recorrido. No se materializa todo el detalle.
