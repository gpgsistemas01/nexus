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
cuentas técnicas no requieren una persona ficticia. Sólo las asignaciones a roles y
departamentos activos otorgan permisos. Una cuenta inactiva o sin asignaciones válidas
no puede iniciar sesión, renovar ni superar la autorización.
La relación cuenta–persona no es uno a uno: `personId` no tiene una restricción única.

## Sesión web y cookies

Express administra las cookies `accessToken` y `refreshToken`; el navegador no
necesita leer sus valores para iniciar sesión. Se emiten con `HttpOnly` y
`SameSite=Lax`. `NODE_ENV=production` añade `Secure`, por lo que requieren HTTPS;
el desarrollo y las pruebas locales admiten HTTP. La renovación y el cierre
conservan las opciones de seguridad al emitir o eliminar cookies.

El login Vue usa el mismo origen mediante proxy y sólo recuerda el nombre de usuario
si se solicita. Esa preferencia no modifica la duración de las cookies ni traslada
contraseñas o tokens a localStorage. El backend mantiene los permisos efectivos.

## Autorización

`getLoggedUser` lee las asignaciones vigentes y deriva `permissions`, `scope` y
`organization`. En una petición protegida, el middleware de token carga ese usuario
una sola vez y lo asigna a `req.user`; la autorización y los controllers reutilizan
esa instancia. El middleware de autorización sólo comprueba
`req.user.permissions`, y `/api/auth/me` responde con `req.user`, sin volver a
consultar la cuenta. Las combinaciones autorizadas se definen en
`src/constants/permissions.js`; los permisos derivados no se persisten. Cambiar una
asignación afecta la siguiente petición autenticada; cambiar la matriz requiere
actualizar el código. Login y renovación validan la cuenta en sus flujos propios,
porque no pasan por el middleware de acceso autenticado.
La consulta excluye asignaciones cuyo rol o departamento esté inactivo; las demás
asignaciones activas del usuario siguen otorgando sus permisos. El login aplica el
mismo filtro antes de verificar la contraseña y no emite tokens si no queda una
asignación activa.

`Role.key` y `Department.key` son claves persistentes e inmutables para políticas;
los nombres de ambos catálogos sólo se usan para presentación. La migración asigna
claves a los registros existentes y las altas de catálogo generan claves nuevas.
`permissions.js` define las políticas de permisos, alcance de datos y contexto
organizativo mediante esas claves. La consulta global de lectura se concede por la
clave de Director o de Dirección. La consulta de todas las salidas se concede por la
clave de Administrador del sistema o por Coordinador con clave de Almacén y
Proveeduría; las demás asignaciones limitan la consulta mediante el ID del área.
`organization` expone indicadores informativos y no sustituye los permisos del servidor.

Las áreas `IMPRESIÓN`, `TALLER 3D`, `PT/TRÁFICO`, `INSTALACIONES` y `ACABADOS`
comparten el acceso operativo para los roles Administrador del sistema, Coordinador,
Auxiliar, Operador, Instalador y Almacenista. El rol y el área deben coincidir en una
misma asignación; no basta con tenerlos en asignaciones distintas.

La limitación de inventario a sólo consulta corresponde a esas cinco áreas.
`ALMACÉN Y PROVEDURÍA` y `SISTEMAS` conservan sus permisos adicionales por rol:
gestión de inventario, compras, costos, reportes, surtidos y devoluciones. Los ajustes
administrativos y la administración de usuarios/catálogos siguen reservados al
Administrador del sistema en Sistemas. Los permisos concedidos por varias
asignaciones se acumulan; pertenecer también a un área operativa no elimina un
permiso de gestión válido de Almacén o Sistemas.

| Operación de las áreas operativas | Acceso |
| --- | --- |
| Abrir, consultar, crear y editar salidas de materiales, consumibles y merma | Permitido, sujeto al estado del documento y al alcance de consulta existente. |
| Consultar materiales, consumibles y merma | Permitido; sin costos ni acciones de escritura. |
| Consultar proveedores, clientes, personas, áreas y estados desde filtros/selectores | Permitido; la lectura no concede mantenimiento de catálogos. |
| Surtir o devolver una salida; crear, editar, eliminar o ajustar inventario; agregar stock de merma | No concedido por el acceso operativo; conserva permisos independientes de Almacén/Sistemas. |
| Compras, costos, reportes de almacén y administración de catálogos | No concedido por el acceso operativo. |

`suppliers:read` protege la consulta utilizada por el filtro de inventario;
`suppliers:manage` y `suppliers:update` conservan separadas sus escrituras.
Las páginas y botones se derivan de los mismos permisos del servidor. Se ocultan las
exportaciones de almacén y las altas de clientes/personas si falta su permiso propio.
Las asignaciones adicionales de una cuenta pueden conceder otras capacidades.
La consulta `material-templates` contiene costos para registrar merma y exige
`wastes:write`; no forma parte del inventario disponible con acceso de consulta.

| Comprobación | Resultado ante rechazo |
| --- | --- |
| Token o cuenta inválidos | La API devuelve `401 INVALID_AUTH`; web intenta renovar cuando falta un token válido y redirige a `/error/404` si la cuenta cargada no está activa o no tiene asignaciones válidas. |
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
