<a id="cu-ent-02"></a>
# `CU-ENT-02` — Crear compra de material

**Patrones:** `FE-P02`, `FE-P04`.

```mermaid
sequenceDiagram
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant Modal as src/public/js/pages/warehouse/goodsReceipts/goodsReceiptModal.js
    participant Form as src/public/js/pages/warehouse/goodsReceipts/goodsReceiptForm.js
    participant DetailUI as src/public/js/pages/warehouse/goodsReceipts/goodsReceiptDetails.js<br/>src/public/js/plugins/datatable/warehouse/goodsReceipts/goodsReceiptDatatable.js
    participant SupplierSelect as src/public/js/plugins/select2/domains/supplier.js
    participant SupplierModal as src/public/js/pages/warehouse/suppliers/supplierModal.js<br/>supplierForm.js
    participant MaterialUI as src/public/js/plugins/select2/modules/goodsReceiptSelect.js<br/>src/public/js/pages/warehouse/materials/materialModal.js
    participant MaterialApp as src/public/js/application/warehouse/materials/materials.js
    participant MaterialRequest as src/public/js/services/warehouse/materialService.js
    participant App as src/public/js/application/warehouse/goodsReceipts/goodsReceipts.js
    participant Request as src/public/js/services/warehouse/goodsReceiptService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant API@{ "type": "control" } as src/controllers/api/warehouse/goodsReceiptController.js

    Initiator->>Browser: inicia CU-ENT-02 — Crear compra de material
    Browser->>Modal: abrir «Nueva compra»
    Modal->>Modal: openGoodsReceiptModal({ mode: create })
    opt El proveedor no está catalogado
        Browser->>SupplierSelect: escribir nombre y seleccionar Nuevo proveedor
        SupplierSelect->>SupplierSelect: runAfterSelect2Close({ selector: supplierSelector, action })
        SupplierSelect->>SupplierModal: openSupplierModal({ data: { tradeName }, onSave })
        Note over SupplierModal,SupplierSelect: registerSupplier() y POST /api/warehouse/suppliers<br/>se detallan en DIA-FE-CU-CAT-02
        SupplierModal->>SupplierSelect: form.onSave(createdSupplier)
        SupplierSelect->>SupplierSelect: toggleSupplierOption({ selector: supplierSelector,<br/>id: createdSupplier.id, name: createdSupplier.tradeName })
        SupplierSelect-->>Browser: continuar compra sin abrir /proveedores
    end
    opt El material no está catalogado
        DetailUI->>MaterialUI: setupMaterialSelect({ modalSelector, supplierSelector,<br/>materialSelector, allowCreate: true, creationContext: 'goodsReceipt' })
        MaterialUI->>MaterialUI: openMaterialModal({ creationContext: 'goodsReceipt',<br/>data: { name, supplier: { id, tradeName } }, onSave })
        MaterialUI->>MaterialApp: registerMaterial({ formData, creationContext: 'goodsReceipt' })
        MaterialApp->>MaterialApp: buildGoodsReceiptMaterialData(data) omite maxUnitCost y newStock
        MaterialApp->>MaterialRequest: registerMaterialRequest({ data })
        MaterialRequest->>HTTP: apiRequest({ method: 'post', url: MATERIALS_API_ROUTE, data })
        alt Material creado
            HTTP-->>MaterialRequest: HTTP 200 { material, code }
            MaterialRequest-->>MaterialApp: registerMaterialRequest(): Promise[AxiosResponse]
            MaterialApp-->>MaterialUI: registerMaterial(): Promise[{ message: string, data: SupplierMaterial }]
            MaterialUI->>MaterialUI: onSave()
            MaterialUI->>MaterialUI: mapSelectMaterialData(supplierMaterial)
            MaterialUI->>MaterialUI: toggleMaterialOption({ selector: baseSelector,<br/>data: mapSelectMaterialData(supplierMaterial) })
        else Alta rechazada
            HTTP-->>MaterialRequest: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            MaterialRequest-->>MaterialApp: registerMaterialRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            MaterialApp-->>MaterialUI: registerMaterial(): throw { status: number, data: Object | null, message: string, raw: Error } y conserva formulario
        end
    end
    Browser->>DetailUI: seleccionar material, cantidad y costo por presentación
    DetailUI->>DetailUI: addGoodsReceiptMaterial()
    opt Se agrega otra vez el mismo material
        DetailUI->>DetailUI: addGoodsReceiptMaterial() conserva un renglón independiente
    end
    Browser->>Form: confirmar compra
    Form->>Form: normalizeGoodsReceiptData({ form, formData })
    Form->>Form: validateFields(goodsReceiptValidation, formData)
    alt Hay errores de captura
        Form-->>Browser: mostrar campos inválidos sin enviar request
    else Captura válida
        Form->>App: registerGoodsReceipt({ formData })
        App->>Request: registerGoodsReceiptRequest({ data: formData })
        Request->>HTTP: apiRequest({ method: 'post',<br/>url: GOODS_RECEIPTS_API_ROUTE, data: formData })
        HTTP->>API: POST /api/warehouse/goods-receipts/materials
        alt La factura ya existe para el proveedor
            API-->>HTTP: 409 { code, message, meta }
            HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Request-->>App: registerGoodsReceiptRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            App-->>Form: registerGoodsReceipt(): throw { status: number, data: Object | null, message: string, raw: Error }
            Form-->>Browser: useForm conserva goodsReceiptForm y handleApiError muestra el conflicto
        else Compra nueva
            API-->>HTTP: 200 { goodsReceipt, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>App: registerGoodsReceiptRequest(): Promise[AxiosResponse]
            App-->>Form: registerGoodsReceipt(): Promise[{ message: string }]
            Form->>Form: handleSubmit({ form, formData,<br/>create: registerGoodsReceipt, update: editGoodsReceipt })
            Form->>Form: notifications.showSuccess(response.message)
            Form->>Form: closeModal(form)
            Form->>Form: reloadMainTable({ resetPaging: true })
            Form-->>Browser: modal cerrado y #table recargada
        end
    end
```
