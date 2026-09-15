<a id="cu-cat-28"></a>
# `CU-CAT-28` — Consultar unidades de medida

**Patrones:** `FE-P03`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/plugins/select2/domains/unitMeasure.js
    participant Application as src/public/js/application/warehouse/catalogs/unitMeasures.js
    participant Request as src/public/js/services/warehouse/unitMeasureService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/unitMeasureApiRoute.js<br/>src/controllers/api/warehouse/unitMeasureController.js
    Note over Application,Transport: Variables de frontera: params/filtros

    Browser->>View: Select de unidad en formularios de material y merma
    View->>View: recopilar y validar las variables de frontera indicadas
    View->>Application: getAllUnitMeasures({ params })
    Application->>Request: getAllUnitMeasuresRequest({ params })
    activate Application
    Request->>HTTP: apiRequest({ method: 'get', url, data/params })
    HTTP->>Transport: consume GET /api/warehouse/unit-measures
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

<a id="cu-cat-29"></a>
