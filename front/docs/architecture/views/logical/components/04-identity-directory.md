# Identidad y directorio: componentes

**Identificador:** `DIA-VUE-COMP-004`. **Pregunta:** ¿Qué colaboradores tienen responsabilidad propia y qué contratos los conectan?

**Fuente:** IdentityPage, DirectoryPage, usePersonEditor, useUserEditor, useDirectoryEditor y servicios respectivos. **Notación y alcance:** Las flechas indican dependencia o consumo; no orden temporal ni herencia.

```mermaid
flowchart TB
    identity["IdentityPage"] --> person["PersonEditorPage y usePersonEditor"]
    identity --> account["UserEditorPage y useUserEditor"]
    directory["DirectoryPage"] --> organization["DirectoryEditorPage y useDirectoryEditor"]
    person --> assignments["Organización · áreas y roles"]
    account --> assignments
    person --> forms["PersonForm / UserForm / DirectoryForm"]
    account --> forms
    organization --> forms
    person --> save["useRecordSave"]
    account --> save
    organization --> save
    person --> identityService["identityService"]
    account --> identityService
    organization --> directoryService["directoryService"]
    identityService --> http["apiClient"]
    directoryService --> http
```

El corte representa elementos del cliente, no clases ni procesos desplegados. La [vista de procesos](../../processes/index.md) detalla orden, validación, rechazo y recuperación. Los contratos de props/eventos se localizan en la [referencia generada](../../development/code-reference.md).
