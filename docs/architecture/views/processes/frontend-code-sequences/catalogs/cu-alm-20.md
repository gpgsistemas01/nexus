<a id="cu-alm-20"></a>
# `CU-ALM-20` — Retirar consumible

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View as src/public/js/plugins/datatable/warehouse/consumables/consumableDatatable.js
    participant Application as src/public/js/application/warehouse/consumables/consumables.js
    participant Request as src/public/js/services/warehouse/consumableService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/consumableApiRoute.js<br/>src/controllers/api/warehouse/consumableController.js

    Initiator->>Browser: inicia CU-ALM-20 — Retirar consumible
    Browser->>View: solicita retirar la fila proveedor-consumible
    View->>View: obtiene data.id (id de SupplierMaterial, no consumible.id)
    View->>Application: deleteConsumable({ id: data.id })
    Application->>Request: deleteConsumableRequest({ id })
    activate Application
    Request->>HTTP: apiRequest({ method: 'delete', url })
    HTTP->>Transport: envía DELETE /api/warehouse/consumables/:id
    Transport-->>HTTP: HTTP 2xx { code, data }
    HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
    Request-->>Application: deleteConsumableRequest(): Promise[AxiosResponse]
    alt Respuesta exitosa
        Application-->>View: deleteConsumable(): Promise[{ message: string }]
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```
