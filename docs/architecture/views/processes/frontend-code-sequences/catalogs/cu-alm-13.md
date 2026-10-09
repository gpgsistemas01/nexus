<a id="cu-alm-13"></a>
# `CU-ALM-13` — Agregar existencia de merma

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `EJS` | boundary | [`wastesPage.ejs`](../../../../../../src/views/pages/warehouse/wastes/wastesPage.ejs) |
| `Page` | boundary | [`wastesPage.js`](../../../../../../src/public/js/pages/warehouse/wastes/wastesPage.js) |
| `Table` | boundary | [`wasteDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/wastes/wasteDatatable.js) |
| `Modal` | boundary | [`wasteStockAdditionModal.js`](../../../../../../src/public/js/pages/warehouse/wastes/wasteStockAdditionModal.js) |
| `Form` | boundary | [`wasteStockAdditionForm.js`](../../../../../../src/public/js/pages/warehouse/wastes/wasteStockAdditionForm.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`wasteService.js`](../../../../../../src/public/js/services/warehouse/wasteService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`wasteApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteApiRoute.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |

### Configuración y archivos de contexto

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ALM-13`](../../backend-code-sequences/catalogs/cu-alm-13.md#cu-alm-13): [`wasteController.js`](../../../../../../src/controllers/api/warehouse/wasteController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`wastes.js`](../../../../../../src/public/js/application/warehouse/wastes/wastes.js); exportar esa función no crea otra llamada durante cada petición.

## Coordinación de la interfaz

Este nivel conserva entrada, callbacks y efectos de interfaz. La llamada a `Application` se amplía en la colaboración de transporte, con los mismos argumentos y resultado.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant EJS@{ "type": "boundary" } as Plantilla EJS
    participant Page@{ "type": "boundary" } as Entry point
    participant Table@{ "type": "boundary" } as DataTable
    participant Modal@{ "type": "boundary" } as Inicialización modal
    participant Form@{ "type": "boundary" } as useForm
    participant Application@{ "type": "control" } as Application

    participant FormUtils@{ "type": "control" } as Form helpers

    Initiator->>Browser: inicia CU-ALM-13 — Agregar existencia de merma
    EJS->>Page: import wastesPage.js mediante script type=module
    Page->>Modal: import openWasteStockAdditionModal
    Page->>Form: import wasteStockAdditionForm.js y registra useForm
    Page->>Table: createWasteDatatable({ context, openWasteModal, openWasteStockAdditionModal })
    Browser->>Table: selecciona Agregar stock en una merma
    Table->>Modal: openWasteStockAdditionModal({ data })
    Modal-->>Browser: muestra identidad, existencia actual, quantity y observations
    Browser->>Form: confirma wasteStockAdditionForm
    Form->>FormUtils: validateFields(wasteStockAdditionValidation, { quantity, observations })
    FormUtils-->>Form: validateFields(): Object
    alt wasteStockAdditionValidation devuelve errores
        Form-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        Form->>Application: addWasteStock({ id, formData })
        activate Application
        alt Respuesta exitosa
            Application-->>Form: addWasteStock(): Promise[{ message: string, data: Waste }]
            Form-->>Browser: DOM o DataTable actualizado con response.data
        else Respuesta rechazada
            Application-->>Form: throw { status: number, data: Object | null, message: string, raw: Error }
            Form-->>Browser: formulario o filtros conservados, mensaje visible
    end
        deactivate Application
    end
```

## Colaboración de aplicación y transporte

Amplía la llamada a `Application` del nivel anterior: cada request y el cliente HTTP tienen su propio archivo. El router identifica el endpoint de destino; su ejecución interna está en la secuencia backend del mismo CU. Los resultados regresan al caller de la primera figura.

```mermaid
sequenceDiagram
    autonumber
    participant Form@{ "type": "boundary" } as useForm
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

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
        else Respuesta rechazada
            Transport-->>HTTP: HTTP de error — respuesta del endpoint
            HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Request-->>Application: throw { status: number, data: Object | null, message: string, raw: Error }
            Application-->>Form: throw { status: number, data: Object | null, message: string, raw: Error }
    end
        deactivate Application
```
