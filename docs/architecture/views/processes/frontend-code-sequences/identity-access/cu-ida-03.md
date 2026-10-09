<a id="cu-ida-03"></a>
# `CU-IDA-03` — Editar persona

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `View` | boundary | [`personModal.js`](../../../../../../src/public/js/pages/admin/persons/personModal.js)<br/>[`personForm.js`](../../../../../../src/public/js/pages/admin/persons/personForm.js) |
| `Application` | control | [`persons.js`](../../../../../../src/public/js/application/admin/persons/persons.js) |
| `Request` | boundary | [`personService.js`](../../../../../../src/public/js/services/admin/personService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`personApiRoute.js`](../../../../../../src/routes/api/admin/personApiRoute.js)<br/>[`personController.js`](../../../../../../src/controllers/api/admin/personController.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla / formulario
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-IDA-03 — Editar persona
    Browser->>View: personModal.js precarga la persona seleccionada
    View->>View: validateFields(personValidation, formData)
    alt personValidation devuelve errores
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        View->>Application: updatePerson({ id, formData })
        activate Application
        Application->>Request: updatePersonRequest({ id, formData })
        Request->>HTTP: apiRequest({ method: 'put', url, data })
        HTTP->>Transport: envía PUT /api/admin/persons/:id
        alt Respuesta exitosa
            Transport-->>HTTP: HTTP 200 { datos y código de operación }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: updatePersonRequest(): Promise[AxiosResponse]
            Application-->>View: updatePerson(): Promise[{ message: string, data: Person }]
            View-->>Browser: DOM o DataTable actualizado con response.data
        else Respuesta rechazada
            Transport-->>HTTP: HTTP de error — respuesta del endpoint
            HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Request-->>Application: throw { status: number, data: Object | null, message: string, raw: Error }
            Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
            View-->>Browser: formulario o filtros conservados, mensaje visible
        end
        deactivate Application
    end
```

