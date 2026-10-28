# Merma duplicada: apertura de una entrada

## Escenario y contratos

**Casos relacionados:** CU-ALM-10 A2 y CU-ALM-13.

**Fuente técnica:** useWasteDuplicateRecovery.ts y wasteStockAdditionMapper.ts.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-009`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Editor@{ "type": "control" } as useInventoryEditor
    participant Recovery@{ "type": "control" } as useWasteDuplicateRecovery
    participant Mapper@{ "type": "control" } as mapWasteStockAddition
    participant Feedback@{ "type": "boundary" } as confirmAction
    participant Page@{ "type": "boundary" } as InventoryPage
    Editor->>Recovery: recover(cause, capture) tras rechazo sin pendiente
    Recovery->>Recovery: comprobar permiso, callback y operationRejected
    alt metadatos o permiso no válidos
        Recovery-->>Editor: false sin abrir ni escribir
    else duplicado definitivo identificado
        Recovery->>Mapper: construir target con identidad y captura
        Mapper-->>Recovery: add-stock o contrato inválido
        Recovery->>Feedback: confirmar Abrir Agregar stock
        Feedback-->>Usuario: aviso cancelable
        alt cancelar o desmontar
            Usuario-->>Feedback: cancelar
            Feedback-->>Recovery: false
            Recovery-->>Editor: alta conservada
        else aceptar
            Usuario-->>Feedback: confirmar
            Feedback-->>Recovery: true
            Recovery->>Page: onAddStock(target)
            Page-->>Usuario: nuevo editor con cantidad/observaciones
            Note over Usuario,Page: Abrir no registra stock. Cantidad cero queda vacía.
        end
    end
```

## Reglas y recuperación

Guardar el editor de entrada inicia otra operación con su propia clave y revisión. El ajuste absoluto no reemplaza esta entrada.

## Evidencia

wasteDuplicateRecoveryTest.ts y warehouse.spec.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
