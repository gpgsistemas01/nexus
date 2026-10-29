# Cuenta, edición y contraseña

## Escenario y contratos

**Casos relacionados:** CU-IDA-06/07/08.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-006`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Form@{ "type": "boundary" } as UserForm.vue
    participant Page@{ "type": "boundary" } as UserEditor<br/>Page.vue
    end
    box Coordinación
    participant Editor@{ "type": "control" } as useUser<br/>Editor.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Reglas y datos
    participant Payload@{ "type": "control" } as identity.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as identity<br/>Service.ts
    end
    Page->>Editor: target create, edit o password
    Editor->>Editor: elegir reglas del modo
    alt cambio de contraseña
        Editor-->>Page: clave nueva, sin carga de organización
    else alta o edición
        Editor-->>Page: campos del modo y opciones permitidas
    end
    U->>Form: capturar y Guardar
    Form->>Page: submit
    Page->>Editor: submit()
    alt inválido, pendiente o conflicto
        Editor-->>Page: errores o bloqueo sin petición
    else válido
        Editor->>Save: execute(operation)
        Save->>Editor: operation(signal)
        Editor->>Payload: userPayload(target, values)
        Payload-->>Editor: cuerpo específico del modo
        Editor->>Service: save(users, target, payload, signal)
        Note over Service: Endpoints y contrato en SEQ-038
        Service-->>Editor: operación resuelta o ApiError
        Editor-->>Save: resultado del callback
        alt confirmación vigente
            Save->>Page: onSaved(): emitir saved
        else rechazo
            Save-->>Editor: mensaje y errores, conservar captura
        end
    end
```

## Reglas y recuperación

Edición no vuelve a enviar personId/contraseña. Password sólo envía clave y expectedVersion. La autorización y el almacenamiento seguro de credenciales pertenecen a la API.

## Evidencia

identityTest.ts y records.spec.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.

## Fuentes de los participantes

[UserForm.vue](../../../../../src/modules/identity/components/UserForm.vue),
[UserEditorPage.vue](../../../../../src/modules/identity/pages/UserEditorPage.vue),
[useUserEditor.ts](../../../../../src/modules/identity/composables/useUserEditor.ts),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[identity.ts](../../../../../src/modules/identity/identity.ts),
[identityService.ts](../../../../../src/modules/identity/services/identityService.ts).
