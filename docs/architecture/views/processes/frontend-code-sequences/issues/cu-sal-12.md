<a id="cu-sal-12"></a>
# `CU-SAL-12` — Surtir merma

**Patrones:** `FE-P05`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`wasteIssueForm.js`](../../../../../../src/public/js/pages/warehouse/wasteIssues/wasteIssueForm.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`wasteIssueService.js`](../../../../../../src/public/js/services/warehouse/wasteIssueService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`wasteIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteIssueApiRoute.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |
| `WarehouseInventoryUtils` | control | [`warehouseInventoryUtils.js`](../../../../../../src/public/js/utils/warehouseInventoryUtils.js) |

### Configuración y archivos de contexto

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-SAL-12`](../../backend-code-sequences/issues/cu-sal-12.md#cu-sal-12): [`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js).

La aplicación ejecuta closures de `createCrudApplication.js`, configuradas por [`wasteIssues.js`](../../../../../../src/public/js/application/warehouse/wasteIssues/wasteIssues.js) mediante [`createIssueApplication.js`](../../../../../../src/public/js/application/warehouse/issues/createIssueApplication.js). Estos archivos de construcción no añaden delegaciones por petición.

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla JS
    participant FormUtils@{ "type": "control" } as Form helpers
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    participant WarehouseInventoryUtils@{ "type": "control" } as warehouseInventoryUtils.js

    Initiator->>Browser: inicia CU-SAL-12 — Surtir merma
    Browser->>View: Acción Surtir dentro de los detalles de merma
    View->>WarehouseInventoryUtils: mapIssueDetailsToSupplyRequest(details)
    WarehouseInventoryUtils-->>View: mapIssueDetailsToSupplyRequest(): Object[]
    View->>FormUtils: validateDetailsFields(issueProjectQuantityDetailsValidation,<br/>mapIssueDetailsToSupplyRequest(details))
    FormUtils-->>View: validateDetailsFields(): Object
    loop Cada detalle seleccionado
        View->>FormUtils: validateFields(issueProjectQuantityDetailsValidation, detail)
        FormUtils-->>View: validateFields(): Object — errores por campo
    end
    alt No hay detalle seleccionado o alguna cantidad es inválida
        View-->>Browser: useForm.getErrors() conserva datos y muestra el error por detalle
    else Detalles de surtimiento válidos
        View->>Application: editWasteIssueDetails({ id, formData })
        activate Application
        Application->>Request: editWasteIssueDetailsRequest({ id, data: formData })
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>Transport: enviar PATCH /api/warehouse/waste-issues/:id/details
        activate Transport
        Transport-->>HTTP: HTTP 200 { wasteIssue, code }
        deactivate Transport
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: editWasteIssueDetailsRequest(): Promise[AxiosResponse]
        alt Respuesta exitosa
            Application-->>View: editWasteIssueDetails(): Promise[{ message: string, data: WasteIssue }]
            View-->>Browser: DOM o DataTable actualizado con response.data
        else Respuesta rechazada
            Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
            View-->>Browser: formulario o filtros conservados, mensaje visible
        end
        deactivate Application
    end
```
