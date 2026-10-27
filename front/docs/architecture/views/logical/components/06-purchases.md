# Compras y correcciones: componentes

**Identificador:** `DIA-VUE-COMP-006`. **Pregunta:** ¿Qué colaboradores tienen responsabilidad propia y qué contratos los conectan?

**Fuente:** PurchaseWorkspace, PurchasePage, usePurchaseActions, usePurchaseEditor, usePurchaseLineEntry, usePurchaseCorrection y mappers. **Notación y alcance:** Las flechas indican dependencia o consumo; no orden temporal ni herencia.

```mermaid
flowchart TB
    workspace["PurchaseWorkspace"] --> page["PurchasePage"]
    workspace --> auxiliary["Altas de proveedor y artículo"]
    page --> actions["usePurchaseActions · lectura y modos"]
    actions --> read["useDocumentRead"]
    page --> editor["usePurchaseEditor · encabezado y borrador"]
    page --> entryPage["PurchaseEditorPage y PurchaseLineEntryPage"]
    entryPage --> line["usePurchaseLineEntry · partida nueva"]
    entryPage --> editor
    page --> correction["usePurchaseCorrection"]
    editor --> view["PurchaseEditor / DetailsTable / Totals"]
    editor --> mapper["purchaseRequestMapper"]
    correction --> service["purchaseService"]
    actions --> service
    mapper --> service
    service --> response["purchaseResponseMapper y confirmMutation"]
```

El corte representa elementos del cliente, no clases ni procesos desplegados. La [vista de procesos](../../processes/index.md) detalla orden, validación, rechazo y recuperación. Los contratos de props/eventos se localizan en la [referencia generada](../../development/code-reference.md).
