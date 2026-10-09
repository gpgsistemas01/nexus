# 6. Usuarios: estructura de código

**Identificador:** `DIA-FE-MOD-USR-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    P["pages<br/>usersPage.js<br/>userForm · userModal"]
    A["application<br/>users.js"]
    R["services HTTP<br/>userService.js"]
    T["DataTable del recurso<br/>userDatatable.js"]
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

userForm selecciona operaciones por FORM_MODES; users.js configura también la mutación de contraseña. El modal mantiene selectores y campos del usuario.

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| pages · userForm.js · userModal.js · y colaboradores | `src/public/js/pages/admin/users/`<br/>`userForm.js`<br/>`src/public/js/pages/admin/users/`<br/>`userModal.js`<br/>`src/public/js/pages/admin/users/`<br/>`usersPage.js` |
| application · users.js | `src/public/js/application/admin/users/`<br/>`users.js` |
| services HTTP · userService.js | `src/public/js/services/admin/`<br/>`userService.js` |
| DataTable del recurso · userDatatable.js | `src/public/js/plugins/datatable/admin/`<br/>`users/userDatatable.js` |
| Composición compartida · createCrudApplication.js · formErrorsUI.js · y colaboradores | `src/public/js/application/`<br/>`createCrudApplication.js`<br/>`src/public/js/ui/forms/formErrorsUI.js`<br/>`src/public/js/ui/forms/formStateUI.js`<br/>`src/public/js/ui/forms/formUI.js`<br/>`src/public/js/ui/modalUI.js`<br/>`src/public/js/ui/tableUI.js` |
| axiosInstanceApi.js · request / apiRequest | `src/public/js/services/axiosInstanceApi.js` |

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/frontend-code-sequences/index.md).

