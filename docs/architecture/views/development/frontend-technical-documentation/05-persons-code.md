# 5. Personas: estructura de código

**Identificador:** `DIA-FE-MOD-PER-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    P["pages<br/>personsPage.js<br/>personForm · personModal"]
    A["application<br/>persons.js"]
    R["services HTTP<br/>personService.js"]
    T["DataTable del recurso<br/>personDatatable.js"]
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

personsPage compone tabla y formulario; personForm adapta campos y usa persons.js. Los modales y selects conservan su configuración específica.

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| pages · personForm.js · personModal.js · y colaboradores | `src/public/js/pages/admin/persons/`<br/>`personForm.js`<br/>`src/public/js/pages/admin/persons/`<br/>`personModal.js`<br/>`src/public/js/pages/admin/persons/`<br/>`personsPage.js` |
| application · persons.js | `src/public/js/application/admin/persons/`<br/>`persons.js` |
| services HTTP · personService.js | `src/public/js/services/admin/`<br/>`personService.js` |
| DataTable del recurso · personDatatable.js | `src/public/js/plugins/datatable/admin/`<br/>`persons/personDatatable.js` |
| Composición compartida · createCrudApplication.js · formErrorsUI.js · y colaboradores | `src/public/js/application/`<br/>`createCrudApplication.js`<br/>`src/public/js/ui/forms/formErrorsUI.js`<br/>`src/public/js/ui/forms/formStateUI.js`<br/>`src/public/js/ui/forms/formUI.js`<br/>`src/public/js/ui/modalUI.js`<br/>`src/public/js/ui/tableUI.js` |
| axiosInstanceApi.js · request / apiRequest | `src/public/js/services/axiosInstanceApi.js` |

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/frontend-code-sequences/index.md).

