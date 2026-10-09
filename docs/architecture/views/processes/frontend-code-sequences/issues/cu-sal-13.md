<a id="cu-sal-13"></a>
# `CU-SAL-13` — Devolver merma surtida

**Patrones:** `FE-P05`, `FE-P06`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Issue` | boundary | [`wasteIssueReturn.js`](../../../../../../src/public/js/pages/warehouse/wasteIssues/returns/wasteIssueReturn.js) |
| `Return` | boundary | [`issueReturnUI.js`](../../../../../../src/public/js/ui/issues/issueReturnUI.js) |
| `App` | control | [`wasteIssues.js`](../../../../../../src/public/js/application/warehouse/wasteIssues/wasteIssues.js) |
| `Request` | boundary | [`wasteIssueService.js`](../../../../../../src/public/js/services/warehouse/wasteIssueService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `API` | control | [`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant Issue@{ "type": "boundary" } as Salida
    participant Return@{ "type": "boundary" } as Devolución
    participant App@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant API@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-SAL-13 — Devolver merma surtida
    Browser->>Issue: selecciona Devolver en un detalle de merma
    Issue->>Issue: initializeWasteIssueReturns({ details, getIssueId })
    Issue->>Return: wasteIssueReturn.open({ issue: { id }, detail })
    Browser->>Return: captura cantidad y confirma
    Return->>Return: validateFields(issueReturnValidation, formData)
    Return->>App: returnWasteIssueDetail({ id, detailId, formData })
    App->>Request: returnWasteIssueDetailRequest({ id, detailId, data: formData })
    Request->>HTTP: apiRequest({ method: 'patch', url, data })
    HTTP->>API: PATCH /api/warehouse/waste-issues/:id/details/:detailId/returns
    alt Respuesta exitosa
        API-->>HTTP: 200 { wasteIssueReturn, code }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>App: returnWasteIssueDetailRequest(): Promise[AxiosResponse]
        App-->>Return: returnWasteIssueDetail(): Promise[{ message: string, data: WasteIssueReturn }]
        Return->>Issue: window.location.reload()
    else Cantidad inválida, estado incompatible o error HTTP
        API-->>HTTP: status HTTP { code, message }
        HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Request-->>App: returnWasteIssueDetailRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        App-->>Return: returnWasteIssueDetail(): throw { status: number, data: Object | null, message: string, raw: Error }
    end
```
