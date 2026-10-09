<a id="cu-alm-05"></a>
# `CU-ALM-05` — Ajustar existencia de material

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `EJS` | boundary | [`materialsPage.ejs`](../../../../../../src/views/pages/warehouse/materials/materialsPage.ejs) |
| `Form` | boundary | [`materialForm.js`](../../../../../../src/public/js/pages/warehouse/materials/materialForm.js) |
| `App` | control | [`materials.js`](../../../../../../src/public/js/application/warehouse/materials/materials.js) |
| `Factory` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`materialService.js`](../../../../../../src/public/js/services/warehouse/materialService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `API` | control | [`materialController.js`](../../../../../../src/controllers/api/warehouse/materialController.js) |
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

    Initiator->>Browser: inicia CU-ALM-05 — Ajustar existencia de material
    Browser->>Form: confirma ajuste
    Form->>FormUtils: validateFields(materialStockValidation, formData)
    FormUtils-->>Form: validateFields(): Object
    alt materialStockValidation devuelve errores
        Form-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        Form->>App: editMaterialStock({ formData, id })
        App->>Factory: ejecutar función retornada por createApplicationMutation(): { formData, id }
        Factory->>Request: editMaterialStockRequest({ data: formData, id })
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>API: PATCH /api/warehouse/materials/:id/stock
        alt Respuesta exitosa
            API-->>HTTP: 200 { material, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Factory: editMaterialStockRequest(): Promise[AxiosResponse]
            Factory-->>App: editMaterialStock(): Promise[{ message: string }]
            App-->>Form: editMaterialStock(): Promise[{ message: string }]
            Form-->>Browser: handleSubmit(): confirmar, cerrar modal y recargar listado
            Form->>Form: form.onSave?.(undefined)
        else Respuesta HTTP rechazada
            API-->>HTTP: status HTTP { code, message }
            HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Request-->>Factory: editMaterialStockRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Factory-->>App: editMaterialStock(): throw { status: number, data: Object | null, message: string, raw: Error }
            App-->>Form: editMaterialStock(): throw { status: number, data: Object | null, message: string, raw: Error }
        end
    end
```

