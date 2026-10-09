<a id="cu-cat-07"></a>
# `CU-CAT-07` — Editar cliente

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`clientModal.js`](../../../../../../src/public/js/pages/sales/clients/clientModal.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`clientService.js`](../../../../../../src/public/js/services/sales/clientService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`clientApiRoute.js`](../../../../../../src/routes/api/sales/clientApiRoute.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |

### Configuración y archivos de contexto

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-CAT-07`](../../backend-code-sequences/catalogs/cu-cat-07.md#cu-cat-07): [`clientController.js`](../../../../../../src/controllers/api/sales/clientController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`clients.js`](../../../../../../src/public/js/application/sales/clients/clients.js); exportar esa función no crea otra llamada durante cada petición.

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla JS
    participant FormUtils@{ "type": "control" } as Form helpers
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-CAT-07 — Editar cliente
    Browser->>View: clientModal.js precarga el cliente
    View->>FormUtils: validateFields(clientValidation, formData)
    FormUtils-->>View: validateFields(): Object — errores por campo
    alt clientValidation devuelve errores
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        View->>Application: editClient({ id, formData })
        activate Application
        Application->>Request: editClientRequest({ id, formData })
        Request->>HTTP: apiRequest({ method: 'put', url, data })
        HTTP->>Transport: envía PUT /api/sales/clients/:id
        alt Respuesta exitosa
            Transport-->>HTTP: HTTP 200 { client, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: editClientRequest(): Promise[AxiosResponse]
            Application-->>View: editClient(): Promise[{ message: string, data: Client }]
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

