<a id="cu-sal-12"></a>
# `CU-SAL-12` — Surtir merma

**Patrones:** `FE-P05`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`wasteIssueForm.js`](../../../../../../src/public/js/pages/warehouse/wasteIssues/wasteIssueForm.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`wasteIssueService.js`](../../../../../../src/public/js/services/warehouse/wasteIssueService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`wasteIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteIssueApiRoute.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |
| `WarehouseInventoryUtils` | control | [`warehouseInventoryUtils.js`](../../../../../../src/public/js/utils/warehouseInventoryUtils.js) |
| `FileResponseUtils` | control | [`responseUtils.js`](../../../../../../src/public/js/utils/responseUtils.js) |
| `FileApiMessages` | control | [`apiMessages.js`](../../../../../../src/public/js/constants/apiMessages.js) |
| `FileWasteIssueController` | control | [`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js) |
| `FileCreateIssueApplication` | control | [`createIssueApplication.js`](../../../../../../src/public/js/application/warehouse/issues/createIssueApplication.js) |
| `FileWasteIssues` | control | [`wasteIssues.js`](../../../../../../src/public/js/application/warehouse/wasteIssues/wasteIssues.js) |
| `FileValidators` | control | [`validators.js`](../../../../../../src/public/js/utils/validations/validators.js) |
| `FileFieldValidations` | control | [`fieldValidations.js`](../../../../../../src/public/js/utils/validations/fieldValidations.js) |
| `FileBaseValidations` | control | [`baseValidations.js`](../../../../../../src/public/js/utils/validations/baseValidations.js) |

### Configuración y construcción

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-SAL-12`](../../backend-code-sequences/issues/cu-sal-12.md#cu-sal-12): [`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js).

La aplicación ejecuta closures de `createCrudApplication.js`, configuradas por [`wasteIssues.js`](../../../../../../src/public/js/application/warehouse/wasteIssues/wasteIssues.js) mediante [`createIssueApplication.js`](../../../../../../src/public/js/application/warehouse/issues/createIssueApplication.js). Estos archivos de construcción no añaden delegaciones por petición.

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
        FileWasteIssueController["wasteIssueController.js"]
        Transport["wasteIssueApiRoute.js"]
    end
    subgraph Component1["Aplicación y requests"]
        Application["createCrudApplication.js"]
        FileCreateIssueApplication["createIssueApplication.js"]
        FileWasteIssues["wasteIssues.js"]
        Request["wasteIssueService.js"]
    end
    subgraph Component2["Interfaz"]
        FileApiMessages["apiMessages.js"]
        View["wasteIssueForm.js"]
        FormUtils["formUtils.js"]
        FileResponseUtils["responseUtils.js"]
        FileBaseValidations["baseValidations.js"]
        FileFieldValidations["fieldValidations.js"]
        FileValidators["validators.js"]
    end
    FileCreateIssueApplication -->|import| Application
    FileWasteIssues -->|import| Request
    FileWasteIssues -->|import| FileCreateIssueApplication
    View -->|import| FileWasteIssues
    View -->|import| FileValidators
    FormUtils -->|import| FileApiMessages
    FileResponseUtils -->|import| FileApiMessages
    FileFieldValidations -->|import| FileBaseValidations
    FileValidators -->|import| FileBaseValidations
    FileValidators -->|import| FileFieldValidations
    Transport -->|import| FileWasteIssueController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `editWasteIssueDetails` | `FileWasteIssues` | `FileCreateIssueApplication` · `createIssueApplication(...)` |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as wasteIssueForm.js
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Request@{ "type": "boundary" } as wasteIssueService.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as wasteIssueApiRoute.js

    participant WarehouseInventoryUtils@{ "type": "control" } as warehouseInventoryUtils.js

    participant FileResponseUtils@{ "type": "control" } as responseUtils.js

    Initiator->>Browser: inicia CU-SAL-12 — Surtir merma
    Browser->>View: Acción Surtir dentro de los detalles de merma
    View->>WarehouseInventoryUtils: mapIssueDetailsToSupplyRequest(details)
    WarehouseInventoryUtils-->>View: mapIssueDetailsToSupplyRequest(): Object[]
    View->>FormUtils: validateDetailsFields(issueProjectQuantityDetailsValidation,<br/>mapIssueDetailsToSupplyRequest(details))
    FormUtils-->>View: validateDetailsFields(): Object
    loop Cada detalle seleccionado
        View->>FormUtils: validateFields(issueProjectQuantityDetailsValidation, detail)
        FormUtils-->>View: validateFields(): Object — errores por campo
    end
    alt No hay detalle seleccionado o alguna cantidad es inválida
        View-->>Browser: useForm.getErrors() conserva datos y muestra el error por detalle
    else Detalles de surtimiento válidos
        View->>Application: editWasteIssueDetails({ id, formData })
        activate Application
        Application->>Request: editWasteIssueDetailsRequest({ id, data: formData })
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>Transport: enviar PATCH /api/warehouse/waste-issues/:id/details
        activate Transport
        Transport-->>HTTP: HTTP 200 { wasteIssue, code }
        deactivate Transport
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: editWasteIssueDetailsRequest(): Promise[AxiosResponse]
        Application->>FileResponseUtils: createSuccessResponseFromRequest({ response, dataKey })
        FileResponseUtils-->>Application: createSuccessResponseFromRequest(): Object — detalle transversal CRUD
        alt Respuesta exitosa
            Application-->>View: editWasteIssueDetails(): Promise[{ message: string, data: WasteIssue }]
            View-->>Browser: DOM o DataTable actualizado con response.data
        else Respuesta rechazada
            Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
            View-->>Browser: formulario o filtros conservados, mensaje visible
        end
        deactivate Application
    end
```
