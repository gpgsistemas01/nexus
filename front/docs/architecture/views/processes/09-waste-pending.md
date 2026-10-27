# Merma: respuesta incierta y reintento

## Escenario y contratos

**Casos relacionados:** CU-ALM-10/13; RF-VUE-007/008.

**Fuente técnica:** useInventoryEditor.execute y createPendingWasteOperation. El diagrama describe el código Vue y sus fronteras. La API es un participante externo; sus transacciones internas no se atribuyen al navegador.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-008`. Mensajes numerados; líneas continuas = invocación/solicitud, discontinuas = respuesta o resultado. Las ramas representan decisiones reales; no son ejecuciones simultáneas.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Editor as useInventoryEditor
    participant Pending as pendingWasteOperation
    participant Service as inventoryService
    participant API
    Editor->>Pending: read por usuario, acción e identidad
    Pending-->>Editor: cuerpo pendiente o ausencia
    Usuario->>Editor: Guardar o recuperar captura pendiente
    Editor->>Pending: save(payload)
    alt almacenamiento no disponible
        Pending-->>Editor: error
        Editor-->>Usuario: no enviar y explicar recuperación bloqueada
    else cuerpo conservado
        Pending-->>Editor: mismo cuerpo y operationId
        Editor->>Service: mutate con cuerpo conservado
        Service->>API: alta o entrada de merma
        alt respuesta confirmada
            API-->>Service: código admitido
            Service-->>Editor: confirmación
            Editor->>Pending: clear
            Editor-->>Usuario: confirmar sólo si sigue montado
        else resultado incierto
            API-->>Service: red o error no definitivo
            Service-->>Editor: ApiError
            Editor->>Pending: reject evalúa si debe conservar
            Pending-->>Editor: pendiente conservado
            Editor-->>Usuario: captura bloqueada y reintento explícito
        else rechazo definitivo
            API-->>Service: rechazo de operación
            Service-->>Editor: ApiError y metadatos
            Editor->>Pending: reject limpia según contrato
            Editor-->>Usuario: captura editable y error
        end
    end
```

## Reglas y recuperación

Reabrir recupera el cuerpo y no convierte una captura modificada en otro intento con la misma clave. Abortar en navegador no revierte una operación ya confirmada en servidor. El [diagrama de estados](../logical/document-states.md) complementa el orden temporal.

## Evidencia

inventoryFormTest.ts, warehouse.spec.ts y CP-VUE-WH-011-01/02. La [matriz por caso](../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
