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

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| pages · personForm.js · personModal.js · y colaboradores | `src/public/js/pages/admin/persons/`<br/>`personForm.js`<br/>`src/public/js/pages/admin/persons/`<br/>`personModal.js`<br/>`src/public/js/pages/admin/persons/`<br/>`personsPage.js` |
| application · persons.js | `src/public/js/application/admin/persons/`<br/>`persons.js` |
| services HTTP · personService.js | `src/public/js/services/admin/`<br/>`personService.js` |
| DataTable del recurso · personDatatable.js | `src/public/js/plugins/datatable/admin/`<br/>`persons/personDatatable.js` |
| Composición compartida · createCrudApplication.js · formErrorsUI.js · y colaboradores | `src/public/js/application/`<br/>`createCrudApplication.js`<br/>`src/public/js/ui/forms/formErrorsUI.js`<br/>`src/public/js/ui/forms/formStateUI.js`<br/>`src/public/js/ui/forms/formUI.js`<br/>`src/public/js/ui/modalUI.js`<br/>`src/public/js/ui/tableUI.js` |
| axiosInstanceApi.js · request / apiRequest | `src/public/js/services/axiosInstanceApi.js` |


## Contratos de implementación

### Datos, resultados y efectos del módulo

| Capacidad | Composición de pantalla | Application y transporte | Contrato y variantes |
| --- | --- | --- | --- |
| Personas | `personsPage.ejs`, `personsPage.js`, `personModal.js` y `personForm.js` componen listado, alta y edición. | `application/admin/persons/persons.js` usa `services/admin/personService.js`; consulta departamentos mediante su catálogo. | `GET`, `POST` y `PUT /api/admin/persons`; adapta la persona devuelta y refresca el listado. |


La application exporta operaciones con vocabulario del recurso; la página/formulario
las consume sin acceder a Prisma. Los requests conservan el transporte separado. La tabla anterior define los datos y variantes propios; los modos compartidos
se consultan en el [contrato de formularios](01-catalog-complete-of-records-frontend.md#contrato-técnico-de-los-modos-de-formulario-de-almacén).

| Archivo bajo `src/` | Símbolos públicos y puntos de configuración |
| --- | --- |
| `public/js/application/admin/persons/`<br/>`persons.js` | `getPersonOptions`<br/>`getAllPersons`<br/>`registerPerson`<br/>`updatePerson` |

### Adaptadores de transporte

| Archivo bajo `src/` | Símbolos públicos y puntos de configuración |
| --- | --- |
| `public/js/services/admin/personService.js` | `PERSONS_API_ROUTE`<br/>`getAllPersonsRequest`<br/>`registerPersonRequest`<br/>`updatePersonRequest` |

## Variantes y límites de reutilización

personsPage compone tabla y formulario; personForm adapta campos y usa persons.js. Los modales y selects conservan su configuración específica.

El mapa distingue composición visual, application, requests y UI compartida. Cada
configurador conserva campos, modos, callbacks y claves del recurso; usar una factory
no significa que todas las pantallas ofrezcan las mismas operaciones. El contrato del
[núcleo de application/requests](../reuse-and-refactoring/02-browser-applications-and-requests.md)
y la [composición de interfaz](../reuse-and-refactoring/03-interface-and-table-lifecycle.md)
se documentan una vez.

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/frontend-code-sequences/index.md).

