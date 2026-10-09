# 11. Mermas: estructura de código

**Identificador:** `DIA-FE-MOD-WAS-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    P["pages<br/>wastesPage.js<br/>wasteForm · wasteModal"]
    A["application<br/>wastes.js"]
    R["services HTTP<br/>wasteService.js"]
    T["DataTable del recurso<br/>wasteDatatable.js"]
    U["Composición compartida<br/>createCrudApplication.js<br/>warehouseInventoryDatatable.js<br/>y colaboradores"]
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

wastesPage compone formulario, modal y tabla; los archivos wasteStockAddition* mantienen su variante de captura. Los selects de plantilla y los adaptadores permanecen junto a esta UI.

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| pages · wasteFields.js · wasteForm.js · y colaboradores | `src/public/js/pages/warehouse/wastes/`<br/>`wasteFields.js`<br/>`src/public/js/pages/warehouse/wastes/`<br/>`wasteForm.js`<br/>`src/public/js/pages/warehouse/wastes/`<br/>`wasteModal.js`<br/>`src/public/js/pages/warehouse/wastes/`<br/>`wasteStockAdditionForm.js`<br/>`src/public/js/pages/warehouse/wastes/`<br/>`wasteStockAdditionModal.js`<br/>`src/public/js/pages/warehouse/wastes/`<br/>`wastesPage.js` |
| application · wastes.js | `src/public/js/application/warehouse/`<br/>`wastes/wastes.js` |
| services HTTP · wasteService.js | `src/public/js/services/warehouse/`<br/>`wasteService.js` |
| DataTable del recurso · wasteDatatable.js | `src/public/js/plugins/datatable/warehouse/`<br/>`wastes/wasteDatatable.js` |
| Composición compartida · createCrudApplication.js · warehouseInventoryDatatable.js · y colaboradores | `src/public/js/application/`<br/>`createCrudApplication.js`<br/>`src/public/js/plugins/datatable/shared/`<br/>`inventory/warehouseInventoryDatatable.js`<br/>`src/public/js/ui/forms/formStateUI.js`<br/>`src/public/js/ui/forms/formUI.js`<br/>`src/public/js/ui/inventory/`<br/>`inventoryCrudModalUI.js`<br/>`src/public/js/ui/inventory/`<br/>`inventorySelectUI.js`<br/>`src/public/js/ui/modalUI.js`<br/>`src/public/js/ui/tableUI.js` |
| axiosInstanceApi.js · request / apiRequest | `src/public/js/services/axiosInstanceApi.js` |

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/frontend-code-sequences/index.md).

