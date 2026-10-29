# Inventario: operación HTTP y alta de artículo para compra

Las operaciones `create`, `edit`, `stock`, `add-stock` y `delete` tienen endpoints
y cuerpos distintos. La confirmación precede al retorno de una opción creada.

## Operación y código del recurso

**Identificador:** `DIA-VUE-SEQ-040`. **Pregunta:** ¿Cómo se distingue una escritura de inventario de un alta auxiliar para Compras?

**Lectura visual:** [roles y callbacks](../00-reading-and-roles.md).

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Editor@{ "type": "control" } as useInventory<br/>Editor.ts
    end
    box Reglas y datos
    participant Mapper@{ "type": "control" } as inventory<br/>Mapper.ts
    participant Contract@{ "type": "control" } as record<br/>Contract.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as inventory<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Editor->>Service: mutate o createForPurchase(resource, payload, signal)
    opt createForPurchase de material o consumible
        Service->>Service: mutate create con creationContext goodsReceipt
    end
    Service->>Service: elegir método, suffix y código esperado
    Service->>HTTP: request con cuerpo permitido, DELETE omite data
    HTTP->>API: endpoint de recurso, stock o stock-additions
    API-->>HTTP: respuesta de operación
    alt rechazo
        HTTP-->>Service: ApiError
        Service-->>Editor: rechazar sin confirmar
    else cuerpo recibido
        HTTP-->>Service: resultado
        Service->>Contract: confirmMutation(result, expected)
        Contract-->>Service: confirmación o ApiError
        alt alta contextual para Compras
            Service->>Mapper: normalizeInventoryRow(result.material)
            Mapper-->>Service: InventoryRow o error de contrato
            Service->>Service: construir LookupItem con entityId y actividad
            Service-->>Editor: LookupItem confirmado
        else operación ordinaria
            Service-->>Editor: resultado confirmado
        end
    end
```

## Fuentes de los participantes

[useInventoryEditor.ts](../../../../../src/modules/warehouse/composables/useInventoryEditor.ts),
[inventoryMapper.ts](../../../../../src/modules/warehouse/mappers/inventoryMapper.ts),
[recordContract.ts](../../../../../src/shared/http/recordContract.ts),
[inventoryService.ts](../../../../../src/modules/warehouse/services/inventoryService.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).
