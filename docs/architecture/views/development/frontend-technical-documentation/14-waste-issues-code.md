# 14. Salidas de mermas: estructura de código

**Identificador:** `DIA-FE-MOD-WIS-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    P["pages<br/>wasteIssuesPage.js<br/>form · modal · devoluciones"]
    A["application<br/>wasteIssues.js"]
    R["services HTTP<br/>wasteIssueService.js"]
    T["DataTable del recurso<br/>wasteIssueDatatable.js"]
    U["Composición compartida<br/>createIssueApplication.js<br/>renderMaterialDatatable.js<br/>y colaboradores"]
    H["axiosInstanceApi.js<br/>request / apiRequest"]
    A --> R
    A --> U
    P --> A
    P --> T
    P --> U
    R --> H
    T --> A
    T --> U
```

wasteIssues.js comparte createIssueApplication; wasteIssueModal configura la tabla de detalles y el permiso visual de merma. Sus requests son propios, no configuradores de createGoodsIssueRequests.

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| pages · wasteIssueReturn.js · wasteIssueForm.js · y colaboradores | `src/public/js/pages/warehouse/wasteIssues/`<br/>`returns/wasteIssueReturn.js`<br/>`src/public/js/pages/warehouse/wasteIssues/`<br/>`wasteIssueForm.js`<br/>`src/public/js/pages/warehouse/wasteIssues/`<br/>`wasteIssueModal.js`<br/>`src/public/js/pages/warehouse/wasteIssues/`<br/>`wasteIssuesPage.js` |
| application · wasteIssues.js | `src/public/js/application/warehouse/`<br/>`wasteIssues/wasteIssues.js` |
| services HTTP · wasteIssueService.js | `src/public/js/services/warehouse/`<br/>`wasteIssueService.js` |
| DataTable del recurso · wasteIssueDatatable.js | `src/public/js/plugins/datatable/warehouse/`<br/>`wasteIssues/wasteIssueDatatable.js` |
| Composición compartida · createIssueApplication.js · renderMaterialDatatable.js · y colaboradores | `src/public/js/application/warehouse/`<br/>`issues/createIssueApplication.js`<br/>`src/public/js/plugins/datatable/shared/`<br/>`inventory/renderMaterialDatatable.js`<br/>`src/public/js/plugins/datatable/shared/`<br/>`issues/issueDatatable.js`<br/>`src/public/js/plugins/datatable/shared/`<br/>`issues/warehouseIssueDetailDatatable.js`<br/>`src/public/js/ui/forms/detailFormUI.js`<br/>`src/public/js/ui/forms/formErrorsUI.js`<br/>`src/public/js/ui/issues/issueFormUI.js`<br/>`src/public/js/ui/issues/issueReturnUI.js`<br/>`src/public/js/ui/modalUI.js` |
| axiosInstanceApi.js · request / apiRequest | `src/public/js/services/axiosInstanceApi.js` |

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/frontend-code-sequences/index.md).

