<a id="cu-alm-18"></a>
# `CU-ALM-18` — Crear consumible

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `View` | boundary | [`materialModal.js`](../../../../../../src/public/js/pages/warehouse/materials/materialModal.js)<br/>[`materialForm.js`](../../../../../../src/public/js/pages/warehouse/materials/materialForm.js) |
| `Application` | control | [`consumables.js`](../../../../../../src/public/js/application/warehouse/consumables/consumables.js) |
| `Request` | boundary | [`consumableService.js`](../../../../../../src/public/js/services/warehouse/consumableService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`consumableApiRoute.js`](../../../../../../src/routes/api/warehouse/consumableApiRoute.js)<br/>[`consumableController.js`](../../../../../../src/controllers/api/warehouse/consumableController.js) |

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

    Initiator->>Browser: inicia CU-ALM-18 — Crear consumible
    Browser->>View: openMaterialModal({ mode: CREATE, resource: CONSUMABLE })
    View->>View: setFormSectionVisibility({ form, fieldNames: ['base', 'height'], isVisible: false })
    View->>View: validateFields(materialCreateValidation, formData)
    alt [datos inválidos]
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores
    else [datos válidos]
        View->>Application: registerConsumable({ formData, creationContext: null })
        activate Application
        Application->>Request: registerConsumableRequest({ data: formData })
        Request->>HTTP: apiRequest({ method: 'post', url: CONSUMABLES_API_ROUTE, data })
        HTTP->>Transport: POST /api/warehouse/consumables
        alt [HTTP 200]
            Transport-->>HTTP: { material: supplierMaterial, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: registerConsumableRequest(): Promise[AxiosResponse]
            Application-->>View: registerConsumable(): Promise[{ message: string, data: SupplierMaterial }]
            View->>View: form.onSave?.(supplierMaterial)
            View-->>Browser: cerrar modal y refrescar listado
        else [HTTP 4xx/5xx]
            Transport-->>HTTP: { code, message, meta }
            HTTP-->>Request: apiRequest(): throw { status, data, message, raw }
            Request-->>Application: registerConsumableRequest(): throw { status, data, message, raw }
            Application-->>View: registerConsumable(): throw { status, data, message, raw }
            View-->>Browser: handleSubmit() conserva formulario y muestra error
        end
        deactivate Application
    end
```
