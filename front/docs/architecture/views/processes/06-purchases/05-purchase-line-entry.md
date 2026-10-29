# Compra: selección y agregado de nuevas partidas

La búsqueda está limitada al proveedor de la compra. Los detalles recibidos permanecen
separados de las partidas nuevas; el mapper de escritura envía únicamente las nuevas.

## Partida nueva y captura del encabezado

**Identificador:** `DIA-VUE-SEQ-044`. **Pregunta:** ¿Qué archivos construyen y agregan una partida antes de guardar la compra?

**Lectura visual:** [roles y callbacks](../00-reading-and-roles.md).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Form@{ "type": "boundary" } as PurchaseLine<br/>Entry<br/>Form.vue
    participant Page@{ "type": "boundary" } as PurchaseLine<br/>Entry<br/>Page.vue
    participant Parent@{ "type": "boundary" } as Purchase<br/>Editor<br/>Page.vue
    end
    box Coordinación
    participant Line@{ "type": "control" } as usePurchase<br/>LineEntry.ts
    participant Editor@{ "type": "control" } as usePurchase<br/>Editor.ts
    end
    box Reglas y datos
    participant Details@{ "type": "control" } as purchase<br/>Details.ts
    end
    U->>Form: seleccionar artículo, cantidad y costo, Agregar
    Form->>Page: add
    Page->>Line: add()
    Line->>Line: validar captura y opción activa
    alt inválido, pendiente o desmontado
        Line-->>Page: errors o sin agregar
    else captura válida
        Line->>Details: createPurchaseDetailDraft(item, cantidad, costo)
        Details-->>Line: PurchaseDetail nuevo con identidad local
        Line->>Page: onAdded(line)
        Page->>Parent: emitir add(line)
        Parent->>Editor: addDetail(line)
        Editor->>Editor: actualizar values.details
        Line->>Line: limpiar formulario y búsqueda
    end
    Note over Parent,Details: Los totales son vista previa, no hay petición de escritura
```

## Fuentes de los participantes

[PurchaseLineEntryForm.vue](../../../../../src/modules/purchases/components/PurchaseLineEntryForm.vue),
[PurchaseLineEntryPage.vue](../../../../../src/modules/purchases/pages/PurchaseLineEntryPage.vue),
[PurchaseEditorPage.vue](../../../../../src/modules/purchases/pages/PurchaseEditorPage.vue),
[usePurchaseLineEntry.ts](../../../../../src/modules/purchases/composables/usePurchaseLineEntry.ts),
[usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts),
[purchaseDetails.ts](../../../../../src/modules/purchases/purchaseDetails.ts).
