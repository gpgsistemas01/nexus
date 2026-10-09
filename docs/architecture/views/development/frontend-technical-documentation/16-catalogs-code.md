# 16. Catálogos administrables: estructura de código

**Identificador:** `DIA-FE-MOD-CAT-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    P["pages<br/>catalogsPage.js<br/>catalogForm · catalogModal"]
    A["application<br/>catalogs.js"]
    R["services HTTP<br/>catalogService.js"]
    T["DataTable del recurso<br/>catalogDatatable.js"]
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
```

catalogsPage, form/modal y catalogDatatable son comunes al recurso seleccionado. catalogs.js propaga catalog al request; los adaptadores de selects operativos no pasan por esta pantalla administrativa.

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| pages · catalogForm.js · catalogModal.js · y colaboradores | `src/public/js/pages/admin/catalogs/`<br/>`catalogForm.js`<br/>`src/public/js/pages/admin/catalogs/`<br/>`catalogModal.js`<br/>`src/public/js/pages/admin/catalogs/`<br/>`catalogsPage.js` |
| application · catalogs.js | `src/public/js/application/admin/catalogs/`<br/>`catalogs.js` |
| services HTTP · catalogService.js | `src/public/js/services/admin/`<br/>`catalogService.js` |
| DataTable del recurso · catalogDatatable.js | `src/public/js/plugins/datatable/admin/`<br/>`catalogs/catalogDatatable.js` |
| Composición compartida · createCrudApplication.js · formErrorsUI.js · y colaboradores | `src/public/js/application/`<br/>`createCrudApplication.js`<br/>`src/public/js/ui/forms/formErrorsUI.js`<br/>`src/public/js/ui/forms/formStateUI.js`<br/>`src/public/js/ui/forms/formUI.js`<br/>`src/public/js/ui/modalUI.js` |
| axiosInstanceApi.js · request / apiRequest | `src/public/js/services/axiosInstanceApi.js` |

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/frontend-code-sequences/index.md).
