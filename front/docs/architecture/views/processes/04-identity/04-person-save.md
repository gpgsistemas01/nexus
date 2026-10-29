# Persona: guardado del nombre y las responsabilidades

El borrador de responsabilidades procede de `SEQ-005`. El payload elimina etiquetas
y conserva únicamente los identificadores que admite la escritura.

## Coordinación del guardado

**Identificador:** `DIA-VUE-SEQ-039`. **Pregunta:** ¿Quién transforma el borrador y entrega la confirmación al contenedor?

**Lectura visual:** [roles y callbacks](../00-reading-and-roles.md).

```mermaid
sequenceDiagram
    autonumber
    box Interfaz
    participant Page@{ "type": "boundary" } as PersonEditor<br/>Page.vue
    end
    box Coordinación
    participant Editor@{ "type": "control" } as usePerson<br/>Editor.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Reglas y datos
    participant Payload@{ "type": "control" } as identity.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as identity<br/>Service.ts
    end
    Page->>Editor: submit()
    Editor->>Editor: validar fullName y accesses
    alt inválido o conflicto
        Editor-->>Page: errores sin iniciar operación
    else captura válida
        Editor->>Save: execute(operation)
        Save->>Editor: operation(signal)
        Editor->>Payload: personPayload(target, values)
        Payload-->>Editor: fullName, IDs y versión original de edición
        Editor->>Service: save(persons, target, payload, signal)
        Note over Service: HTTP y confirmación en SEQ-038
        Service-->>Editor: operación resuelta o ApiError
        Editor-->>Save: resultado o rechazo
        alt confirmado y vigente
            Save->>Page: onSaved(): emitir saved
        else rechazo
            Save-->>Editor: mensaje y errores de nombre o responsabilidades
            Editor-->>Page: captura conservada
        end
    end
```

## Fuentes de los participantes

[PersonEditorPage.vue](../../../../../src/modules/identity/pages/PersonEditorPage.vue),
[usePersonEditor.ts](../../../../../src/modules/identity/composables/usePersonEditor.ts),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[identity.ts](../../../../../src/modules/identity/identity.ts),
[identityService.ts](../../../../../src/modules/identity/services/identityService.ts).
