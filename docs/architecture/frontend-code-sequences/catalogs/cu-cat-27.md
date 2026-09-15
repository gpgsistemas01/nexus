<a id="cu-cat-27"></a>
# `CU-CAT-27` — Consultar presentaciones

**Patrones:** `FE-P03`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/pages/warehouse/materials/materialFields.js<br/>src/public/js/pages/warehouse/wastes/wasteFields.js
    participant Application as src/public/js/application/warehouse/catalogs/presentations.js
    participant Request as src/public/js/services/warehouse/presentationService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/presentationApiRoute.js<br/>src/controllers/api/warehouse/presentationController.js
    Note over Application,Transport: Variables de frontera: params/filtros

    Browser->>View: Select de presentación en materialFields.js y wasteFields.js
    View->>View: recopilar y validar las variables de frontera indicadas
    View->>Application: getAllPresentations({ params })
    Application->>Request: getAllPresentationsRequest({ params })
    activate Application
    Request->>HTTP: apiRequest({ method: 'get', url, data/params })
    HTTP->>Transport: consume GET /api/warehouse/presentations
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

<a id="cu-cat-28"></a>
