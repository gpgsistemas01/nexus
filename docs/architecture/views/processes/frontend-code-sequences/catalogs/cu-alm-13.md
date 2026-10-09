<a id="cu-alm-13"></a>
# `CU-ALM-13` — Agregar existencia de merma

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `EJS` | boundary | [`wastesPage.ejs`](../../../../../../src/views/pages/warehouse/wastes/wastesPage.ejs) |
| `Page` | boundary | [`wastesPage.js`](../../../../../../src/public/js/pages/warehouse/wastes/wastesPage.js) |
| `Table` | boundary | [`wasteDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/wastes/wasteDatatable.js) |
| `Modal` | boundary | [`wasteStockAdditionModal.js`](../../../../../../src/public/js/pages/warehouse/wastes/wasteStockAdditionModal.js) |
| `Form` | boundary | [`wasteStockAdditionForm.js`](../../../../../../src/public/js/pages/warehouse/wastes/wasteStockAdditionForm.js) |
| `Application` | control | [`wastes.js`](../../../../../../src/public/js/application/warehouse/wastes/wastes.js) |
| `Request` | boundary | [`wasteService.js`](../../../../../../src/public/js/services/warehouse/wasteService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`wasteApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteApiRoute.js)<br/>[`wasteController.js`](../../../../../../src/controllers/api/warehouse/wasteController.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant EJS@{ "type": "boundary" } as Plantilla EJS
    participant Page@{ "type": "boundary" } as Entry point
    participant Table@{ "type": "boundary" } as DataTable
    participant Modal@{ "type": "boundary" } as Modal
    participant Form@{ "type": "boundary" } as useForm
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-ALM-13 — Agregar existencia de merma
    EJS->>Page: import wastesPage.js mediante script type=module
    Page->>Modal: import openWasteStockAdditionModal
    Page->>Form: import wasteStockAdditionForm.js y registra useForm
    Page->>Table: createWasteDatatable({ context, openWasteModal, openWasteStockAdditionModal })
    Browser->>Table: selecciona Agregar stock en una merma
    Table->>Modal: openWasteStockAdditionModal({ data })
    Modal-->>Browser: muestra identidad, existencia actual, quantity y observations
    Browser->>Form: confirma wasteStockAdditionForm
    Form->>Form: validateFields(wasteStockAdditionValidation, { quantity, observations })
    alt wasteStockAdditionValidation devuelve errores
        Form-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        Form->>Application: addWasteStock({ id, formData })
        activate Application
        Application->>Request: addWasteStockRequest({ id, formData })
        Request->>HTTP: apiRequest({ method: 'post', url, data })
        HTTP->>Transport: envía POST /api/warehouse/wastes/:id/stock-additions
        alt Respuesta exitosa
            Transport-->>HTTP: HTTP 2xx — respuesta del endpoint
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: addWasteStockRequest(): Promise[AxiosResponse]
            Application-->>Form: addWasteStock(): Promise[{ message: string, data: Waste }]
            Form-->>Browser: DOM o DataTable actualizado con response.data
        else Respuesta rechazada
            Transport-->>HTTP: HTTP de error — respuesta del endpoint
            HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Request-->>Application: throw { status: number, data: Object | null, message: string, raw: Error }
            Application-->>Form: throw { status: number, data: Object | null, message: string, raw: Error }
            Form-->>Browser: formulario o filtros conservados, mensaje visible
        end
        deactivate Application
    end
```
