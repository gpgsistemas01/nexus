# Recarga visible sin solapamiento

## Escenario y contratos

**Casos relacionados:** RN-VUE-003/005/007; consultas de CU-ALM y listados.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-019`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Refresh@{ "type": "control" } as useVisible<br/>Refresh.ts
    participant Domain@{ "type": "control" } as useInventory<br/>List.ts
    participant List@{ "type": "control" } as usePaged<br/>List.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as inventory<br/>Service.ts
    end
    Note over Refresh: Foco, visibilidad o intervalo invocan refreshVisible
    Refresh->>Domain: canRefresh() configurado por el consumidor
    Domain-->>Refresh: permiso, sin editor ni consulta pendiente
    alt visible, habilitado y antigüedad mínima cumplida
        Refresh->>List: options.refresh(): refresh()
        List->>List: iniciar lectura en segundo plano
        List->>Service: request(query, signal)
        Service-->>List: PageResult o error
        alt resultado vigente
            List->>List: conservar filas idénticas y actualizar conteos
        else error o lectura sustituida
            List->>List: publicar error o descartar resultado antiguo
        end
        List->>List: liberar isRefreshing
    else no corresponde recargar
        Refresh->>Refresh: terminar sin petición
    end
    opt desmontaje del consumidor
        Refresh->>Refresh: retirar listeners e intervalo
        List->>List: abortar e invalidar lectura
    end
```

## Reglas y recuperación

El intervalo no determina por sí solo una carga periódica incondicional. Pausas, visibilidad, antigüedad y petición vigente pertenecen al contrato del consumidor.

## Evidencia

listInteractionTest.ts, inventoryListTest.ts y pruebas de recarga del navegador. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.

## Fuentes de los participantes

[useVisibleRefresh.ts](../../../../../src/shared/composables/useVisibleRefresh.ts),
[useInventoryList.ts](../../../../../src/modules/warehouse/composables/useInventoryList.ts),
[usePagedList.ts](../../../../../src/shared/composables/usePagedList.ts),
[inventoryService.ts](../../../../../src/modules/warehouse/services/inventoryService.ts).
