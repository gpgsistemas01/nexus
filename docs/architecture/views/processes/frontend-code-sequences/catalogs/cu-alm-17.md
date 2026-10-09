<a id="cu-alm-17"></a>
# `CU-ALM-17` — Consultar consumibles

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`consumableDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/consumables/consumableDatatable.js) |
| `RowAdapter` | boundary | [`materialRow.js`](../../../../../../src/public/js/plugins/datatable/warehouse/materials/materialRow.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`consumableService.js`](../../../../../../src/public/js/services/warehouse/consumableService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`consumableApiRoute.js`](../../../../../../src/routes/api/warehouse/consumableApiRoute.js) |

### Configuración y archivos de contexto

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ALM-17`](../../backend-code-sequences/catalogs/cu-alm-17.md#cu-alm-17): [`consumableController.js`](../../../../../../src/controllers/api/warehouse/consumableController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`consumables.js`](../../../../../../src/public/js/application/warehouse/consumables/consumables.js); exportar esa función no crea otra llamada durante cada petición.

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla JS
    participant RowAdapter@{ "type": "boundary" } as Fila responsiva
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-ALM-17 — Consultar consumibles
    Browser->>View: createConsumableDatatable(context)
    View->>Application: getAllConsumables(params)
    activate Application
    Application->>Request: getAllConsumablesRequest({ params })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: consulta GET /api/warehouse/consumables
    activate Transport
    Transport-->>HTTP: HTTP 200 { data: SupplierMaterial[],<br/>recordsTotal: number, recordsFiltered: number }
    deactivate Transport
    HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
    Request-->>Application: getAllConsumablesRequest(): Promise[AxiosResponse]
    alt Respuesta exitosa
        Application-->>View: getAllConsumables(): Promise[AxiosResponse]
        View-->>Browser: DataTable renderiza el contrato anidado mediante getters de inventario
        opt Actor abre edición o ajuste
            View->>RowAdapter: mapMaterialRowToFormData(fila SupplierMaterial)
            activate RowAdapter
            RowAdapter-->>View: mapMaterialRowToFormData(): Object (materialFormData)
            deactivate RowAdapter
        end
    else Respuesta rechazada
        Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```
