<a id="cu-alm-02"></a>
# `CU-ALM-02` — Crear material

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `View` | boundary | [`materialModal.js`](../../../../../../src/public/js/pages/warehouse/materials/materialModal.js)<br/>[`materialForm.js`](../../../../../../src/public/js/pages/warehouse/materials/materialForm.js) |
| `Application` | control | [`materials.js`](../../../../../../src/public/js/application/warehouse/materials/materials.js) |
| `Request` | boundary | [`materialService.js`](../../../../../../src/public/js/services/warehouse/materialService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`materialApiRoute.js`](../../../../../../src/routes/api/warehouse/materialApiRoute.js)<br/>[`materialController.js`](../../../../../../src/controllers/api/warehouse/materialController.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla / formulario
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-ALM-02 — Crear material
    Browser->>View: openMaterialModal({ mode: CREATE, creationContext, data, onSave })
    alt creationContext es goodsReceipt
        View->>View: setFormSectionVisibility({ form, selector: '.stock-data-section',<br/>isVisible: false })
        View->>View: setFormSectionVisibility({ form, isVisible: false,<br/>fieldNames: ['maxUnitCost'] })
        View->>View: validateFields(goodsReceiptMaterialCreateValidation, formData)
    else Alta directa
        View->>View: validateFields(materialCreateValidation, formData)
    end
    alt validateFields() devuelve errores
        View-->>Browser: normalizeFormErrors() conserva formulario y señala campos
    else Captura válida
        alt creationContext es goodsReceipt
            View->>Application: registerMaterial({ formData, creationContext: 'goodsReceipt' })
            Application->>Application: buildGoodsReceiptMaterialData(data) omite maxUnitCost y newStock
        else Alta directa
            View->>Application: registerMaterial({ formData, creationContext: null })
        end
        activate Application
        Application->>Request: registerMaterialRequest({ data })
        Request->>HTTP: apiRequest({ method: 'post', url: MATERIALS_API_ROUTE, data })
        HTTP->>Transport: POST /api/warehouse/materials { data }
        alt HTTP 200
            Transport-->>HTTP: { material: supplierMaterial, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: registerMaterialRequest(): Promise[AxiosResponse]
            Application-->>View: registerMaterial(): Promise[{ message: string, data: SupplierMaterial }]
            View-->>Browser: onSave(supplierMaterial) y cierre del modal
        else HTTP 4xx/5xx
            Transport-->>HTTP: { code, message, meta }
            HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Request-->>Application: registerMaterialRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Application-->>View: registerMaterial(): throw { status: number, data: Object | null, message: string, raw: Error }
            View-->>Browser: handleSubmit() conserva formulario y muestra mensaje
        end
        deactivate Application
    end
```
