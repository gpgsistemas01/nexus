# Merma duplicada: apertura de una entrada

## Escenario y contratos

**Casos relacionados:** CU-ALM-10 A2 y CU-ALM-13.

**Fuente técnica:** useWasteDuplicateRecovery.ts y wasteStockAdditionMapper.ts. El diagrama describe el código Vue y sus fronteras. La API es un participante externo; sus transacciones internas no se atribuyen al navegador.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-009`. Mensajes numerados; líneas continuas = invocación/solicitud, discontinuas = respuesta o resultado. Las ramas representan decisiones reales; no son ejecuciones simultáneas.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Editor as useInventoryEditor
    participant Recovery as useWasteDuplicateRecovery
    participant Mapper as mapWasteStockAddition
    participant Feedback as confirmAction
    participant Page as InventoryPage
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

wasteDuplicateRecoveryTest.ts y warehouse.spec.ts. La [matriz por caso](../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
