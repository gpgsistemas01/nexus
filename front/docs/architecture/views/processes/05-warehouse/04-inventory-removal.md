# Baja confirmada de una relación de inventario

## Escenario y fuente

Casos CU-ALM-04/20: Materiales y Consumibles. Fuentes: `useInventoryRemoval.ts`, `inventoryService.mutate`
y `confirmAction`. La fila tiene ID de relación y entityId con significados distintos.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-021`. Mensajes numerados y ramas de confirmación;
la API conserva el control definitivo de relaciones y efectos.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Page@{ "type": "boundary" } as Inventory<br/>Page.vue
    participant Feedback@{ "type": "boundary" } as feedback.ts
    end
    box Coordinación
    participant Inventory@{ "type": "control" } as use<br/>Inventory.ts
    participant Remove@{ "type": "control" } as useInventory<br/>Removal.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as inventory<br/>Service.ts
    end
    U->>Page: Eliminar fila autorizada
    Page->>Inventory: openEditor con target delete
    Inventory->>Remove: remove(row)
    Remove->>Remove: comprobar bloqueo de confirmación
    Remove->>Feedback: confirmAction con callback submit
    Feedback-->>U: confirmación cancelable
    alt cancelar
        Feedback-->>Remove: false sin petición
    else confirmar
        U->>Feedback: aceptar
        Feedback->>Remove: submit() definido en remove
        Remove->>Service: mutate(resource, delete, {}, row.id, signal)
        alt rechazo
            Service-->>Remove: ApiError
            Remove-->>Feedback: rechazar callback
            Feedback-->>U: aviso abierto con error y reintento
        else respuesta confirmada
            Service-->>Remove: resultado validado
            Remove-->>Feedback: callback resuelto
            Feedback-->>Remove: true
            Remove->>Inventory: onSaved()
            Inventory->>Inventory: cerrar editor y recargar listado
        end
    end
    Remove->>Remove: finally libera isConfirming
```

## Protección y evidencia

El ID enviado es `row.id`, no `entityId`. Desmontar aborta el popup/solicitud; un 401
invoca recuperación de acceso. Cancelar o fallar no anuncia eliminación exitosa.
`warehouse.spec.ts`, pruebas de `feedback` y `inventoryService` conservan la evidencia
representativa; la eliminación persistente requiere API/base reales.

## Fuentes de los participantes

[InventoryPage.vue](../../../../../src/modules/warehouse/pages/InventoryPage.vue),
[feedback.ts](../../../../../src/shared/ui/feedback.ts),
[useInventory.ts](../../../../../src/modules/warehouse/composables/useInventory.ts),
[useInventoryRemoval.ts](../../../../../src/modules/warehouse/composables/useInventoryRemoval.ts),
[inventoryService.ts](../../../../../src/modules/warehouse/services/inventoryService.ts).
