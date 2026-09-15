<a id="cu-ida-03"></a>
# `CU-IDA-03` — Editar persona

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/pages/admin/persons/personModal.js
    participant Application as src/public/js/application/admin/persons/persons.js
    participant Request as src/public/js/services/admin/personService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/personApiRoute.js<br/>src/controllers/api/admin/personController.js
    Note over Application,Transport: Variables de frontera: id, formData/payload

    Browser->>View: personModal.js precarga la persona seleccionada
    View->>View: recopilar y validar las variables de frontera indicadas
    View->>Application: updatePerson({ id, formData })
    Application->>Request: updatePersonRequest({ id, formData })
    activate Application
    Request->>HTTP: apiRequest({ method: 'put', url, data/params })
    HTTP->>Transport: envía PUT /api/admin/persons/:id
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

<a id="cu-ida-05"></a>
