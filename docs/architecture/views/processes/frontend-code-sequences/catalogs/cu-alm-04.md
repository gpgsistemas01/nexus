<a id="cu-alm-04"></a>
# `CU-ALM-04` — Retirar material

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
| `View` | boundary | [`materialDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/materials/materialDatatable.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`materialService.js`](../../../../../../src/public/js/services/warehouse/materialService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`materialApiRoute.js`](../../../../../../src/routes/api/warehouse/materialApiRoute.js) |
| `FileResponseUtils` | control | [`responseUtils.js`](../../../../../../src/public/js/utils/responseUtils.js) |
| `FileApiMessages` | control | [`apiMessages.js`](../../../../../../src/public/js/constants/apiMessages.js) |
| `FileMaterialController` | control | [`materialController.js`](../../../../../../src/controllers/api/warehouse/materialController.js) |
| `FileMaterials` | control | [`materials.js`](../../../../../../src/public/js/application/warehouse/materials/materials.js) |
| `FileUtils` | control | [`utils.js`](../../../../../../src/public/js/api/utils.js) |

### Configuración y construcción

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ALM-04`](../../backend-code-sequences/catalogs/cu-alm-04.md#cu-alm-04): [`materialController.js`](../../../../../../src/controllers/api/warehouse/materialController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`materials.js`](../../../../../../src/public/js/application/warehouse/materials/materials.js); exportar esa función no crea otra llamada durante cada petición.

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
        FileMaterialController["materialController.js"]
        Transport["materialApiRoute.js"]
    end
    subgraph Component1["Interfaz"]
        FileUtils["utils.js"]
        FileApiMessages["apiMessages.js"]
        View["materialDatatable.js"]
        FileResponseUtils["responseUtils.js"]
    end
    subgraph Component2["Aplicación y requests"]
        Application["createCrudApplication.js"]
        FileMaterials["materials.js"]
        Request["materialService.js"]
    end
    FileUtils -->|import| FileApiMessages
    FileMaterials -->|import| Request
    FileMaterials -->|import| Application
    View -->|import| FileMaterials
    FileResponseUtils -->|import| FileApiMessages
    Transport -->|import| FileMaterialController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `deleteMaterial` | `FileMaterials` | `Application` · `createCrudApplication(...)` |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as materialDatatable.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Request@{ "type": "boundary" } as materialService.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as materialApiRoute.js

    participant FileUtils@{ "type": "control" } as utils.js

    participant FileResponseUtils@{ "type": "control" } as responseUtils.js

    Initiator->>Browser: inicia CU-ALM-04 — Retirar material
    Browser->>View: solicita retirar la fila proveedor-material
    View->>View: obtiene data.id (id de SupplierMaterial, no material.id)
    View->>Application: deleteMaterial({ id: data.id })
    activate Application
    Application->>Request: deleteMaterialRequest({ id })
    Request->>HTTP: apiRequest({ method: 'delete', url })
    HTTP->>Transport: envía DELETE /api/warehouse/materials/:id
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 200 { material: { id }, code }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: deleteMaterialRequest(): Promise[AxiosResponse]
        Application->>FileResponseUtils: createSuccessResponseFromRequest({ response, dataKey })
        FileResponseUtils-->>Application: createSuccessResponseFromRequest(): Object — detalle transversal CRUD
        Application-->>View: deleteMaterial(): Promise[{ message: string }]
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Transport-->>HTTP: HTTP de error — respuesta del endpoint
        opt No se inicia renovación: status distinto de 401 o request._retry
            HTTP->>FileUtils: normalizeHttpError(err)
            FileUtils-->>HTTP: normalizeHttpError(): Object — status, data, message, raw
        end
        HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Request-->>Application: throw { status: number, data: Object | null, message: string, raw: Error }
        Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```
