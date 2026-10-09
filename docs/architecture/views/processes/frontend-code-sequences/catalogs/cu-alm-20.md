<a id="cu-alm-20"></a>
# `CU-ALM-20` — Retirar consumible

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `View` | boundary | [`consumableDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/consumables/consumableDatatable.js)<br/>[`materialInventoryActions.js`](../../../../../../src/public/js/plugins/datatable/shared/inventory/materialInventoryActions.js) |
| `Application` | control | [`consumables.js`](../../../../../../src/public/js/application/warehouse/consumables/consumables.js) |
| `Request` | boundary | [`consumableService.js`](../../../../../../src/public/js/services/warehouse/consumableService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`consumableApiRoute.js`](../../../../../../src/routes/api/warehouse/consumableApiRoute.js)<br/>[`consumableController.js`](../../../../../../src/controllers/api/warehouse/consumableController.js) |

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

    Initiator->>Browser: inicia CU-ALM-20 — Retirar consumible
    Browser->>View: solicita retirar la fila proveedor-consumible
    View->>View: getResponsiveRowData(table, this) obtiene data.id de SupplierMaterial
    View->>View: notifications.showConfirmation({ title, text, confirmButtonText: 'Eliminar' })
    break [confirmación cancelada]
        View-->>Browser: conservar registro sin enviar DELETE
    end
    View->>Application: deleteConsumable({ id: data.id })
    activate Application
    Application->>Request: deleteConsumableRequest({ id })
    Request->>HTTP: apiRequest({ method: 'delete', url })
    HTTP->>Transport: envía DELETE /api/warehouse/consumables/:id
    activate Transport
    Transport-->>HTTP: HTTP 200 { material, code }
    deactivate Transport
    HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
    Request-->>Application: deleteConsumableRequest(): Promise[AxiosResponse]
    alt Respuesta exitosa
        Application-->>View: deleteConsumable(): Promise[{ message: string }]
        View-->>Browser: table.ajax.reload(null, false) después de guardar
    else Respuesta rechazada
        Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```
