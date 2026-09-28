<a id="cu-cat-02"></a>
# `CU-CAT-02` — Crear proveedor

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant Origin as src/public/js/pages/warehouse/suppliers/suppliersPage.js<br/>src/public/js/pages/warehouse/goodsReceipts/goodsReceiptModal.js
    participant Select as src/public/js/plugins/select2/domains/supplier.js
    participant View as src/public/js/pages/warehouse/suppliers/supplierModal.js<br/>src/public/js/pages/warehouse/suppliers/supplierForm.js
    participant Application as src/public/js/application/warehouse/suppliers/suppliers.js
    participant Request as src/public/js/services/warehouse/supplierService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/supplierApiRoute.js<br/>src/controllers/api/warehouse/supplierController.js

    alt Sistemas inicia desde el listado independiente
    Initiator->>Browser: inicia CU-CAT-02 — Crear proveedor
        Browser->>Origin: seleccionar Nuevo proveedor
        Origin->>View: openSupplierModal({ mode: create })
    else Almacén inicia desde una compra autorizada
        Browser->>Select: escribir proveedor inexistente y seleccionar Nuevo proveedor
        Select->>Select: runAfterSelect2Close(...)
        Select->>View: openSupplierModal({ data: { tradeName }, onSave })
    end
    View->>View: validateFields(supplierValidation, formData)
    alt Formulario inválido
        View-->>Browser: conservar datos y mostrar errores por campo
    else Formulario válido
        View->>Application: registerSupplier({ formData })
        Application->>Request: registerSupplierRequest({ formData })
        Request->>HTTP: apiRequest({ method: 'post', url, data })
        HTTP->>Transport: POST /api/warehouse/suppliers
        alt Alta resuelta
            Transport-->>HTTP: HTTP 200 { code, data: { supplier } }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: registerSupplierRequest(): Promise[AxiosResponse]
            Application-->>View: registerSupplier(): Promise[{ message: string, data: Supplier }]
            View->>View: handleSubmit(...)
            View->>View: notifications.showSuccess(...)
            View->>View: closeModal(form)
            View->>View: reloadMainTable({ resetPaging: true })
            opt form.onSave definido por el selector operativo
                View->>Select: form.onSave(supplier)
                Select->>Select: toggleSupplierOption(...) agrega y selecciona
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
