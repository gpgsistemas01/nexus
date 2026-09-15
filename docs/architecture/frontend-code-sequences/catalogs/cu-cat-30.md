<a id="cu-cat-30"></a>
# `CU-CAT-30` — Consultar estados de cumplimiento

**Patrones:** `FE-P03`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/plugins/select2/domains/fulfillmentStatus.js
    participant Application as src/public/js/application/warehouse/catalogs/fulfillmentStatuses.js
    participant Request as src/public/js/services/warehouse/fulfillmentStatusService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/fulfillmentStatusApiRoute.js<br/>src/controllers/api/warehouse/fulfillmentStatusController.js
    Note over Application,Transport: Variables de frontera: params/filtros

    Browser->>View: Estado visible en tablas y formularios de salidas
    View->>View: recopilar y validar las variables de frontera indicadas
    View->>Application: getAllFulfillmentStatuses({ params })
    Application->>Request: getAllFulfillmentStatusesRequest({ params })
    activate Application
    Request->>HTTP: apiRequest({ method: 'get', url, data/params })
    HTTP->>Transport: consume GET /api/warehouse/fulfillment-statuses
    Transport-->>HTTP: status HTTP y payload del endpoint
    HTTP-->>Request: respuesta o error normalizado
    Request-->>Application: resultado del request
    alt Respuesta exitosa
        Application-->>View: entidad, colección o archivo normalizado
        View-->>Browser: actualizar la vista con el resultado
    else Respuesta rechazada
        Application-->>View: error normalizado por apiRequest
        View-->>Browser: conservar contexto y mostrar el mensaje
    end
    deactivate Application
```




<a id="cu-cat-31"></a>
