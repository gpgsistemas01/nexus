# 10. Consumibles: estructura de código

**Identificador:** `DIA-FE-MOD-CON-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    P["pages<br/>consumablesPage.js"]
    A["application<br/>consumables.js"]
    R["services HTTP<br/>consumableService.js"]
    T["DataTable del recurso<br/>consumableDatatable.js"]
    L["UI de otro recurso<br/>materialForm.js<br/>materialModal.js<br/>y colaboradores"]
    U["Composición compartida<br/>createCrudApplication.js<br/>materialInventoryActions.js<br/>y colaboradores"]
    H["axiosInstanceApi.js<br/>request / apiRequest"]
    A --> R
    A --> U
    L --> A
    P --> L
    P --> T
    R --> H
    T --> A
    T --> L
    T --> U
    U --> L
```

consumablesPage importa materialForm; la UI comparte formulario/modal de inventario y oculta dimensiones por contexto. consumables.js y consumableService.js conservan operaciones y URL propias.

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| pages · consumablesPage.js | `src/public/js/pages/warehouse/consumables/`<br/>`consumablesPage.js` |
| application · consumables.js | `src/public/js/application/warehouse/`<br/>`consumables/consumables.js` |
| services HTTP · consumableService.js | `src/public/js/services/warehouse/`<br/>`consumableService.js` |
| DataTable del recurso · consumableDatatable.js | `src/public/js/plugins/datatable/warehouse/`<br/>`consumables/consumableDatatable.js` |
| UI de otro recurso · materialForm.js · materialModal.js · y colaboradores | `src/public/js/pages/warehouse/materials/`<br/>`materialForm.js`<br/>`src/public/js/pages/warehouse/materials/`<br/>`materialModal.js`<br/>`src/public/js/pages/warehouse/suppliers/`<br/>`supplierForm.js` |
| Composición compartida · createCrudApplication.js · materialInventoryActions.js · y colaboradores | `src/public/js/application/`<br/>`createCrudApplication.js`<br/>`src/public/js/plugins/datatable/shared/`<br/>`inventory/materialInventoryActions.js`<br/>`src/public/js/ui/tableUI.js` |
| axiosInstanceApi.js · request / apiRequest | `src/public/js/services/axiosInstanceApi.js` |

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/frontend-code-sequences/index.md).

