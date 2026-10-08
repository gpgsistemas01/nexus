<a id="cu-ida-03"></a>
# `CU-IDA-03` — Editar persona

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as src/public/js/pages/admin/persons/personModal.js<br/>src/public/js/pages/admin/persons/personForm.js
    participant Application@{ "type": "control" } as src/public/js/application/admin/persons/persons.js
    participant Request as src/public/js/services/admin/personService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/personApiRoute.js<br/>src/controllers/api/admin/personController.js

    Initiator->>Browser: inicia CU-IDA-03 — Editar persona
    Browser->>View: personModal.js precarga la persona seleccionada
    View->>View: validateFields(personValidation, formData)
    alt personValidation devuelve errores
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        View->>Application: updatePerson({ id, formData })
        Application->>Request: updatePersonRequest({ id, formData })
        activate Application
        Request->>HTTP: apiRequest({ method: 'put', url, data })
        HTTP->>Transport: envía PUT /api/admin/persons/:id
        Transport-->>HTTP: HTTP 2xx { code, data }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: updatePersonRequest(): Promise[AxiosResponse]
        alt Respuesta exitosa
            Application-->>View: updatePerson(): Promise[{ message: string, data: Person }]
            View-->>Browser: DOM o DataTable actualizado con response.data
        else Respuesta rechazada
            Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
            View-->>Browser: formulario o filtros conservados, mensaje visible
        end
        deactivate Application
    end
```

