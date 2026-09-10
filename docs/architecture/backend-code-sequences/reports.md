# Secuencias del código backend: Consultas y reportes

Este capítulo forma parte del [catálogo de secuencias del código backend](index.md) y conserva los recorridos aplicados del grupo `REP`. Las reglas comunes de lectura, trazabilidad y mantenimiento se declaran en el índice de la colección.

<a id="cu-rep-01"></a>
## `CU-REP-01` — Consultar inventario de materiales

**Patrones:** `BE-P06`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/materialApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/materialController.js
    participant Domain as src/services/warehouse/materials/materialService.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/materials
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: getAllMaterials(req, res)
    activate Controller
    Controller->>Domain: findAllMaterials({ query: req.query })
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

<a id="cu-rep-02"></a>
## `CU-REP-02` — Consultar movimientos de materiales

**Patrones:** `BE-P06`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/movementApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/movementController.js
    participant Domain as src/services/inventory/movementQueryService.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/movements/materials
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: getAllMaterialMovements(req, res)
    activate Controller
    Controller->>Domain: findAllMaterialMovements(getMovementListParams(req))
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

<a id="cu-rep-03"></a>
## `CU-REP-03` — Generar reporte de inventario de materiales

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/reportController.js
    participant Domain as src/services/warehouse/reportService.js<br/>src/utils/reportExcelUtils.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/reports/inventory/excel
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: exportWarehouseReportExcel(req, res)
    activate Controller
    Controller->>Domain: reportService.findWarehouseReportRows({ query: req.query }) y sendExcelReport
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

<a id="cu-rep-04"></a>
## `CU-REP-04` — Generar reporte de salidas de material

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/reportController.js
    participant Domain as src/services/warehouse/reportService.js<br/>src/utils/reportExcelUtils.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/reports/goods-issues/excel
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: exportGoodsIssueReportExcel(req, res)
    activate Controller
    Controller->>Domain: reportService.findGoodsIssueReportRows({ query: req.query }) y sendExcelReport
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

<a id="cu-rep-05"></a>
## `CU-REP-05` — Generar reporte de movimientos de materiales

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/reportController.js
    participant Domain as src/services/inventory/reportService.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/reports/movements/materials/excel
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: exportMovementReport(req, res)
    activate Controller
    Controller->>Domain: findMovementReportRows({ context: 'materials', ...getMovementReportParams(req.query) })
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

<a id="cu-rep-06"></a>
## `CU-REP-06` — Consultar inventario de mermas

**Patrones:** `BE-P06`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/wasteApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/wasteController.js
    participant Domain as src/services/warehouse/wastes/wasteService.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/wastes
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: getAllWastes(req, res)
    activate Controller
    Controller->>Domain: wasteService.findAllWastes({ query: req.query })
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

<a id="cu-rep-07"></a>
## `CU-REP-07` — Consultar movimientos de mermas

**Patrones:** `BE-P06`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/movementApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/movementController.js
    participant Domain as src/services/inventory/movementQueryService.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/movements/wastes
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: getAllWasteMovements(req, res)
    activate Controller
    Controller->>Domain: findAllWasteMovements(getMovementListParams(req))
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

<a id="cu-rep-08"></a>
## `CU-REP-08` — Generar reporte de salidas de merma

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/reportController.js
    participant Domain as src/services/warehouse/reportService.js<br/>src/utils/reportExcelUtils.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/reports/waste-issues/excel
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: exportWasteIssueReportExcel(req, res)
    activate Controller
    Controller->>Domain: reportService.findWasteIssueReportRows({ query: req.query }) y sendExcelReport
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

<a id="cu-rep-09"></a>
## `CU-REP-09` — Generar reporte de mermas

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/reportController.js
    participant Domain as src/services/warehouse/reportService.js<br/>src/utils/reportExcelUtils.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/reports/wastes/excel
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: exportWasteReportExcel(req, res)
    activate Controller
    Controller->>Domain: reportService.findWasteReportRows({ query: req.query }) y sendExcelReport
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

<a id="cu-rep-10"></a>
## `CU-REP-10` — Generar reporte de movimientos de mermas

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/reportController.js
    participant Domain as src/services/inventory/reportService.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/reports/movements/wastes/excel
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: exportWasteMovementReport(req, res)
    activate Controller
    Controller->>Domain: findMovementReportRows({ context: 'wastes', ...getMovementReportParams(req.query) })
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

<a id="cu-rep-11"></a>
## `CU-REP-11` — Generar reporte de compras de material

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/reportController.js
    participant Domain as src/services/warehouse/reportService.js<br/>src/utils/reportExcelUtils.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/reports/goods-receipts/excel
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: exportGoodsReceiptReportExcel(req, res)
    activate Controller
    Controller->>Domain: reportService.findGoodsReceiptReportRows({ query: req.query }) y sendExcelReport
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

<a id="cu-rep-12"></a>
## `CU-REP-12` — Generar reporte de proveedores

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/reportController.js
    participant Domain as src/services/warehouse/reportService.js<br/>src/utils/reportExcelUtils.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/reports/suppliers/excel
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: exportSupplierReportExcel(req, res)
    activate Controller
    Controller->>Domain: reportService.findSupplierReportRows({ query: req.query }) y sendExcelReport
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

<a id="cu-rep-13"></a>
## `CU-REP-13` — Generar reporte de clientes

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/sales/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/sales/reportController.js
    participant Domain as src/services/sales/clientService.js<br/>src/utils/reportExcelUtils.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/sales/reports/clients/excel
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: exportClientReport(req, res)
    activate Controller
    Controller->>Domain: clientService.findAllClients({ query: req.query }) prepara filas y el controller llama sendExcelReport
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

<a id="cu-rep-14"></a>
## `CU-REP-14` — Generar reporte de personas

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/reportController.js
    participant Domain as src/services/admin/person/personService.js<br/>src/utils/reportExcelUtils.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/reports/persons/excel
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: exportPersonReport(req, res)
    activate Controller
    Controller->>Domain: personService.findAllPersons({ query: req.query }) prepara filas y el controller llama sendExcelReport
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

<a id="cu-rep-15"></a>
## `CU-REP-15` — Generar reporte de usuarios

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/reportController.js
    participant Domain as src/services/admin/userService.js<br/>src/utils/reportExcelUtils.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/reports/users/excel
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: exportUserReport(req, res)
    activate Controller
    Controller->>Domain: userService.findAllUsers({ query: req.query }) prepara filas y el controller llama sendExcelReport
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```
