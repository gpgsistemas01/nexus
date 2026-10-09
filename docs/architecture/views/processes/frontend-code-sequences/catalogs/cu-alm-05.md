<a id="cu-alm-05"></a>
# `CU-ALM-05` — Ajustar existencia de material

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `EJS` | boundary | [`materialsPage.ejs`](../../../../../../src/views/pages/warehouse/materials/materialsPage.ejs) |
| `Form` | boundary | [`materialForm.js`](../../../../../../src/public/js/pages/warehouse/materials/materialForm.js) |
| `App` | control | [`materials.js`](../../../../../../src/public/js/application/warehouse/materials/materials.js) |
| `Factory` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`materialService.js`](../../../../../../src/public/js/services/warehouse/materialService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `API` | control | [`materialController.js`](../../../../../../src/controllers/api/warehouse/materialController.js) |

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

    Initiator->>Browser: inicia CU-ALM-05 — Ajustar existencia de material
    Browser->>Form: confirma ajuste
    Form->>Form: validateFields(materialStockValidation, formData)
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

