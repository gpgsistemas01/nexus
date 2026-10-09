# 12. Entradas: materiales y consumibles: estructura de código

**Identificador:** `DIA-FE-MOD-REC-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    P["pages<br/>goodsReceiptsPage.js<br/>form · modal · correcciones<br/>entry points material / consumable"]
    A["application<br/>consumableGoodsReceipts.js<br/>goodsReceipts.js<br/>y colaboradores"]
    R["services HTTP<br/>consumableGoodsReceiptService.js<br/>createGoodsReceiptRequests.js<br/>y colaboradores"]
    T["DataTable del recurso<br/>goodsReceiptDatatable.js"]
    L["UI de otro recurso<br/>materialForm.js<br/>supplierForm.js"]
    U["Composición compartida<br/>createCrudApplication.js<br/>renderMaterialDatatable.js<br/>y colaboradores"]
    H["axiosInstanceApi.js<br/>request / apiRequest"]
    A --> P
    A --> R
    A --> U
    L --> U
    P --> A
    P --> L
    P --> T
    P --> U
    R --> H
    R --> P
    T --> A
    T --> U
```

Los entry points material/consumable comparten goodsReceiptsPage, form/modal y correcciones. goodsReceiptContext selecciona referencias de la variante; las factories de requests reciben rutas distintas.

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| pages · consumableGoodsReceiptsPage.js · correctionForm.js · y colaboradores | `src/public/js/pages/warehouse/`<br/>`goodsReceipts/consumables/`<br/>`consumableGoodsReceiptsPage.js`<br/>`src/public/js/pages/warehouse/`<br/>`goodsReceipts/corrections/`<br/>`correctionForm.js`<br/>`src/public/js/pages/warehouse/`<br/>`goodsReceipts/corrections/`<br/>`correctionModal.js`<br/>`src/public/js/pages/warehouse/`<br/>`goodsReceipts/goodsReceiptContext.js`<br/>`src/public/js/pages/warehouse/`<br/>`goodsReceipts/goodsReceiptDetails.js`<br/>`src/public/js/pages/warehouse/`<br/>`goodsReceipts/goodsReceiptForm.js`<br/>`src/public/js/pages/warehouse/`<br/>`goodsReceipts/goodsReceiptModal.js`<br/>`src/public/js/pages/warehouse/`<br/>`goodsReceipts/goodsReceiptsPage.js`<br/>`src/public/js/pages/warehouse/`<br/>`goodsReceipts/materials/`<br/>`materialGoodsReceiptsPage.js` |
| application · consumableGoodsReceipts.js · goodsReceipts.js · y colaboradores | `src/public/js/application/warehouse/`<br/>`goodsReceipts/consumables/`<br/>`consumableGoodsReceipts.js`<br/>`src/public/js/application/warehouse/`<br/>`goodsReceipts/goodsReceipts.js`<br/>`src/public/js/application/warehouse/`<br/>`goodsReceipts/materials/`<br/>`materialGoodsReceipts.js` |
| services HTTP · consumableGoodsReceiptService.js · createGoodsReceiptRequests.js · y colaboradores | `src/public/js/services/warehouse/`<br/>`goodsReceipts/consumables/`<br/>`consumableGoodsReceiptService.js`<br/>`src/public/js/services/warehouse/`<br/>`goodsReceipts/`<br/>`createGoodsReceiptRequests.js`<br/>`src/public/js/services/warehouse/`<br/>`goodsReceipts/goodsReceiptService.js`<br/>`src/public/js/services/warehouse/`<br/>`goodsReceipts/materials/`<br/>`materialGoodsReceiptService.js` |
| DataTable del recurso · goodsReceiptDatatable.js | `src/public/js/plugins/datatable/warehouse/`<br/>`goodsReceipts/goodsReceiptDatatable.js` |
| UI de otro recurso · materialForm.js · supplierForm.js | `src/public/js/pages/warehouse/materials/`<br/>`materialForm.js`<br/>`src/public/js/pages/warehouse/suppliers/`<br/>`supplierForm.js` |
| Composición compartida · createCrudApplication.js · renderMaterialDatatable.js · y colaboradores | `src/public/js/application/`<br/>`createCrudApplication.js`<br/>`src/public/js/plugins/datatable/shared/`<br/>`inventory/renderMaterialDatatable.js`<br/>`src/public/js/plugins/datatable/shared/`<br/>`issues/detailBuilder/detailColumns.js`<br/>`src/public/js/plugins/datatable/shared/`<br/>`issues/detailBuilder/detailHeader.js`<br/>`src/public/js/ui/forms/detailFormUI.js`<br/>`src/public/js/ui/forms/formErrorsUI.js`<br/>`src/public/js/ui/forms/formStateUI.js`<br/>`src/public/js/ui/forms/formUI.js`<br/>`src/public/js/ui/forms/totalsSummaryUI.js`<br/>`src/public/js/ui/inventory/`<br/>`inventoryCrudModalUI.js`<br/>`src/public/js/ui/modalUI.js`<br/>`src/public/js/ui/tableUI.js` |
| axiosInstanceApi.js · request / apiRequest | `src/public/js/services/axiosInstanceApi.js` |

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/frontend-code-sequences/index.md).

