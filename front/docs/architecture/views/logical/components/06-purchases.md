# Compras y correcciones: componentes

**Identificador:** `DIA-VUE-COMP-006`. **Pregunta:** ¿Qué colaboradores tienen responsabilidad propia y qué contratos los conectan?

**Fuente:** PurchaseWorkspace, PurchasePage, usePurchaseActions, usePurchaseEditor, usePurchaseLineEntry, usePurchaseCorrection y mappers. **Notación y alcance:** Las flechas indican dependencia o consumo; no orden temporal ni herencia.

**Lectura visual:** [formas, límites y flechas del mapa](../../diagram-reading.md#mapas-y-actividades).

```mermaid
flowchart TB
    workspace["PurchaseWorkspace"] --> page["PurchasePage"]
    workspace --> auxiliary["DirectoryCreationPage / InventoryEditorPage"]
    page --> actions["usePurchaseActions · lectura y modos"]
    actions --> read["useDocumentRead"]
    page --> editorPage["PurchaseEditorPage"]
    editorPage --> editor["usePurchaseEditor · captura"]
    editorPage --> view["PurchaseEditor · presentación"]
    editorPage --> linePage["PurchaseLineEntryPage"]
    linePage --> line["usePurchaseLineEntry"]
    page --> correctionPage["PurchaseCorrectionPage"]
    correctionPage --> correction["usePurchaseCorrection"]
    editor --> mapper["purchaseRequestMapper"]
    editor --> service["purchaseService"]
    actions --> service
    correction --> service
    service --> response["purchaseResponseMapper / confirmMutation"]
```

El corte representa elementos del cliente, no clases ni procesos desplegados. La [vista de procesos](../../processes/index.md) detalla orden, validación, rechazo y recuperación. Los contratos de props/eventos se localizan en la [referencia generada](../../development/code-reference.md).
