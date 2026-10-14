<a id="cu-alm-20"></a>
# `CU-ALM-20` — Retirar consumible

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`materialInventoryActions.js`](../../../../../../src/public/js/plugins/datatable/shared/inventory/materialInventoryActions.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`consumableService.js`](../../../../../../src/public/js/services/warehouse/consumableService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`consumableApiRoute.js`](../../../../../../src/routes/api/warehouse/consumableApiRoute.js) |
| `RowData` | control | [`rowData.js`](../../../../../../src/public/js/plugins/datatable/core/responsive/rowData.js) |
| `FileSwalComponent` | control | [`swalComponent.js`](../../../../../../src/public/js/plugins/swal/swalComponent.js) |
| `FileResponseUtils` | control | [`responseUtils.js`](../../../../../../src/public/js/utils/responseUtils.js) |
| `FileApiMessages` | control | [`apiMessages.js`](../../../../../../src/public/js/constants/apiMessages.js) |
| `FileConsumableController` | control | [`consumableController.js`](../../../../../../src/controllers/api/warehouse/consumableController.js) |
| `FileConsumables` | control | [`consumables.js`](../../../../../../src/public/js/application/warehouse/consumables/consumables.js) |
| `FileConsumableDatatable` | control | [`consumableDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/consumables/consumableDatatable.js) |

### Configuración y construcción

El adaptador configura `bindMaterialInventoryActions({ table, resource, remove, ... })`; el callback de retirada se ejecuta en la línea `View`: [`consumableDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/consumables/consumableDatatable.js).

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ALM-20`](../../backend-code-sequences/catalogs/cu-alm-20.md#cu-alm-20): [`consumableController.js`](../../../../../../src/controllers/api/warehouse/consumableController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`consumables.js`](../../../../../../src/public/js/application/warehouse/consumables/consumables.js); exportar esa función no crea otra llamada durante cada petición.

Las llamadas internas de los helpers se amplían una vez en las
[colaboraciones CRUD compartidas](../../shared-runtime-behavior/03-crud-helper-collaborations.md). Sus archivos siguen representados
por separado en las figuras y la tabla de este caso.

## Composición de archivos

Los archivos que construyen, configuran o reexportan funciones aparecen como componentes
individuales. Las flechas representan imports reales, resueltos al cargar los módulos;
las llamadas durante la operación se muestran en las secuencias siguientes. Cada nombre
identifica un archivo y la tabla conserva su ruta completa.

```mermaid
flowchart TB
    subgraph Component0["Backend"]
        FileConsumableController["consumableController.js"]
        Transport["consumableApiRoute.js"]
    end
    subgraph Component1["Aplicación y requests"]
        Application["createCrudApplication.js"]
        FileConsumables["consumables.js"]
        Request["consumableService.js"]
    end
    subgraph Component2["Interfaz"]
        FileApiMessages["apiMessages.js"]
        View["materialInventoryActions.js"]
        FileConsumableDatatable["consumableDatatable.js"]
        FileResponseUtils["responseUtils.js"]
    end
    FileConsumables -->|import| Request
    FileConsumables -->|import| Application
    FileConsumableDatatable -->|import| FileConsumables
    FileConsumableDatatable -->|import| View
    FileResponseUtils -->|import| FileApiMessages
    Transport -->|import| FileConsumableController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `deleteConsumable` | `FileConsumables` | `Application` · `createCrudApplication(...)` |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as materialInventoryActions.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Request@{ "type": "boundary" } as consumableService.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as consumableApiRoute.js

    participant RowData@{ "type": "control" } as rowData.js

    participant FileSwalComponent@{ "type": "control" } as swalComponent.js

    participant FileResponseUtils@{ "type": "control" } as responseUtils.js

    Initiator->>Browser: inicia CU-ALM-20 — Retirar consumible
    Browser->>View: solicita retirar la fila proveedor-consumible
    View->>RowData: getResponsiveRowData(table, this) obtiene data.id de SupplierMaterial
    RowData-->>View: getResponsiveRowData(): Object
    View->>FileSwalComponent: notifications.showConfirmation({ title, text, confirmButtonText: 'Eliminar' })
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
    Application->>FileResponseUtils: createSuccessResponseFromRequest({ response, dataKey })
    FileResponseUtils-->>Application: createSuccessResponseFromRequest(): Object — detalle transversal CRUD
    alt Respuesta exitosa
        Application-->>View: deleteConsumable(): Promise[{ message: string }]
        View-->>Browser: table.ajax.reload(null, false) después de guardar
    else Respuesta rechazada
        Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```
