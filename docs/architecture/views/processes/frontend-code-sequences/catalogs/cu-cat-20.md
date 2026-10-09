<a id="cu-cat-20"></a>
# `CU-CAT-20` — Editar unidad de medida

**Patrones:** `FE-P03`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `View` | boundary | [`catalogForm.js`](../../../../../../src/public/js/pages/admin/catalogs/catalogForm.js) |
| `Application` | control | [`catalogs.js`](../../../../../../src/public/js/application/admin/catalogs/catalogs.js) |
| `Request` | boundary | [`catalogService.js`](../../../../../../src/public/js/services/admin/catalogService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`catalogApiRoute.js`](../../../../../../src/routes/api/admin/catalogApiRoute.js)<br/>[`catalogController.js`](../../../../../../src/controllers/api/admin/catalogController.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla / formulario
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-CAT-20 — Editar unidad de medida
    Browser->>View: confirmar el formulario de edición
    View->>View: validateFields(catalogValidation, formData)
    alt catalogValidation devuelve errores
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        View->>Application: editCatalogEntry({ catalog, id, data })
        activate Application
        Application->>Request: editCatalogEntryRequest({ catalog, id, data })
        Request->>HTTP: apiRequest({ method: 'put', url, data })
        HTTP->>Transport: consume PUT /api/admin/catalogs/unit-measures/:id
        alt Respuesta exitosa
            Transport-->>HTTP: HTTP 200 { data, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: editCatalogEntryRequest(): Promise[AxiosResponse]
            Application-->>View: editCatalogEntry(): Promise[{ message: string, data: Object }]
            View-->>Browser: DOM o DataTable actualizado con response.data
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

