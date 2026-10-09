<a id="cu-alm-10"></a>
# `CU-ALM-10` — Registrar merma

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `View` | boundary | [`wasteModal.js`](../../../../../../src/public/js/pages/warehouse/wastes/wasteModal.js)<br/>[`wasteForm.js`](../../../../../../src/public/js/pages/warehouse/wastes/wasteForm.js) |
| `Application` | control | [`wastes.js`](../../../../../../src/public/js/application/warehouse/wastes/wastes.js) |
| `Request` | boundary | [`wasteService.js`](../../../../../../src/public/js/services/warehouse/wasteService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`wasteApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteApiRoute.js)<br/>[`wasteController.js`](../../../../../../src/controllers/api/warehouse/wasteController.js) |

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

    Initiator->>Browser: inicia CU-ALM-10 — Registrar merma
    Browser->>View: wasteModal.js y wasteForm.js seleccionan una plantilla de material
    View->>View: validateFields(wasteValidation, formData)
    alt wasteValidation devuelve errores
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        View->>Application: registerWaste({ formData })
        activate Application
        Application->>Request: registerWasteRequest({ data: formData })
        Request->>HTTP: apiRequest({ method: 'post', url, data })
        HTTP->>Transport: enviar POST /api/warehouse/wastes
        alt Misma identidad de merma
            Transport-->>View: 409 WASTE_ALREADY_EXISTS y no incrementar stock
        else Merma nueva
        end
        alt Respuesta exitosa
            Transport-->>HTTP: HTTP 200 { code, data: templates }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: registerWasteRequest(): Promise[AxiosResponse]
            Application-->>View: registerWaste(): Promise[{ message: string, data: Waste }]
            View-->>Browser: modal cerrado y #table recargada
        else Respuesta rechazada
            Transport-->>HTTP: HTTP de error — respuesta del endpoint
            HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Request-->>Application: throw { status: number, data: Object | null, message: string, raw: Error }
            Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
            View-->>Browser: formulario o filtros conservados, mensaje visible
        end
        deactivate Application
    end
```

