# 8. Proveedores: estructura de código

**Identificador:** `DIA-FE-MOD-SUP-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    P["pages<br/>suppliersPage.js<br/>supplierForm · supplierModal"]
    A["application<br/>suppliers.js"]
    R["services HTTP<br/>supplierService.js"]
    T["DataTable del recurso<br/>supplierDatatable.js"]
    U["Composición compartida<br/>createCrudApplication.js<br/>formErrorsUI.js<br/>y colaboradores"]
    H["axiosInstanceApi.js<br/>request / apiRequest"]
    A --> R
    A --> U
    P --> A
    P --> T
    P --> U
    R --> H
    T --> A
    T --> P
    T --> U
```

supplierForm también se importa desde pantallas de inventario/compras. El módulo conserva su selector y operaciones aunque se abra desde otra página.

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| pages · supplierForm.js · supplierModal.js · y colaboradores | `src/public/js/pages/warehouse/suppliers/`<br/>`supplierForm.js`<br/>`src/public/js/pages/warehouse/suppliers/`<br/>`supplierModal.js`<br/>`src/public/js/pages/warehouse/suppliers/`<br/>`suppliersPage.js` |
| application · suppliers.js | `src/public/js/application/warehouse/`<br/>`suppliers/suppliers.js` |
| services HTTP · supplierService.js | `src/public/js/services/warehouse/`<br/>`supplierService.js` |
| DataTable del recurso · supplierDatatable.js | `src/public/js/plugins/datatable/warehouse/`<br/>`suppliers/supplierDatatable.js` |
| Composición compartida · createCrudApplication.js · formErrorsUI.js · y colaboradores | `src/public/js/application/`<br/>`createCrudApplication.js`<br/>`src/public/js/ui/forms/formErrorsUI.js`<br/>`src/public/js/ui/forms/formStateUI.js`<br/>`src/public/js/ui/forms/formUI.js`<br/>`src/public/js/ui/modalUI.js`<br/>`src/public/js/ui/tableUI.js` |
| axiosInstanceApi.js · request / apiRequest | `src/public/js/services/axiosInstanceApi.js` |

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/frontend-code-sequences/index.md).

