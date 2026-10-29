# Merma: respuesta incierta y reintento

## Escenario y contratos

**Casos relacionados:** CU-ALM-10/13; RF-VUE-007/008.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-008`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Page@{ "type": "boundary" } as Inventory<br/>Editor<br/>Page.vue
    end
    box Coordinación
    participant Editor@{ "type": "control" } as useInventory<br/>Editor.ts
    end
    box Integración
    participant Pending@{ "type": "boundary" } as pendingWaste<br/>Operation.ts
    participant Service@{ "type": "boundary" } as inventory<br/>Service.ts
    end
    Editor->>Pending: createPendingWasteOperation(userId, action, id).read()
    Pending-->>Editor: InventoryPayload pendiente o null
    U->>Page: Guardar o reintentar captura pendiente
    Page->>Editor: submit()
    Editor->>Pending: save(payload)
    alt almacenamiento no disponible
        Pending-->>Editor: error al conservar captura
        Editor-->>Page: impedir envío y mostrar bloqueo recuperable
    else cuerpo conservado
        Pending-->>Editor: cuerpo estable con operationId
        Editor->>Service: mutate(wastes, action, pendingData, id, signal)
        Note over Service: Transporte y confirmación en SEQ-040
        alt respuesta confirmada
            Service-->>Editor: resultado validado
            Editor->>Pending: clear()
            Editor->>Page: onSaved() si sigue vigente
        else respuesta incierta o rechazo
            Service-->>Editor: ApiError con código y meta
            Editor->>Pending: reject(cause, wasPending)
            Editor->>Pending: read()
            Pending-->>Editor: cuerpo conservado o null según el contrato
            Editor-->>Page: pendiente bloqueado o captura editable con error
        end
    end
```

## Reglas y recuperación

Reabrir recupera el cuerpo y no convierte una captura modificada en otro intento con la misma clave. Abortar en navegador no revierte una operación ya confirmada en servidor. El [diagrama de estados](../../logical/document-states.md) complementa el orden temporal.

## Evidencia

inventoryFormTest.ts, warehouse.spec.ts y CP-VUE-WH-011-01/02. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.

## Fuentes de los participantes

[InventoryEditorPage.vue](../../../../../src/modules/warehouse/pages/InventoryEditorPage.vue),
[useInventoryEditor.ts](../../../../../src/modules/warehouse/composables/useInventoryEditor.ts),
[pendingWasteOperation.ts](../../../../../src/modules/warehouse/services/pendingWasteOperation.ts),
[inventoryService.ts](../../../../../src/modules/warehouse/services/inventoryService.ts).
