# Cuenta, edición y contraseña

## Escenario y contratos

**Casos relacionados:** CU-IDA-06/07/08.

**Fuente técnica:** useUserEditor.ts e identityService.save. El diagrama describe el código Vue y sus fronteras. La API es un participante externo; sus transacciones internas no se atribuyen al navegador.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-006`. Mensajes numerados; líneas continuas = invocación/solicitud, discontinuas = respuesta o resultado. Las ramas representan decisiones reales; no son ejecuciones simultáneas.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Page as UserEditorPage
    participant Editor as useUserEditor
    participant Service as identityService
    participant API
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

identityTest.ts y records.spec.ts. La [matriz por caso](../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
