# 7. Clientes: estructura de código

**Identificador:** `DIA-FE-MOD-CLI-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    P["pages<br/>clientsPage.js<br/>clientForm · clientModal"]
    A["application<br/>clients.js"]
    R["services HTTP<br/>clientService.js"]
    T["DataTable del recurso<br/>clientDatatable.js"]
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

clientsPage compone tabla y formulario. El plugin tabular consume getAllClients y la application de reportes; el formulario consume las mutaciones de clients.js.

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| pages · clientForm.js · clientModal.js · y colaboradores | `src/public/js/pages/sales/clients/`<br/>`clientForm.js`<br/>`src/public/js/pages/sales/clients/`<br/>`clientModal.js`<br/>`src/public/js/pages/sales/clients/`<br/>`clientsPage.js` |
| application · clients.js | `src/public/js/application/sales/clients/`<br/>`clients.js` |
| services HTTP · clientService.js | `src/public/js/services/sales/`<br/>`clientService.js` |
| DataTable del recurso · clientDatatable.js | `src/public/js/plugins/datatable/sales/`<br/>`clients/clientDatatable.js` |
| Composición compartida · createCrudApplication.js · formErrorsUI.js · y colaboradores | `src/public/js/application/`<br/>`createCrudApplication.js`<br/>`src/public/js/ui/forms/formErrorsUI.js`<br/>`src/public/js/ui/forms/formStateUI.js`<br/>`src/public/js/ui/forms/formUI.js`<br/>`src/public/js/ui/modalUI.js`<br/>`src/public/js/ui/tableUI.js` |
| axiosInstanceApi.js · request / apiRequest | `src/public/js/services/axiosInstanceApi.js` |

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/frontend-code-sequences/index.md).

