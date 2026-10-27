# Salidas, surtido y devolución: componentes

**Identificador:** `DIA-VUE-COMP-007`. **Pregunta:** ¿Qué colaboradores tienen responsabilidad propia y qué contratos los conectan?

**Fuente:** IssueWorkspace, IssuePage, useIssueActions, useIssueEditor, useIssueHeaderSelection, useIssueReturn y mappers. **Notación y alcance:** Las flechas indican dependencia o consumo; no orden temporal ni herencia.

```mermaid
flowchart TB
    workspace["IssueWorkspace"] --> page["IssuePage"]
    workspace --> client["Alta contextual de cliente"]
    page --> actions["useIssueActions · lectura y modo"]
    actions --> read["useDocumentRead"]
    page --> editor["useIssueEditor"]
    editor --> header["useIssueHeaderSelection"]
    editor --> draft["issueDetails · borrador y surtido"]
    editor --> view["IssueEditor y DetailsTable"]
    page --> returns["useIssueReturn"]
    editor --> mapper["issueRequestMapper"]
    mapper --> service["issueService"]
    returns --> service
    actions --> service
    service --> response["issueResponseMapper y confirmMutation"]
```

El corte representa elementos del cliente, no clases ni procesos desplegados. La [vista de procesos](../../processes/index.md) detalla orden, validación, rechazo y recuperación. Los contratos de props/eventos se localizan en la [referencia generada](../../development/code-reference.md).
