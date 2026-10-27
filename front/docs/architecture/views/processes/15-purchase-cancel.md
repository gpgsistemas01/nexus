# Compra: cancelación y reintento explícito

## Escenario y contratos

**Casos relacionados:** CU-ENT-05/11.

**Fuente técnica:** usePurchaseActions.cancel y purchaseService.changeDetail. El diagrama describe el código Vue y sus fronteras. La API es un participante externo; sus transacciones internas no se atribuyen al navegador.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-014`. Mensajes numerados; líneas continuas = invocación/solicitud, discontinuas = respuesta o resultado. Las ramas representan decisiones reales; no son ejecuciones simultáneas.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Actions as usePurchaseActions
    participant Feedback as confirmAction
    participant Service as purchaseService
    participant API
    Usuario->>Actions: Cancelar detalle
    Actions->>Actions: editableDetailDocument e isChanging
    Actions->>Feedback: aviso con submit y AbortSignal
    alt cancelar aviso
        Usuario-->>Feedback: cancelar
        Feedback-->>Actions: false sin escritura
    else confirmar
        Usuario-->>Feedback: aceptar
        Feedback->>Service: changeDetail action cancel
        Service->>API: PATCH details/id/cancel sin payload de corrección
        alt fallo
            API-->>Service: error
            Service-->>Feedback: rechazo normalizado
            Feedback-->>Usuario: conservar aviso y ofrecer reintento
        else código confirmado
            API-->>Service: confirmación
            Service-->>Feedback: resultado admitido
            Feedback-->>Actions: true y confirmación
            Actions->>Actions: handleDetailSaved y recargar documento/listado
        end
    end
    Actions->>Actions: finally libera isChanging
```

## Reglas y recuperación

Reintentar requiere otra acción del usuario sobre el aviso. Desmontar aborta la confirmación. La UI no marca el detalle cancelado antes de recibir el código esperado.

## Evidencia

purchases.spec.ts y pruebas de feedback. La [matriz por caso](../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
