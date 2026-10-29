# Acceso y sesión: casos de uso

Las operaciones tienen fichas independientes. Cada ficha conserva actor, disparador, precondiciones, interacción numerada, alternativas con punto de entrada, excepciones y postcondiciones. El [índice de casos](../index.md) define la plantilla y las reglas de lectura.

| Caso | Objetivo |
| --- | --- |
| [CU-AUT-01](cu-aut-01.md) | Iniciar sesión. |
| [CU-AUT-02](cu-aut-02.md) | Cerrar sesión. |

## Realización y verificación del cliente

La [guía de realización Vue](../../../architecture/views/development/frontend-technical-documentation/01-authentication.md) describe captura, permisos de interfaz, contratos y propietarios del estado de esta familia. Las pruebas de navegador de esta familia están en `login.spec.ts y sessionRecovery.spec.ts`.
