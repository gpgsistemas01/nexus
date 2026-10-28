# Cuenta, edición y contraseña

## Escenario y contratos

**Casos relacionados:** CU-IDA-06/07/08.

**Fuente técnica:** useUserEditor.ts e identityService.save.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-006`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Page@{ "type": "boundary" } as UserEditorPage
    participant Editor@{ "type": "control" } as useUserEditor
    participant Service@{ "type": "boundary" } as identityService
    participant API@{ "type": "boundary" } as API
    Page->>Editor: abrir target create o edit o password
    alt alta de cuenta
        Editor-->>Page: nombre, contraseña y asignación
    else edición de cuenta
        Editor-->>Page: captura admitida y versión original
    else cambio de contraseña
        Editor-->>Page: sólo nueva contraseña sin cargar organización
    end
    Usuario->>Page: capturar y Guardar
    Page->>Editor: validar y construir payload específico
    alt inválido o envío pendiente
        Editor-->>Page: errores o espera sin duplicar envío
    else válido
        Editor->>Service: save(users, target, payload, signal)
        alt create
            Service->>API: POST /api/admin/users
        else edit
            Service->>API: PATCH /api/admin/users/id
        else password
            Service->>API: PATCH /api/admin/users/id/password
        end
        API-->>Service: respuesta
        Service->>Service: confirmMutation con código de la operación
        Service-->>Editor: resultado o ApiError
        Editor-->>Page: confirmado si vigente o captura conservada
    end
```

## Reglas y recuperación

Edición no vuelve a enviar personId/contraseña. Password sólo envía clave y expectedVersion. La autorización y el almacenamiento seguro de credenciales pertenecen a la API.

## Evidencia

identityTest.ts y records.spec.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
