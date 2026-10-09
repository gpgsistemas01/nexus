<a id="cu-cat-08"></a>
# `CU-CAT-08` — Generar reporte de clientes

**Patrones:** `BE-P07`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Route` | boundary | [`reportApiRoute.js`](../../../../../../src/routes/api/sales/reportApiRoute.js) |
| `Controller` | control | [`reportController.js`](../../../../../../src/controllers/api/sales/reportController.js) |
| `Query` | control | [`clientService.js`](../../../../../../src/services/sales/clientService.js) |
| `Excel` | control | [`reportExcelUtils.js`](../../../../../../src/utils/reportExcelUtils.js) |
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
    participant Query@{ "type": "control" } as Consulta de dominio
    participant Excel@{ "type": "control" } as Reporte Excel
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: GET /api/sales/reports/clients/excel

    Route->>Auth: verifyApiTokenRequired(req, res, next)
    activate Auth
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    deactivate Auth
    Route->>Auth: authorizeUserApi(PERMISSIONS.CLIENT_REPORTS_READ)(req, res, next)
    activate Auth
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    deactivate Auth
    Route->>Controller: exportClientReport(req, res)
    activate Controller
    Controller->>Query: clientService.findAllClients({ advisorId: req.query.advisorId || null, skip: 0, take: 0, search: getDataTableSearch(req.query), orderBy, orderDir })
    activate Query
    alt Servicio resuelto
        Query-->>Controller: clientService.findAllClients(): Promise[{ data: Client[], recordsTotal: number, recordsFiltered: number }]
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

