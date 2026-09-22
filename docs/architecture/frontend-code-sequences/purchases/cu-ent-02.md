<a id="cu-ent-02"></a>
# `CU-ENT-02` — Crear compra de material

**Patrones:** `FE-P02`, `FE-P04`.

```mermaid
sequenceDiagram
    actor Warehouse as Personal de almacén
    participant Modal as src/public/js/pages/warehouse/goodsReceipts/goodsReceiptModal.js
    participant Form as src/public/js/pages/warehouse/goodsReceipts/goodsReceiptForm.js
    participant DetailUI as src/public/js/pages/warehouse/goodsReceipts/goodsReceiptDetails.js<br/>src/public/js/plugins/datatable/warehouse/goodsReceipts/goodsReceiptDatatable.js
    participant MaterialUI as src/public/js/plugins/select2/modules/goodsReceiptSelect.js<br/>src/public/js/pages/warehouse/materials/materialModal.js
    participant MaterialApp as src/public/js/application/warehouse/materials/materials.js
    participant App as src/public/js/application/warehouse/goodsReceipts/goodsReceipts.js
    participant Request as src/public/js/services/warehouse/goodsReceiptService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant API@{ "type": "control" } as src/controllers/api/warehouse/goodsReceiptController.js

    Warehouse->>Modal: abrir «Nueva compra»
    Modal->>Modal: openGoodsReceiptModal({ mode: create })
    opt El material no está catalogado
        DetailUI->>MaterialUI: setupMaterialSelect({ creationContext: 'goodsReceipt' }) abre openMaterialModal(...)
        MaterialUI->>MaterialApp: registerMaterial({ formData, creationContext: 'goodsReceipt' })
        MaterialApp->>MaterialApp: buildGoodsReceiptMaterialData(data) omite maxUnitCost y newStock
        MaterialApp->>HTTP: POST /api/warehouse/materials con creationContext
        HTTP-->>MaterialUI: material creado con stock cero y costo aún nulo
    end
    Warehouse->>DetailUI: seleccionar material, cantidad y costo por presentación
    DetailUI->>DetailUI: addGoodsReceiptMaterial()
    opt Se agrega otra vez el mismo material
        DetailUI->>DetailUI: addGoodsReceiptMaterial() conserva un renglón independiente
    end
    Warehouse->>Form: confirmar compra
    Form->>Form: normalizeGoodsReceiptData({ form, formData })
    Form->>Form: validateFields(goodsReceiptValidation, formData)
    alt Hay errores de captura
        Form-->>Warehouse: mostrar campos inválidos sin enviar request
    else Captura válida
        Form->>App: registerGoodsReceipt({ formData })
        App->>Request: createCrudApplication.register({ data })
        Request->>HTTP: apiRequest({ method: 'post', url, data })
        HTTP->>API: POST /api/warehouse/goods-receipts
        alt La factura ya existe para el proveedor
            API-->>HTTP: 409 { code, message, meta }
            HTTP-->>Request: apiRequest() rechaza { code, message, meta }
            Request-->>Form: error con el folio, conservar formulario
        else Compra nueva
            API-->>HTTP: 200 { goodsReceipt, code }
            HTTP-->>Request: apiRequest() resuelve response.data
            Request-->>Form: goodsReceipt
            Form-->>Warehouse: cerrar modal, notificar y actualizar listado
        end
    end
```
