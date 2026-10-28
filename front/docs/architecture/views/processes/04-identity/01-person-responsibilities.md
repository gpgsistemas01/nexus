# Personas y responsabilidades

## Escenario y contratos

**Casos relacionados:** CU-IDA-02/03.

**Fuente técnica:** usePersonEditor.ts, organizationService.ts e identityService.ts.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-005`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Page@{ "type": "boundary" } as PersonEditorPage
    participant Editor@{ "type": "control" } as usePersonEditor
    participant Org@{ "type": "boundary" } as organizationService
    participant Service@{ "type": "boundary" } as identityService
    participant API@{ "type": "boundary" } as API
    Page->>Editor: abrir create o edit con fila/version
    Editor->>Org: cargar áreas y roles con permiso
    Org-->>Editor: opciones y selección precargada
    Usuario->>Page: seleccionar área/rol y Agregar
    Page->>Editor: addAccess
    alt área ya asignada o captura incompleta
        Editor-->>Page: error de asignación sin duplicar fila
    else asignación válida
        Editor-->>Page: responsabilidades actualizadas en borrador
    end
    Usuario->>Page: Guardar persona
    Page->>Editor: submit y validar nombre/asignaciones
    Editor->>Service: save persons con IDs y versión de edición
    Service->>API: POST o PUT según modo
    API-->>Service: confirmación o error
    Service-->>Editor: contrato confirmado o rechazo
    Editor-->>Page: onSaved o conservar captura/errores
```

## Reglas y recuperación

Las responsabilidades son de la persona; no se envían etiquetas ni datos de cuenta. Quitar la última responsabilidad impide guardar. Las asignaciones de cuenta tienen una secuencia independiente.

## Evidencia

identityTest.ts y records.spec.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
