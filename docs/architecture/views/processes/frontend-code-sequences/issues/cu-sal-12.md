<a id="cu-sal-12"></a>
# `CU-SAL-12` — Surtir merma

**Patrones:** `FE-P05`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `View` | boundary | [`wasteIssueForm.js`](../../../../../../src/public/js/pages/warehouse/wasteIssues/wasteIssueForm.js) |
| `Application` | control | [`wasteIssues.js`](../../../../../../src/public/js/application/warehouse/wasteIssues/wasteIssues.js) |
| `Request` | boundary | [`wasteIssueService.js`](../../../../../../src/public/js/services/warehouse/wasteIssueService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`wasteIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteIssueApiRoute.js)<br/>[`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js) |

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

    Initiator->>Browser: inicia CU-SAL-12 — Surtir merma
    Browser->>View: Acción Surtir dentro de los detalles de merma
    View->>View: mapIssueDetailsToSupplyRequest(details)
    View->>View: validateDetailsFields(issueProjectQuantityDetailsValidation,<br/>mapIssueDetailsToSupplyRequest(details))
    loop Cada detalle seleccionado
        View->>View: validateFields(issueProjectQuantityDetailsValidation, detail)
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
