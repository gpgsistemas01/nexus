<a id="cu-ida-01"></a>
# `CU-IDA-01` — Consultar personas

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as src/views/pages/admin/persons/personsPage.ejs<br/>src/public/js/pages/admin/persons/personsPage.js
    participant Application@{ "type": "control" } as src/public/js/application/admin/persons/persons.js
    participant Request as src/public/js/services/admin/personService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/personApiRoute.js<br/>src/controllers/api/admin/personController.js

    Initiator->>Browser: inicia CU-IDA-01 — Consultar personas
    Browser->>View: personsPage.ejs y personsPage.js cargan la tabla
    View->>Application: getAllPersons({ params })
    Application->>Request: getAllPersonsRequest({ params })
    activate Application
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: consulta GET /api/admin/persons
    Transport-->>HTTP: HTTP 2xx { code, data }
    HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
    Request-->>Application: getAllPersonsRequest(): Promise[AxiosResponse]
    alt Respuesta exitosa
        Application-->>View: getAllPersons(): Promise[AxiosResponse]
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```

