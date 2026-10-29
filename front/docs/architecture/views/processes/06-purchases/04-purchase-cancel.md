# Compra: cancelación y reintento explícito

## Escenario y contratos

**Casos relacionados:** CU-ENT-05/11.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-014`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Page@{ "type": "boundary" } as Purchase<br/>Page.vue
    participant Feedback@{ "type": "boundary" } as feedback.ts
    end
    box Coordinación
    participant Actions@{ "type": "control" } as usePurchase<br/>Actions.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as purchase<br/>Service.ts
    end
    U->>Page: cancelar detalle desde consulta
    Page->>Actions: cancel(line)
    Actions->>Actions: editableDetailDocument(line) y marcar isChanging
    Actions->>Feedback: confirmAction con callback submit
    Feedback-->>U: pedir confirmación
    alt cancelar aviso
        Feedback-->>Actions: false sin petición
    else confirmar aviso
        U->>Feedback: aceptar
        Feedback->>Actions: ejecutar submit() configurado
        Actions->>Service: changeDetail con action cancel y signal
        Note over Service: PATCH details/id/cancel, sin cuerpo de corrección
        alt rechazo
            Service-->>Actions: ApiError
            Actions->>Actions: options.onError(cause)
            Actions-->>Feedback: rechazar submit
            Feedback-->>U: error en aviso, reintento explícito
        else código confirmado
            Service-->>Actions: MutationConfirmation
            Actions-->>Feedback: callback resuelto
            Feedback-->>Actions: true
            Actions->>Actions: handleDetailSaved(confirmation)
            Actions->>Actions: cerrar corrección, marcar needsReload y recargar
        end
    end
    Actions->>Actions: finally libera isChanging
```

## Reglas y recuperación

Reintentar requiere otra acción del usuario sobre el aviso. Desmontar aborta la confirmación. La UI no marca el detalle cancelado antes de recibir el código esperado.

## Evidencia

purchases.spec.ts y pruebas de feedback. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.

## Fuentes de los participantes

[PurchasePage.vue](../../../../../src/modules/purchases/pages/PurchasePage.vue),
[feedback.ts](../../../../../src/shared/ui/feedback.ts),
[usePurchaseActions.ts](../../../../../src/modules/purchases/composables/usePurchaseActions.ts),
[purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts).
