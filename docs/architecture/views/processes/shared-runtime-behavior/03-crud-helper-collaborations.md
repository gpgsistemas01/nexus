# Colaboraciones de los helpers CRUD

Estas figuras amplían funciones compartidas del código. Los casos conservan su actor,
validación, callback, aplicación y request específicos; no se vuelve a describir aquí
el proceso de una operación ni se usan participantes que agrupen archivos diferentes.

## Participantes y trazabilidad

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Application` | control | [`createCrudApplication.js`](../../../../../src/public/js/application/createCrudApplication.js) |
| `Response` | control | [`responseUtils.js`](../../../../../src/public/js/utils/responseUtils.js) |
| `Messages` | control | [`apiMessages.js`](../../../../../src/public/js/constants/apiMessages.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../src/public/js/utils/formUtils.js) |
| `Notifications` | control | [`swalComponent.js`](../../../../../src/public/js/plugins/swal/swalComponent.js) |
| `Modal` | control | [`modalUI.js`](../../../../../src/public/js/ui/modalUI.js) |
| `Mdb` | control | [`baseInstance.js`](../../../../../src/public/js/plugins/mdb/baseInstance.js) |
| `Table` | control | [`tableOperations.js`](../../../../../src/public/js/plugins/datatable/core/base/tableOperations.js) |

## Adaptación de la respuesta CRUD

La closure de mutación de `createCrudApplication.js` espera el request y entonces
invoca `createSuccessResponseFromRequest`. Esta función llama a `createSuccessResponse`
en el mismo archivo. El mensaje se resuelve desde el código API; `data` sólo se añade
si el configurador suministró `dataKey`. Listados y reportes tienen contratos distintos.

```mermaid
sequenceDiagram
    autonumber
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Response@{ "type": "control" } as responseUtils.js
    participant Messages@{ "type": "control" } as apiMessages.js

    Application->>Response: createSuccessResponseFromRequest({ response, dataKey })
    Response->>Response: createSuccessResponse({ data: response.data, dataKey, message })
    Response->>Messages: getSuccessMessage(data?.code) — cuando message no se proporciona
    Messages-->>Response: getSuccessMessage(): string
    Response-->>Application: createSuccessResponseFromRequest(): Object — message y data si hay dataKey
```

## Efectos posteriores de handleSubmit

El caso ya muestra cómo `handleSubmit` elige `create` o `update`, valida la existencia
del id para update y espera la función configurada. Esta ampliación comienza después
de resolver esa promesa. Un fallo de aplicación se propaga antes de estos efectos.
El orden es notificar, cerrar y recargar si `reloadTable` es true. La función retorna
`response.data`, que puede ser undefined según el contrato de la aplicación.

```mermaid
sequenceDiagram
    autonumber
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant Notifications@{ "type": "control" } as swalComponent.js
    participant Modal@{ "type": "control" } as modalUI.js
    participant Mdb@{ "type": "control" } as baseInstance.js
    participant Table@{ "type": "control" } as tableOperations.js
    participant Browser as Navegador

    Note over FormUtils,Notifications: La promesa de create/update ya se resolvió
    FormUtils->>Notifications: notifications.showSuccess(response.message)
    FormUtils->>Modal: closeModal(form)
    opt form.closest(.modal) devuelve un elemento
        Modal->>Mdb: initMdbModal(currentEl)
        Mdb-->>Modal: initMdbModal(): ModalInstance
        Modal->>Mdb: hideModal({ el: currentEl, instance, form })
    end
    opt reloadTable es true
        FormUtils->>Table: reloadMainTable({ resetPaging: mode === CREATE })
        Table->>Browser: $(DATATABLE_SELECTORS.MAIN).DataTable()
        Table->>Browser: table.ajax.reload(null, resetPaging)
    end
    Note over FormUtils,Table: Retorna response.data al callback del caso
```
