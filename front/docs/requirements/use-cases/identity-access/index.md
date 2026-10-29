# Personas y usuarios: casos de uso

Las operaciones tienen fichas independientes. Cada ficha conserva actor, disparador, precondiciones, interacción numerada, alternativas con punto de entrada, excepciones y postcondiciones. El [índice de casos](../index.md) define la plantilla y las reglas de lectura.

| Caso | Objetivo |
| --- | --- |
| [CU-IDA-01](cu-ida-01.md) | Consultar personas. |
| [CU-IDA-02](cu-ida-02.md) | Crear persona. |
| [CU-IDA-03](cu-ida-03.md) | Editar persona. |
| [CU-IDA-04](cu-ida-04.md) | Generar reporte de personas. |
| [CU-IDA-05](cu-ida-05.md) | Consultar usuarios. |
| [CU-IDA-06](cu-ida-06.md) | Crear usuario y asignar acceso. |
| [CU-IDA-07](cu-ida-07.md) | Editar usuario y acceso. |
| [CU-IDA-08](cu-ida-08.md) | Cambiar contraseña de usuario. |
| [CU-IDA-09](cu-ida-09.md) | Generar reporte de usuarios. |

## Realización y verificación del cliente

La [guía de realización Vue](../../../architecture/views/development/frontend-technical-documentation/04-identity-and-directory.md) describe captura, permisos de interfaz, contratos y propietarios del estado de esta familia. Las pruebas de navegador de esta familia están en `records.spec.ts`.
