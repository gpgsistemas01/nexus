# Selección dependiente y escritura de inventario

## Escenario y contratos

**Casos relacionados:** CU-ALM-02/03/05/10/11/12/13/18/19/21.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-007`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Form@{ "type": "boundary" } as Inventory<br/>Editor.vue
    participant Page@{ "type": "boundary" } as Inventory<br/>Editor<br/>Page.vue
    end
    box Coordinación
    participant Editor@{ "type": "control" } as useInventory<br/>Editor.ts
    participant Selection@{ "type": "control" } as useInventory<br/>Selection.ts
    end
    box Reglas y datos
    participant Model@{ "type": "control" } as formModel.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as inventory<br/>Service.ts
    end
    Page->>Editor: resource, target y creationContext
    Editor->>Selection: crear selección con values y callbacks
    U->>Form: cambiar proveedor, plantilla o unidad
    Form->>Page: update(field, value)
    Page->>Editor: update(field, value)
    Selection->>Selection: reaccionar a proveedor, plantilla o unidad
    Selection->>Editor: setValue y clearError configurados
    Editor-->>Page: values y preview
    Page-->>Form: props actualizadas
    U->>Form: Guardar
    Form->>Page: submit
    Page->>Editor: submit()
    alt captura nueva sin pendiente
        Editor->>Editor: validar reglas del recurso y modo
        break captura inválida
            Editor-->>Page: errors sin ejecutar escritura
        end
        Editor->>Model: buildInventoryPayload(resource, target, values, preview, context)
        Model-->>Editor: InventoryPayload permitido
    else merma pendiente recuperada
        Editor->>Editor: reutilizar pendingData sin fabricar otro intento
    end
    Note over Editor: execute(payload) protege doble envío y conserva pendiente de merma
    Editor->>Service: mutate o createForPurchase con signal
    Note over Service: Transporte y códigos por operación en SEQ-040
    Service-->>Editor: resultado o ApiError
    alt confirmado y vigente
        Editor->>Page: onSaved(created)
        Page->>Page: emitir saved(created)
    else rechazo
        Editor-->>Page: mensaje, errores y conflicto o pendiente
    end
```

## Reglas y recuperación

El recurso fija reglas; Consumibles omite medidas, edición preserva identidad/stock y el ajuste conserva versión/motivo. La recuperación de merma se detalla en las siguientes secuencias y no se resuelve como un reintento genérico.

## Evidencia

inventoryFormTest.ts, inventoryListTest.ts y warehouse.spec.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.

## Fuentes de los participantes

[InventoryEditor.vue](../../../../../src/modules/warehouse/components/InventoryEditor.vue),
[InventoryEditorPage.vue](../../../../../src/modules/warehouse/pages/InventoryEditorPage.vue),
[useInventoryEditor.ts](../../../../../src/modules/warehouse/composables/useInventoryEditor.ts),
[useInventorySelection.ts](../../../../../src/modules/warehouse/composables/useInventorySelection.ts),
[formModel.ts](../../../../../src/modules/warehouse/formModel.ts),
[inventoryService.ts](../../../../../src/modules/warehouse/services/inventoryService.ts).
