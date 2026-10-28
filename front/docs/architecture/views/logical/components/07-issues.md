# Salidas, surtido y devolución: componentes

**Identificador:** `DIA-VUE-COMP-007`. **Pregunta:** ¿Qué colaboradores tienen responsabilidad propia y qué contratos los conectan?

**Fuente:** IssueWorkspace, IssuePage, useIssueActions, useIssueEditor, useIssueHeaderSelection, useIssueFilters, useIssueDepartments, useIssueReturn y mappers. **Notación y alcance:** Las flechas indican dependencia o consumo; no orden temporal ni herencia.

**Lectura visual:** [formas, límites y flechas del mapa](../../diagram-reading.md#mapas-y-actividades).

```mermaid
flowchart TB
    workspace["IssueWorkspace"] --> page["IssuePage"]
    workspace --> client["DirectoryCreationPage"]
    page --> actions["useIssueActions"]
    actions --> read["useDocumentRead"]
    page --> editorPage["IssueEditorPage"]
    editorPage --> editor["useIssueEditor"]
    editorPage --> view["IssueEditor · presentación"]
    editorPage --> returnPage["IssueReturnPage"]
    returnPage --> returns["useIssueReturn"]
    editor --> header["useIssueHeaderSelection"]
    page --> filters["useIssueFilters"]
    header --> departments["useIssueDepartments"]
    filters --> departments
    departments --> lookup["useRemoteLookup"]
    editor --> draft["issueDetails"]
    editor --> mapper["issueRequestMapper"]
    editor --> service["issueService"]
    returns --> service
    actions --> service
    service --> response["issueResponseMapper / confirmMutation"]
```

El corte representa elementos del cliente, no clases ni procesos desplegados. La [vista de procesos](../../processes/index.md) detalla orden, validación, rechazo y recuperación. Los contratos de props/eventos se localizan en la [referencia generada](../../development/code-reference.md).

`useIssueDepartments` comparte la precarga y el bloqueo entre encabezado y filtros.
Cada consumidor conserva su selección: el alta puede asignar una vacía y la edición
mantiene el área original. `IssueEditor` y `IssueFilters` reciben valores y estado de
bloqueo mediante props; no consultan la sesión ni resuelven permisos en presentación.
