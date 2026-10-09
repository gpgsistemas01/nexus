<a id="cu-alm-21"></a>
# `CU-ALM-21` — Ajustar existencia de consumible

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `EJS` | boundary | [`consumablesPage.ejs`](../../../../../../src/views/pages/warehouse/consumables/consumablesPage.ejs) |
| `Form` | boundary | [`materialForm.js`](../../../../../../src/public/js/pages/warehouse/materials/materialForm.js) |
| `App` | control | [`consumables.js`](../../../../../../src/public/js/application/warehouse/consumables/consumables.js) |
| `Factory` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`consumableService.js`](../../../../../../src/public/js/services/warehouse/consumableService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `API` | control | [`consumableController.js`](../../../../../../src/controllers/api/warehouse/consumableController.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant EJS@{ "type": "boundary" } as Plantilla EJS
    participant Form@{ "type": "boundary" } as useForm
    participant App@{ "type": "control" } as Application
    participant Factory@{ "type": "control" } as Factory
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant API@{ "type": "control" } as Endpoint API

    participant FormUtils@{ "type": "control" } as Form helpers

    Initiator->>Browser: inicia CU-ALM-21 — Ajustar existencia de consumible
    Browser->>Form: confirma ajuste
    Form->>FormUtils: validateFields(materialStockValidation, formData)
    FormUtils-->>Form: validateFields(): Object
    alt materialStockValidation devuelve errores
        Form-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        Form->>App: editConsumableStock({ formData, id })
        App->>Factory: ejecutar función retornada por createApplicationMutation(): { formData, id }
        Factory->>Request: editConsumableStockRequest({ data: formData, id })
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>API: PATCH /api/warehouse/consumables/:id/stock
        alt Respuesta exitosa
            API-->>HTTP: 200 { material, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Factory: editConsumableStockRequest(): Promise[AxiosResponse]
            Factory-->>App: editConsumableStock(): Promise[{ message: string }]
            App-->>Form: editConsumableStock(): Promise[{ message: string }]
            Form-->>Browser: handleSubmit(): confirmar, cerrar modal y recargar listado
            Form->>Form: form.onSave?.(undefined)
        else Respuesta HTTP rechazada
            API-->>HTTP: status HTTP { code, message }
            HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Request-->>Factory: editConsumableStockRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Factory-->>App: editConsumableStock(): throw { status: number, data: Object | null, message: string, raw: Error }
            App-->>Form: editConsumableStock(): throw { status: number, data: Object | null, message: string, raw: Error }
        end
    end
```
