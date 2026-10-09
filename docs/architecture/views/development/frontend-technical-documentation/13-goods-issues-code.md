# 13. Salidas: materiales y consumibles: estructura de código

**Identificador:** `DIA-FE-MOD-ISS-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    P["pages<br/>goodsIssuesPage.js<br/>form · modal · devoluciones<br/>entry points material / consumable"]
    A["application<br/>consumableGoodsIssues.js<br/>goodsIssues.js<br/>y colaboradores"]
    R["services HTTP<br/>consumableGoodsIssueService.js<br/>createGoodsIssueRequests.js<br/>y colaboradores"]
    T["DataTable del recurso<br/>goodsIssueDatatable.js"]
    L["UI de otro recurso<br/>clientForm.js"]
    U["Composición compartida<br/>createIssueApplication.js<br/>renderMaterialDatatable.js<br/>y colaboradores"]
    H["axiosInstanceApi.js<br/>request / apiRequest"]
    A --> P
    A --> R
    A --> U
    P --> A
    P --> L
    P --> T
    P --> U
    R --> H
    R --> P
    T --> A
    T --> P
    T --> U
```

Los entry points y goodsIssueContext componen la UI compartida. Las applications por variante usan createIssueApplication; las devoluciones están en returns y las tablas compartidas en plugins/datatable/shared/issues.

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| pages · consumableGoodsIssuesPage.js · goodsIssueContext.js · y colaboradores | `src/public/js/pages/warehouse/goodsIssues/`<br/>`consumables/consumableGoodsIssuesPage.js`<br/>`src/public/js/pages/warehouse/goodsIssues/`<br/>`goodsIssueContext.js`<br/>`src/public/js/pages/warehouse/goodsIssues/`<br/>`goodsIssueForm.js`<br/>`src/public/js/pages/warehouse/goodsIssues/`<br/>`goodsIssueModal.js`<br/>`src/public/js/pages/warehouse/goodsIssues/`<br/>`goodsIssuesPage.js`<br/>`src/public/js/pages/warehouse/goodsIssues/`<br/>`materials/materialGoodsIssuesPage.js`<br/>`src/public/js/pages/warehouse/goodsIssues/`<br/>`returns/goodsIssueReturn.js` |
| application · consumableGoodsIssues.js · goodsIssues.js · y colaboradores | `src/public/js/application/warehouse/`<br/>`goodsIssues/consumables/`<br/>`consumableGoodsIssues.js`<br/>`src/public/js/application/warehouse/`<br/>`goodsIssues/goodsIssues.js`<br/>`src/public/js/application/warehouse/`<br/>`goodsIssues/materials/`<br/>`materialGoodsIssues.js` |
| services HTTP · consumableGoodsIssueService.js · createGoodsIssueRequests.js · y colaboradores | `src/public/js/services/warehouse/`<br/>`goodsIssues/consumables/`<br/>`consumableGoodsIssueService.js`<br/>`src/public/js/services/warehouse/`<br/>`goodsIssues/createGoodsIssueRequests.js`<br/>`src/public/js/services/warehouse/`<br/>`goodsIssues/goodsIssueService.js`<br/>`src/public/js/services/warehouse/`<br/>`goodsIssues/materials/`<br/>`materialGoodsIssueService.js` |
| DataTable del recurso · goodsIssueDatatable.js | `src/public/js/plugins/datatable/warehouse/`<br/>`goodsIssues/goodsIssueDatatable.js` |
| UI de otro recurso · clientForm.js | `src/public/js/pages/sales/clients/`<br/>`clientForm.js` |
| Composición compartida · createIssueApplication.js · renderMaterialDatatable.js · y colaboradores | `src/public/js/application/warehouse/`<br/>`issues/createIssueApplication.js`<br/>`src/public/js/plugins/datatable/shared/`<br/>`inventory/renderMaterialDatatable.js`<br/>`src/public/js/plugins/datatable/shared/`<br/>`issues/issueDatatable.js`<br/>`src/public/js/plugins/datatable/shared/`<br/>`issues/warehouseIssueDetailDatatable.js`<br/>`src/public/js/ui/forms/detailFormUI.js`<br/>`src/public/js/ui/forms/formErrorsUI.js`<br/>`src/public/js/ui/issues/issueFormUI.js`<br/>`src/public/js/ui/issues/issueReturnUI.js`<br/>`src/public/js/ui/modalUI.js` |
| axiosInstanceApi.js · request / apiRequest | `src/public/js/services/axiosInstanceApi.js` |

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/frontend-code-sequences/index.md).

