# Personas y responsabilidades

## Escenario y contratos

**Casos relacionados:** CU-IDA-02/03.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-005`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Form@{ "type": "boundary" } as Person<br/>Form.vue
    participant Page@{ "type": "boundary" } as PersonEditor<br/>Page.vue
    end
    box Coordinación
    participant Editor@{ "type": "control" } as usePerson<br/>Editor.ts
    participant Org@{ "type": "control" } as use<br/>Organization<br/>Options.ts
    end
    box Reglas y datos
    participant Rules@{ "type": "control" } as personAccess<br/>Validation
    end
    Page->>Editor: crear editor con target y permissions
    Editor->>Org: preparar opciones de áreas y roles
    Note over Org: useRemoteLookup y organizationService consultan por permiso
    Org-->>Editor: state de opciones
    Editor-->>Page: organization.state
    U->>Form: seleccionar área y rol, Agregar
    Form->>Page: draft y add
    Page->>Editor: addAccess()
    Editor->>Rules: departmentId y roleId
    Rules-->>Editor: mensaje o captura válida
    alt área repetida o selección incompleta
        Editor-->>Page: accessError sin añadir responsabilidad
    else selección válida
        Editor->>Editor: añadir IDs y etiquetas al borrador
        Editor-->>Page: values.accesses
    end
    U->>Form: Guardar persona
    Form->>Page: submit
    Page->>Editor: submit(): validar nombre y responsabilidades
    Note over Editor: Captura válida entra en useRecordSave, continuación en SEQ-039
```

El [guardado de persona](04-person-save.md) completa validación, payload, servicio y
confirmación.

## Reglas y recuperación

Las responsabilidades son de la persona; no se envían etiquetas ni datos de cuenta. Quitar la última responsabilidad impide guardar. Las asignaciones de cuenta tienen una secuencia independiente.

## Evidencia

identityTest.ts y records.spec.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.

## Fuentes de los participantes

[PersonForm.vue](../../../../../src/modules/identity/components/PersonForm.vue),
[PersonEditorPage.vue](../../../../../src/modules/identity/pages/PersonEditorPage.vue),
[usePersonEditor.ts](../../../../../src/modules/identity/composables/usePersonEditor.ts),
[useOrganizationOptions.ts](../../../../../src/shared/composables/useOrganizationOptions.ts),
[personAccessValidation](../../../../../../back/src/public/js/utils/validations/validators.js).
