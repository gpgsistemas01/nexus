# 9. Materiales: estructura de código

**Identificador:** `DIA-FE-MOD-MAT-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    P["pages<br/>materialsPage.js<br/>materialForm · materialModal"]
    A["application<br/>materials.js"]
    R["services HTTP<br/>materialService.js"]
    T["DataTable del recurso<br/>materialDatatable.js<br/>materialRow.js"]
    L["UI de otro recurso<br/>supplierForm.js"]
    U["Composición compartida<br/>createCrudApplication.js<br/>materialInventoryActions.js<br/>y colaboradores"]
    H["axiosInstanceApi.js<br/>request / apiRequest"]
    A --> R
    A --> U
    L --> U
    P --> A
    P --> L
    P --> T
    P --> U
    R --> H
    T --> A
    T --> P
    T --> U
    U --> P
    U --> T
```

materialsPage inicializa la tabla; materialForm y materialModal conservan la selección de modo y campos. materials.js adapta el alta desde compra y configura CRUD/mutaciones adicionales.

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| pages · materialFields.js · materialForm.js · y colaboradores | `src/public/js/pages/warehouse/materials/`<br/>`materialFields.js`<br/>`src/public/js/pages/warehouse/materials/`<br/>`materialForm.js`<br/>`src/public/js/pages/warehouse/materials/`<br/>`materialModal.js`<br/>`src/public/js/pages/warehouse/materials/`<br/>`materialsPage.js` |
| application · materials.js | `src/public/js/application/warehouse/`<br/>`materials/materials.js` |
| services HTTP · materialService.js | `src/public/js/services/warehouse/`<br/>`materialService.js` |
| DataTable del recurso · materialDatatable.js · materialRow.js | `src/public/js/plugins/datatable/warehouse/`<br/>`materials/materialDatatable.js`<br/>`src/public/js/plugins/datatable/warehouse/`<br/>`materials/materialRow.js` |
| UI de otro recurso · supplierForm.js | `src/public/js/pages/warehouse/suppliers/`<br/>`supplierForm.js` |
| Composición compartida · createCrudApplication.js · materialInventoryActions.js · y colaboradores | `src/public/js/application/`<br/>`createCrudApplication.js`<br/>`src/public/js/plugins/datatable/shared/`<br/>`inventory/materialInventoryActions.js`<br/>`src/public/js/plugins/datatable/shared/`<br/>`inventory/warehouseInventoryDatatable.js`<br/>`src/public/js/ui/forms/formStateUI.js`<br/>`src/public/js/ui/forms/formUI.js`<br/>`src/public/js/ui/inventory/`<br/>`inventoryCrudModalUI.js`<br/>`src/public/js/ui/modalUI.js`<br/>`src/public/js/ui/tableUI.js` |
| axiosInstanceApi.js · request / apiRequest | `src/public/js/services/axiosInstanceApi.js` |

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/frontend-code-sequences/index.md).

