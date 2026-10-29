# Merma duplicada: apertura de una entrada

## Escenario y contratos

**Casos relacionados:** CU-ALM-10 A2 y CU-ALM-13.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-009`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Feedback@{ "type": "boundary" } as feedback.ts
    end
    box Coordinación
    participant Editor@{ "type": "control" } as useInventory<br/>Editor.ts
    participant Recovery@{ "type": "control" } as useWaste<br/>Duplicate<br/>Recovery.ts
    end
    box Reglas y datos
    participant Mapper@{ "type": "control" } as wasteStock<br/>Addition<br/>Mapper.ts
    end
    Editor->>Recovery: recover(cause, capture)
    Recovery->>Recovery: permiso, callback y rechazo definitivo
    alt contrato o permiso inválido
        Recovery-->>Editor: false
    else duplicado identificado
        Recovery->>Mapper: mapWasteStockAddition(waste, capture)
        Mapper-->>Recovery: StockAdditionTarget o null
        opt target válido
            Recovery->>Feedback: confirmAction con signal
            Feedback-->>U: ofrecer Abrir Agregar stock
            U->>Feedback: cancelar o confirmar
            Feedback-->>Recovery: false o true
            opt confirmado y vigente
                Note over Editor,Mapper: Ejecutar onAddStock(target), continuación en SEQ-048
            end
        end
    end
```

## Entrega del destino de entrada

**Identificador:** `DIA-VUE-SEQ-048`. Continúa la confirmación del aviso, conservando el propietario de cada evento y callback.

```mermaid
sequenceDiagram
    autonumber
    box Interfaz
    participant Page@{ "type": "boundary" } as Inventory<br/>Editor<br/>Page.vue
    participant Parent@{ "type": "boundary" } as Inventory<br/>Page.vue
    end
    box Coordinación
    participant Recovery@{ "type": "control" } as useWaste<br/>Duplicate<br/>Recovery.ts
    participant Inventory@{ "type": "control" } as use<br/>Inventory.ts
    end
    Recovery->>Page: onAddStock(target)
    Page->>Parent: addStock(target)
    Parent->>Inventory: openEditor(target)
    Inventory-->>Parent: editor con target add-stock
    Parent->>Page: nueva instancia con cantidad y observaciones
    Note over Parent,Recovery: Abrir el editor no registra existencias
```

## Reglas y recuperación

Guardar el editor de entrada inicia otra operación con su propia clave y revisión. El ajuste absoluto no reemplaza esta entrada.

## Evidencia

wasteDuplicateRecoveryTest.ts y warehouse.spec.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.

## Fuentes de los participantes

[InventoryPage.vue](../../../../../src/modules/warehouse/pages/InventoryPage.vue),
[InventoryEditorPage.vue](../../../../../src/modules/warehouse/pages/InventoryEditorPage.vue),
[feedback.ts](../../../../../src/shared/ui/feedback.ts),
[useInventoryEditor.ts](../../../../../src/modules/warehouse/composables/useInventoryEditor.ts),
[useWasteDuplicateRecovery.ts](../../../../../src/modules/warehouse/composables/useWasteDuplicateRecovery.ts),
[useInventory.ts](../../../../../src/modules/warehouse/composables/useInventory.ts),
[wasteStockAdditionMapper.ts](../../../../../src/modules/warehouse/mappers/wasteStockAdditionMapper.ts).
