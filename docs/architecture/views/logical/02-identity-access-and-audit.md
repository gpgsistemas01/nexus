# 2. Identidad, acceso y auditoría

Esta vista separa identidad de negocio, autorización y registro de escrituras.
Las tablas se detallan en el [modelo persistente](data-and-persistence/index.md).

## Identidades y asignaciones

| Elemento | Responsabilidad |
| --- | --- |
| `User` | Cuenta autenticada y actor de seguridad o auditoría. |
| `Person` | Participante del negocio: solicitante, receptor, asesor o aprobador. |
| `UserRoleDepartment` | Asigna rol y departamento a una cuenta para autorizar acciones. |
| `PersonRoleDepartment` | Clasifica a una persona para búsquedas y operaciones; no concede acceso a una cuenta. |
| Cuenta PostgreSQL | Identidad de infraestructura compartida por la aplicación; no corresponde a cada usuario de Nexus. |

`User.personId` es opcional. Las cuentas humanas requieren una persona activa; las
cuentas técnicas no requieren una persona ficticia. Una cuenta inactiva o sin
asignaciones válidas no puede iniciar sesión, renovar ni superar la autorización.
La relación cuenta–persona no es uno a uno: `personId` no tiene una restricción única.

## Autorización

`getLoggedUser` lee las asignaciones vigentes y deriva `permissions`, `scope` y
`organization`. Las combinaciones autorizadas se definen en
`src/constants/permissions.js`; los permisos derivados no se persisten. Cambiar una
asignación afecta la siguiente petición autenticada; cambiar la matriz requiere
actualizar el código.

| Comprobación | Resultado ante rechazo |
| --- | --- |
| Token y cuenta válidos | La API devuelve `401 INVALID_AUTH`; web intenta renovar cuando falta un token válido. |
| Permiso en una misma combinación rol/departamento | La API devuelve `403 FORBIDDEN`; la autorización web rechazada redirige a `/error/404`. |
| Regla del recurso y alcance de datos | El servidor aplica los filtros y restricciones del caso; devuelve el error correspondiente sin conceder acceso adicional. |

El login y la renovación comprueban la cuenta y sus asignaciones. El detalle del
acceso web se mantiene en la [vista de escenarios](../scenarios/web-navigation-and-screen-catalog/02-map-visual-of-navigation.md).

## Presentación y alcance

El frontend usa `user.permissions` para el menú, acciones y columnas. No reconstruye
la matriz a partir del rol o departamento. `inventory:costs-read` controla además la
selección de costos en el servidor; ocultar una columna no protege por sí solo el dato.

`scope` delimita registros cuando la operación lo requiere; el servidor debe aplicarlo
en sus consultas. `organization` es contexto informativo. Mostrar un botón, modificar
los metadatos del navegador o llamar directamente a la API no sustituye la autorización.

## Auditoría de escrituras

Los campos como `createdById` o `returnedById` identifican al usuario que ejecuta una
operación; los participantes documentales referencian a `Person`. Las fechas de una
fila no identifican por sí solas al actor ni sus valores anteriores.

El middleware `auditWrites` registra en `CriticalWriteAudit` las escrituras API
exitosas con actor identificado: acción, recurso, entidad cuando se conoce, petición,
fecha y datos de entrada filtrados. Excluye campos sensibles como contraseñas y tokens.
El registro ocurre después de terminar la respuesta, fuera de la transacción de negocio;
un fallo de auditoría se registra en el log y no revierte la operación confirmada.

Quedan por completar la cobertura verificada por operación, los valores anterior y
resultante y la retención de auditoría. También permanecen pendientes la revocación
persistente de refresh tokens, el rate limiting de login/refresh, la protección CSRF y
la autorización por objeto uniforme. Estas capacidades no se deducen de la existencia
de una tabla o de un permiso.

La separación de credenciales de aplicación y migración se explica en la
[vista física](../physical/02-postgresql-runtime-and-migration-roles.md).
