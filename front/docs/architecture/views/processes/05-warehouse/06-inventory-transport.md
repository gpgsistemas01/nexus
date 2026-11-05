# Inventario: operación HTTP y alta de artículo para compra

## Operación y código del recurso

**Identificador:** `DIA-VUE-SEQ-040`.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Editor@{ "type": "control" } as useInventory<br/>Editor.ts
    end
    box Reglas y datos
    participant Mapper as inventory<br/>Mapper.ts
    participant Contract as record<br/>Contract.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as inventory<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    alt nowrap: options.creationContext === 'goodsReceipt' &&<br/>resource !== 'wastes' && isCreating.value
        Editor->>Service: nowrap: inventoryService.createForPurchase(<br/>resource, payload, controller.signal)
        Service->>Service: nowrap: inventoryService.mutate(resource,<br/>'create', { ...payload, creationContext:<br/>'goodsReceipt' }, undefined, signal)
    else
        Editor->>Service: nowrap: inventoryService.mutate(resource,<br/>target.action, payload, id,<br/>controller.signal)
    end
    Service->>HTTP: nowrap: apiClient.request(url, { method, data:<br/>payload, signal })
    HTTP->>API: nowrap: {method}<br/>/api/warehouse/{resource}[/{id}][/stock|/stock-additions]
    API-->>HTTP: nowrap: { code, material }
    HTTP-->>Service: nowrap: result
    Service->>Contract: nowrap: confirmMutation(result, expected,<br/>errorMessage)
    alt nowrap: value.code !== expected
        Contract-->>Service: nowrap: throw ApiError
        Service-->>Editor: nowrap: throw ApiError
    else
        Contract-->>Service: nowrap: MutationConfirmation
        alt nowrap: creationContext === 'goodsReceipt'
            Service->>Mapper: nowrap: normalizeInventoryRow(result.material)
            Mapper-->>Service: nowrap: row
            Service-->>Editor: nowrap: { id: row.entityId, title, data:<br/>result.material, isDisabled:<br/>!row.isActive }
        else
            Service-->>Editor: nowrap: result
        end
    end
```

## Fuentes de los participantes

[useInventoryEditor.ts](../../../../../src/modules/warehouse/composables/useInventoryEditor.ts),
[inventoryMapper.ts](../../../../../src/modules/warehouse/mappers/inventoryMapper.ts),
[recordContract.ts](../../../../../src/shared/http/recordContract.ts),
[inventoryService.ts](../../../../../src/modules/warehouse/services/inventoryService.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).
