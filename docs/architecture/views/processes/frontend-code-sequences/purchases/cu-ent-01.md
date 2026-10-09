<a id="cu-ent-01"></a>
# `CU-ENT-01` — Consultar compras de material

**Patrones:** `FE-P02`, `FE-P04`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`goodsReceiptDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/goodsReceipts/goodsReceiptDatatable.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`createGoodsReceiptRequests.js`](../../../../../../src/public/js/services/warehouse/goodsReceipts/createGoodsReceiptRequests.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`materialGoodsReceiptApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsReceipts/materials/materialGoodsReceiptApiRoute.js) |
| `TableCore` | control | [`createDataTable.js`](../../../../../../src/public/js/plugins/datatable/core/base/createDataTable.js) |
| `FileErrorHandler` | control | [`errorHandler.js`](../../../../../../src/public/js/api/errorHandler.js) |
| `FileMaterialGoodsReceiptController` | control | [`materialGoodsReceiptController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptController.js) |
| `FileConsumableGoodsReceipts` | control | [`consumableGoodsReceipts.js`](../../../../../../src/public/js/application/warehouse/goodsReceipts/consumables/consumableGoodsReceipts.js) |
| `FileGoodsReceipts` | control | [`goodsReceipts.js`](../../../../../../src/public/js/application/warehouse/goodsReceipts/goodsReceipts.js) |
| `FileMaterialGoodsReceipts` | control | [`materialGoodsReceipts.js`](../../../../../../src/public/js/application/warehouse/goodsReceipts/materials/materialGoodsReceipts.js) |
| `FileConsumableGoodsReceiptService` | control | [`consumableGoodsReceiptService.js`](../../../../../../src/public/js/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js) |
| `FileMaterialGoodsReceiptService` | control | [`materialGoodsReceiptService.js`](../../../../../../src/public/js/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js) |
| `FileUtils` | control | [`utils.js`](../../../../../../src/public/js/api/utils.js) |
| `FileGoodsReceiptContext` | control | [`goodsReceiptContext.js`](../../../../../../src/public/js/pages/warehouse/goodsReceipts/goodsReceiptContext.js) |

### Configuración y construcción

Estos módulos seleccionan/configuran y exportan la función de aplicación. Su cuerpo se ejecuta en la fábrica de la línea `Application`, sin una llamada intermedia entre reexports: [`goodsReceipts.js`](../../../../../../src/public/js/application/warehouse/goodsReceipts/goodsReceipts.js), [`materialGoodsReceipts.js`](../../../../../../src/public/js/application/warehouse/goodsReceipts/materials/materialGoodsReceipts.js).

Estos módulos configuran o reexportan el request. La función que llama a `apiRequest` está definida en el archivo de la línea `Request`: [`materialGoodsReceiptService.js`](../../../../../../src/public/js/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js).

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ENT-01`](../../backend-code-sequences/purchases/cu-ent-01.md#cu-ent-01): [`materialGoodsReceiptController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptController.js).

## Composición de archivos

Los archivos que construyen, configuran o reexportan funciones aparecen como componentes
individuales. Las flechas representan imports reales, resueltos al cargar los módulos;
las llamadas durante la operación se muestran en las secuencias siguientes. Cada nombre
identifica un archivo y la tabla conserva su ruta completa.

```mermaid
flowchart TB
    subgraph Component0["Backend"]
        FileMaterialGoodsReceiptController["materialGoodsReceiptController.js"]
        Transport["materialGoodsReceiptApiRoute.js"]
    end
    subgraph Component1["Aplicación y requests"]
        Application["createCrudApplication.js"]
        FileConsumableGoodsReceipts["consumableGoodsReceipts.js"]
        FileGoodsReceipts["goodsReceipts.js"]
        FileMaterialGoodsReceipts["materialGoodsReceipts.js"]
        FileConsumableGoodsReceiptService["consumableGoodsReceiptService.js"]
        Request["createGoodsReceiptRequests.js"]
        FileMaterialGoodsReceiptService["materialGoodsReceiptService.js"]
    end
    subgraph Component2["Interfaz"]
        FileGoodsReceiptContext["goodsReceiptContext.js"]
        View["goodsReceiptDatatable.js"]
    end
    FileConsumableGoodsReceipts -->|import| FileConsumableGoodsReceiptService
    FileConsumableGoodsReceipts -->|import| Application
    FileGoodsReceipts -->|import| FileMaterialGoodsReceipts
    FileGoodsReceipts -->|import| FileConsumableGoodsReceipts
    FileGoodsReceipts -->|import| FileGoodsReceiptContext
    FileMaterialGoodsReceipts -->|import| FileMaterialGoodsReceiptService
    FileMaterialGoodsReceipts -->|import| Application
    View -->|import| FileGoodsReceipts
    FileConsumableGoodsReceiptService -->|import| Request
    FileMaterialGoodsReceiptService -->|import| Request
    Transport -->|import| FileMaterialGoodsReceiptController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `getAllMaterialGoodsReceiptsRequest` | `FileMaterialGoodsReceiptService` | `Request` · `createGoodsReceiptRequests(...)` |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as goodsReceiptDatatable.js
    participant TableCore@{ "type": "control" } as createDataTable.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Request@{ "type": "boundary" } as createGoodsReceiptRequests.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as materialGoodsReceiptApiRoute.js

    participant FileErrorHandler@{ "type": "control" } as errorHandler.js

    participant FileUtils@{ "type": "control" } as utils.js

    Note over Application: Closure configurada

    Note over Request: Request configurado

    Initiator->>Browser: inicia CU-ENT-01 — Consultar compras de material
    Browser->>View: createGoodsReceiptDatatable(...) y aplicar filtros
    View->>TableCore: createDataTable({ options: { ajax: { get: getAllGoodsReceipts }, columns } })
    TableCore-->>View: createDataTable(): DataTable.Api
    Note over TableCore: El callback ajax del núcleo ejecuta options.ajax.get(params)
    TableCore->>Application: getAllGoodsReceipts(params)
    Application->>Request: getAllMaterialGoodsReceiptsRequest({ params })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: GET /api/warehouse/goods-receipts/materials
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 200 { data, recordsTotal, recordsFiltered }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: getAllMaterialGoodsReceiptsRequest(): Promise[AxiosResponse]
        Application-->>TableCore: getAllGoodsReceipts(): Promise[AxiosResponse]
        TableCore->>Browser: callback(response.data) — filas y conteos de DataTable
    else Error HTTP o de dominio
        Transport-->>HTTP: HTTP de error { code, message }
        opt No se inicia renovación: status distinto de 401 o request._retry
            HTTP->>FileUtils: normalizeHttpError(err)
            FileUtils-->>HTTP: normalizeHttpError(): Object — status, data, message, raw
        end
        HTTP-->>Request: error normalizado
        Request-->>Application: error propagado
        Application-->>TableCore: error propagado
        TableCore->>FileErrorHandler: handleDataTableError(error)
        TableCore->>Browser: callback({ data: [], recordsTotal: 0, recordsFiltered: 0 })
    end
```
