# Salida: selección y surtido

## Escenario y contratos

**Casos relacionados:** CU-SAL-05/12/19.

**Fuente técnica:** useIssueActions, useIssueEditor.updateDetailSupply, issueDetails y issueRequestMapper.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-016`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Actions@{ "type": "control" } as useIssueActions
    participant Editor@{ "type": "control" } as useIssueEditor
    participant Details@{ "type": "control" } as issueDetails
    participant Mapper@{ "type": "control" } as issueRequestMapper
    participant Service@{ "type": "boundary" } as issueService
    participant API@{ "type": "boundary" } as API
    Usuario->>Actions: abrir Surtir
    Actions->>Actions: releer y comprobar permiso y canSupplyIssue
    alt estado ya no admitido
        Actions-->>Usuario: avisar y pedir actualizar listado
    else permitido
        Actions-->>Editor: target supply con documento
        Usuario->>Editor: seleccionar detalle y cantidad de proyecto
        Editor->>Details: updateIssueDetailSupply
        Details-->>Editor: borrador sin mutar documento leído
        Usuario->>Editor: Guardar surtido
        Editor->>Editor: validar selección y cantidades requeridas
        alt falta cantidad o no hay selección válida
            Editor-->>Usuario: errores sin escritura
        else captura válida
            Editor->>Mapper: map con modo supply
            Mapper-->>Editor: sólo detalles modificables seleccionados
            Editor->>Service: save con target supply
            Service->>API: PATCH documento/id/details
        API-->>Service: respuesta o rechazo
            Service-->>Editor: confirmación o rechazo
            Editor-->>Actions: onSaved sólo si confirmado y vigente
        end
    end
```

## Reglas y recuperación

El encabezado queda bloqueado en este modo. Detalles originalmente surtidos/cancelados se protegen. El stock suficiente se vuelve a comprobar en la API y un rechazo no se anuncia como surtido completado.

## Evidencia

issueTest.ts, issues.spec.ts y CP-VUE-ISS-002-01. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
