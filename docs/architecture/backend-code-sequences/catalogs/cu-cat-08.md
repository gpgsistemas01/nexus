<a id="cu-cat-08"></a>
# `CU-CAT-08` — Generar reporte de clientes

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

