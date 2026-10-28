# `CU-AUT-02` — Cerrar sesión

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-AUT-02` |
| Nombre | Cerrar sesión. |
| Actor | Usuario registrado con sesión autenticada. |
| Disparador | Decide terminar su acceso a Nexus. |
| Precondiciones | 1. El actor dispone de una sesión autenticada. |
| Flujo principal | 1. **Actor:** selecciona «Cerrar sesión» **(ver E1)**.<br>2. **Nexus:** cierra el acceso de la sesión en ese navegador, lleva al actor a la página de inicio de sesión y confirma el cierre. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La sesión queda cerrada en ese navegador; el actor debe volver a iniciar sesión para acceder al contenido protegido.<br>2. **Fallo:** El sistema no debe presentar contenido protegido sin volver a comprobar una sesión válida. |
| Requisitos relacionados | `RF-AUT-003`, `RN-001`. |

El cierre disponible elimina el acceso conservado por ese navegador. La invalidación central de credenciales previamente emitidas permanece pendiente; por eso `RF-AUT-003` se registra como Parcial. La brecha técnica se mantiene en [acceso y auditoría](../../../architecture/views/processes/01-session/01-bootstrap-and-session.md).

## Realización y verificación del cliente

La [guía de realización Vue](../../../architecture/views/development/frontend-technical-documentation/01-authentication.md) describe captura, permisos de interfaz, contratos y propietarios del estado. La [cobertura por caso](../../../testing/04-use-case-coverage.md) identifica la evidencia y sus límites. Las pruebas de navegador de esta familia están en `login.spec.ts y sessionRecovery.spec.ts`; la existencia del archivo no acredita por sí sola todos los pasos de esta ficha.

## Diagramas de realización

- [Cierre de sesión y acceso posterior](../../../architecture/views/processes/01-session/03-logout.md).
