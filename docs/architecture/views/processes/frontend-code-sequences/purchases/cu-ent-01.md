<a id="cu-ent-01"></a>
# `CU-ENT-01` — Consultar compras de material

**Patrones:** `FE-P02`, `FE-P04`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`goodsReceiptDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/goodsReceipts/goodsReceiptDatatable.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`createGoodsReceiptRequests.js`](../../../../../../src/public/js/services/warehouse/goodsReceipts/createGoodsReceiptRequests.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`materialGoodsReceiptApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsReceipts/materials/materialGoodsReceiptApiRoute.js) |
| `TableCore` | control | [`createDataTable.js`](../../../../../../src/public/js/plugins/datatable/core/base/createDataTable.js) |

### Configuración y archivos de contexto

Estos módulos seleccionan/configuran y exportan la función de aplicación. Su cuerpo se ejecuta en la fábrica de la línea `Application`, sin una llamada intermedia entre reexports: [`goodsReceipts.js`](../../../../../../src/public/js/application/warehouse/goodsReceipts/goodsReceipts.js), [`materialGoodsReceipts.js`](../../../../../../src/public/js/application/warehouse/goodsReceipts/materials/materialGoodsReceipts.js).

Estos módulos configuran o reexportan el request. La función que llama a `apiRequest` está definida en el archivo de la línea `Request`: [`materialGoodsReceiptService.js`](../../../../../../src/public/js/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js).

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ENT-01`](../../backend-code-sequences/purchases/cu-ent-01.md#cu-ent-01): [`materialGoodsReceiptController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptController.js).

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla JS
    participant TableCore@{ "type": "control" } as Núcleo DataTable
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

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
        HTTP-->>Request: error normalizado
        Request-->>Application: error propagado
        Application-->>TableCore: error propagado
        TableCore->>Browser: handleDataTableError(error)
        TableCore->>Browser: callback({ data: [], recordsTotal: 0, recordsFiltered: 0 })
    end
```
