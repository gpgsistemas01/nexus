# Usuarios, escrituras y permisos

## Decisión

- `User` es la cuenta autenticada y el actor de seguridad/auditoría.
- `Person` representa a la persona que participa en el negocio: solicitante,
  aprobador, receptor, asesor, etcétera.
- No se debe agregar `userId` a todas las tablas. Las operaciones críticas deben
  guardar al actor explícito o emitir un evento de auditoría transaccional.
- No se necesita una cuenta PostgreSQL por cada usuario de Nexus. La aplicación usa
  una cuenta técnica; la separación de cuentas de runtime/migración se describe en
  [`postgresql-runtime-and-migration-roles.md`](postgresql-runtime-and-migration-roles.md).

## Modelo actual de acceso

La base de datos guarda las asignaciones, no las definiciones de permisos:

- `UserRoleDepartment`: rol/departamento de una cuenta; se usa para autorización.
- `PersonRoleDepartment`: clasificación de una persona para búsquedas y procesos del
  negocio. Tiene un propósito diferente y no debe sincronizarse con el acceso de la
  cuenta.
- `PERMISSIONS` y `AUTHORIZATION_POLICIES`: acciones y combinaciones autorizadas,
  versionadas en `src/constants/permissions.js`.

El flujo se mantiene simple y sin una consulta adicional de permisos:

```text
1. El administrador asigna rol + departamento en UserRoleDepartment.
2. getLoggedUser lee esas asignaciones.
3. La matriz deriva permissions; el backend calcula scope y contexto organizacional.
4. Backend autoriza; frontend solo muestra u oculta controles.
```

El administrador asigna rol/departamento al usuario. El backend recalcula sus permisos
al cargar la sesión; no copia ni persiste el arreglo derivado. Cambiar una asignación
surte efecto en la siguiente carga autenticada. Cambiar la matriz requiere desplegar
código. No hay tablas, caché, sincronización ni administración adicional de permisos.

Si el negocio necesita modificar la matriz desde la interfaz, habrá que añadir tablas
`Permission`/`RolePermission`, migración, seed, UI administrativa, auditoría y
protección contra retirar el último administrador. No es el comportamiento actual.

## Autenticación y errores

Una petición protegida pasa por:

1. Token válido y usuario activo con al menos un acceso. Si falla: `401 INVALID_AUTH`.
2. Permiso requerido contra una misma combinación rol/departamento. Si falla:
   `403 FORBIDDEN`.
3. Regla del registro: departamento, propietario, estado y separación de funciones.
   Según el caso debe responder `403`, `404` o un error de dominio.

El login y la renovación rechazan usuarios inactivos o sin accesos. Los cambios de
asignación se consultan nuevamente, por lo que no hay que esperar a que expire el
access token para bloquear las rutas.

No existen excepciones globales de lectura por método HTTP, rol o departamento. Cada
recurso de lectura debe declarar en `AUTHORIZATION_POLICIES` las combinaciones que lo
pueden consultar, incluidas las de Director o Dirección cuando correspondan.

## Frontend

El backend entrega `user.permissions`, `user.scope` y `user.organization` en las vistas y mediante
`GET /api/auth/me`. Para mostrar acciones nuevas, el frontend debe usar:

```js
editButton.hidden = !window.meta.permissions?.includes('materials:write');
```

El menú principal y las acciones de personas, materiales y mermas ya usan capacidades
derivadas. `scope` se reserva para el alcance de datos (`departmentIds`, `canReadAll`);
para columnas, costos o flujo, el frontend consume `user.organization`, calculado también
por el backend. El navegador ya no interpreta directamente la relación rol/área.

`scope` solo es necesario cuando un permiso no implica acceso a todos los registros.
Por ejemplo, `goods-issues:read` puede permitir leer únicamente el departamento del
usuario. En ese caso el backend debe aplicar `scope.departmentIds` en el `where` de
Prisma; enviarlo al frontend no aplica seguridad. Para acciones verdaderamente
globales basta el permiso y no se necesita una condición adicional de scope.

Rol y departamento siguen siendo útiles para etiquetas, filtros y contexto. No deben
usarse para volver a construir en el navegador la matriz de una acción.

Por tanto, el frontend no debe validar de nuevo la relación rol/área cuando ya consulta
`user.permissions`. La relación sigue siendo necesaria en backend porque es la
fuente persistida con la que se calculan esos permisos y porque puede definir el alcance
de los datos; no es una segunda condición que el botón deba repetir.

Los permisos del frontend solo mejoran la experiencia de usuario. Modificar
`window.meta`, mostrar un botón oculto o llamar directamente a la API no concede
acceso: el middleware del backend vuelve a autorizar cada petición.

Mientras existan permisos amplios como `GOODS_ISSUES_MANAGE`, algunos componentes
pueden conservar temporalmente sus condiciones anteriores. Esos permisos deben
separarse por acción (`read`, `create`, `update`, `approve`, `return`) antes de migrar
cada botón.

## Auditoría de escrituras

`createdAt` y `updatedAt` indican cuándo cambió una fila, pero no quién la cambió ni los
valores anteriores. Se recomienda:

- Campos de actor `User` cuando forman parte del flujo (`createdById`, `approvedById`,
  `returnedById`, etcétera).
- `Person` para participantes documentales (`requesterId`, `receivedById`, etcétera).
- Una tabla de auditoría inmutable para altas, ediciones, bajas lógicas y transiciones
  relevantes, con `actorUserId`, acción, entidad, `before`, `after`, `requestId` y fecha.
- No guardar contraseñas, cookies, tokens ni secretos en la auditoría.

Prioridad: inventario/ajustes, correcciones y cancelaciones, devoluciones, aprobación,
usuarios/asignaciones y cambios de contraseña o estado.

## Brechas pendientes

| Prioridad | Pendiente |
| --- | --- |
| P0 | Persistir, rotar y revocar refresh tokens; hoy logout solo borra la cookie local. |
| P0 | Activar rate limiting para login y refresh. |
| P0 | Aplicar autorización por objeto de forma uniforme en filtros y transacciones Prisma. |
| P1 | Aprobar con negocio la matriz central y dividir permisos `manage`. |
| P1 | Migrar menús/botones para consultar `user.permissions` en lugar de reglas duplicadas. |
| P1 | Implementar auditoría persistente de escrituras críticas. |
| P1 | Definir si `Person.isActive` condiciona a usuarios humanos y cómo tratar usuarios técnicos. |
| P1 | Definir protección CSRF explícita para métodos mutables. |
| P2 | Aprovisionar credenciales PostgreSQL distintas para runtime y migraciones. |

El manejo actual es una base válida, pero el cierre de seguridad requiere priorizar
sesiones refresh, rate limiting, alcance por objeto y auditoría.
