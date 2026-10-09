<a id="cu-alm-20"></a>
# `CU-ALM-20` — Retirar consumible

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`materialInventoryActions.js`](../../../../../../src/public/js/plugins/datatable/shared/inventory/materialInventoryActions.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`consumableService.js`](../../../../../../src/public/js/services/warehouse/consumableService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`consumableApiRoute.js`](../../../../../../src/routes/api/warehouse/consumableApiRoute.js) |
| `RowData` | control | [`rowData.js`](../../../../../../src/public/js/plugins/datatable/core/responsive/rowData.js) |

### Configuración y archivos de contexto

El adaptador configura `bindMaterialInventoryActions({ table, resource, remove, ... })`; el callback de retirada se ejecuta en la línea `View`: [`consumableDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/consumables/consumableDatatable.js).

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ALM-20`](../../backend-code-sequences/catalogs/cu-alm-20.md#cu-alm-20): [`consumableController.js`](../../../../../../src/controllers/api/warehouse/consumableController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`consumables.js`](../../../../../../src/public/js/application/warehouse/consumables/consumables.js); exportar esa función no crea otra llamada durante cada petición.

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla JS
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    participant RowData@{ "type": "control" } as Fila responsive

    Initiator->>Browser: inicia CU-ALM-20 — Retirar consumible
    Browser->>View: solicita retirar la fila proveedor-consumible
    View->>RowData: getResponsiveRowData(table, this) obtiene data.id de SupplierMaterial
    RowData-->>View: getResponsiveRowData(): Object
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
