# Salida: apertura, modos y escritura

## Escenario y contratos

**Casos relacionados:** CU-SAL-02/03/04/09/10/11/16/17/18.

**Fuente técnica:** useIssueActions.ts, useIssueEditor.ts, issueRules.ts e issueRequestMapper.ts. El diagrama describe el código Vue y sus fronteras. La API es un participante externo; sus transacciones internas no se atribuyen al navegador.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-015`. Mensajes numerados; líneas continuas = invocación/solicitud, discontinuas = respuesta o resultado. Las ramas representan decisiones reales; no son ejecuciones simultáneas.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Actions as useIssueActions
    participant Reader as useDocumentRead
    participant Editor as useIssueEditor
    participant Mapper as mapIssueFormToRequest
    participant Service as issueService
    participant API
    Usuario->>Actions: abrir fila y modo solicitado
    Actions->>Reader: load con ID
    Reader->>Service: get con recurso fijo
    Service-->>Reader: documento validado e ID coincidente
    Reader-->>Actions: lectura vigente
    Actions->>Actions: resolveIssueEditMode y permisos
    Actions-->>Editor: target resuelto con documento
    Usuario->>Editor: capturar y Guardar
    Editor->>Editor: validar esquema del modo y estado de UI
    alt consulta o devolución
        Editor-->>Usuario: no guardar documento desde este editor
    else modo create o edit o header
        Editor->>Mapper: values, resource y modo
        Mapper-->>Editor: payload admitido
        Editor->>Service: save mediante useRecordSave
        Service->>API: POST o PATCH y sección de header si aplica
        API-->>Service: respuesta o rechazo
        Service-->>Editor: código confirmado o ApiError
        Editor-->>Actions: onSaved si confirmado y vigente
        Actions->>Actions: cerrar, recargar y showSuccess
    end
```

## Reglas y recuperación

La selección dependiente de encabezado pertenece a useIssueHeaderSelection. Editar después de surtir no reescribe detalles protegidos. La API conserva la decisión definitiva de estado/pertenencia.

## Evidencia

issueTest.ts e issues.spec.ts. La [matriz por caso](../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
