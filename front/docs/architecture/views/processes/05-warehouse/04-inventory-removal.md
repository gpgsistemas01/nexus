# Baja confirmada de una relación de inventario

## Escenario y fuente

Casos CU-ALM-04/14/20. Fuentes: `useInventoryRemoval.ts`, `inventoryService.mutate`
y `confirmAction`. La fila tiene ID de relación y entityId con significados distintos.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-021`. Mensajes numerados y ramas de confirmación;
la API conserva el control definitivo de relaciones y efectos.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Page@{ "type": "boundary" } as InventoryPage
    participant Remove@{ "type": "control" } as useInventoryRemoval
    participant Feedback@{ "type": "boundary" } as confirmAction
    participant Service@{ "type": "boundary" } as inventoryService
    participant API@{ "type": "boundary" } as API
    Usuario->>Page: Eliminar fila autorizada
    Page->>Remove: remove(row)
    Remove->>Remove: bloquear confirmación duplicada
    Remove->>Feedback: título, proveedor y submit cancelable
    alt cancelar
        Feedback-->>Remove: false sin request
    else aceptar
        Feedback->>Service: mutate delete con row.id y cuerpo vacío
        Service->>API: operación de baja del recurso
        alt rechazo
            API-->>Service: error
            Service-->>Feedback: fallo normalizado
            Feedback-->>Usuario: conservar aviso y reintento explícito
        else confirmado
            API-->>Service: código esperado
            Service-->>Feedback: confirmación
            Feedback-->>Remove: true
            Remove->>Page: onSaved y recarga
        end
    end
    Remove->>Remove: finally libera isConfirming
```

## Protección y evidencia

El ID enviado es `row.id`, no `entityId`. Desmontar aborta el popup/solicitud; un 401
invoca recuperación de acceso. Cancelar o fallar no anuncia eliminación exitosa.
`warehouse.spec.ts`, pruebas de `feedback` y `inventoryService` conservan la evidencia
representativa; la eliminación persistente requiere API/base reales.
