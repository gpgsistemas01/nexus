<a id="cu-cat-02"></a>
# `CU-CAT-02` — Crear proveedor

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Origin` | boundary | [`suppliersPage.js`](../../../../../../src/public/js/pages/warehouse/suppliers/suppliersPage.js)<br/>[`goodsReceiptModal.js`](../../../../../../src/public/js/pages/warehouse/goodsReceipts/goodsReceiptModal.js) |
| `Select` | boundary | [`supplier.js`](../../../../../../src/public/js/plugins/select2/domains/supplier.js) |
| `View` | boundary | [`supplierModal.js`](../../../../../../src/public/js/pages/warehouse/suppliers/supplierModal.js)<br/>[`supplierForm.js`](../../../../../../src/public/js/pages/warehouse/suppliers/supplierForm.js) |
| `Application` | control | [`suppliers.js`](../../../../../../src/public/js/application/warehouse/suppliers/suppliers.js) |
| `Request` | boundary | [`supplierService.js`](../../../../../../src/public/js/services/warehouse/supplierService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`supplierApiRoute.js`](../../../../../../src/routes/api/warehouse/supplierApiRoute.js)<br/>[`supplierController.js`](../../../../../../src/controllers/api/warehouse/supplierController.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant Origin@{ "type": "boundary" } as Documento origen
    participant Select@{ "type": "boundary" } as Select2
    participant View@{ "type": "boundary" } as Pantalla / formulario
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    alt Sistemas inicia desde el listado independiente
    Initiator->>Browser: inicia CU-CAT-02 — Crear proveedor
        Browser->>Origin: seleccionar Nuevo proveedor
        Origin->>View: openSupplierModal({ mode: create })
    else Almacén inicia desde una compra autorizada
        Browser->>Select: escribir proveedor inexistente y seleccionar Nuevo proveedor
        Select->>Select: runAfterSelect2Close({ selector: supplierSelector, action })
        Select->>View: openSupplierModal({ data: { tradeName }, onSave })
    end
    View->>View: validateFields(supplierValidation, formData)
    alt Formulario inválido
        View-->>Browser: conservar datos y mostrar errores por campo
    else Formulario válido
        View->>Application: registerSupplier({ formData })
        Application->>Request: registerSupplierRequest({ data: formData })
        Request->>HTTP: apiRequest({ method: 'post',<br/>url: SUPPLIERS_API_ROUTE, data: formData })
        HTTP->>Transport: POST /api/warehouse/suppliers
        alt Alta resuelta
            Transport-->>HTTP: HTTP 200 { code, data: { supplier } }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: registerSupplierRequest(): Promise[AxiosResponse]
            Application-->>View: registerSupplier(): Promise[{ message: string, data: Supplier }]
            View->>View: handleSubmit({ form, formData,<br/>create: registerSupplier, update: editSupplier })
            View->>View: notifications.showSuccess(response.message)
            View->>View: closeModal(form)
            View->>View: reloadMainTable({ resetPaging: true })
            opt form.onSave definido por el selector operativo
                View->>Select: form.onSave(supplier)
                Select->>Select: toggleSupplierOption({ selector: supplierSelector,<br/>id: supplier.id, name: supplier.tradeName })
                Select-->>Browser: continuar en la compra sin abrir /proveedores
            end
        else Alta rechazada
            Transport-->>HTTP: HTTP error { code, message, meta }
            HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Request-->>Application: registerSupplierRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Application-->>View: registerSupplier(): throw { status: number, data: Object | null, message: string, raw: Error }
            View-->>Browser: useForm conserva supplierForm y handleApiError muestra el error
        end
    end
```
