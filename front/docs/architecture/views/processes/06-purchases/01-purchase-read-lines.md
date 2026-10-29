# Compra: lectura y preparación de partidas

## Escenario y contratos

**Casos relacionados:** CU-ENT-01/02/03/07/08/09.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-011`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Page@{ "type": "boundary" } as Purchase<br/>Page.vue
    participant EditorPage@{ "type": "boundary" } as Purchase<br/>Editor<br/>Page.vue
    end
    box Coordinación
    participant Actions@{ "type": "control" } as usePurchase<br/>Actions.ts
    participant Reader@{ "type": "control" } as useDocument<br/>Read.ts
    participant State@{ "type": "control" } as useList<br/>Editor.ts
    end
    box Reglas y datos
    participant Rules@{ "type": "control" } as purchase<br/>Rules.ts
    end
    U->>Page: abrir compra en consulta o edición
    Page->>Actions: open(row, action)
    Actions->>Reader: load(row.id)
    Note over Reader: Callback, servicio y mapper de lectura en SEQ-025
    Reader-->>Actions: PurchaseDocument vigente o undefined
    opt documento disponible
        Actions->>Rules: canEditPurchase(document)
        Rules-->>Actions: capacidad según estado leído
        Actions->>State: openEditor con modo resuelto y documento
        State-->>Page: target, editorKey incrementado
        Page->>EditorPage: nueva instancia con target
    end
    opt cerrar o solicitar otro documento
        Page->>Actions: close() u open(otra fila, modo)
        Actions->>Reader: close() o load(otro ID)
    end
```

## Reglas y recuperación

El [agregado de partidas](05-purchase-line-entry.md) conserva una secuencia propia.

En alta se elige proveedor; en edición el proveedor persistido permanece fijo. La página conserva detalles recibidos separados de nuevas partidas. Una lectura fallida ofrece retry y no abre un editor con datos inventados.

## Evidencia

purchaseTest.ts y purchases.spec.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.

## Fuentes de los participantes

[PurchasePage.vue](../../../../../src/modules/purchases/pages/PurchasePage.vue),
[PurchaseEditorPage.vue](../../../../../src/modules/purchases/pages/PurchaseEditorPage.vue),
[usePurchaseActions.ts](../../../../../src/modules/purchases/composables/usePurchaseActions.ts),
[useDocumentRead.ts](../../../../../src/shared/composables/useDocumentRead.ts),
[useListEditor.ts](../../../../../src/shared/composables/useListEditor.ts),
[purchaseRules.ts](../../../../../src/modules/purchases/purchaseRules.ts).
