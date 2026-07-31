# Análisis de usuarios, auditoría de escrituras y permisos

## Resumen ejecutivo

Nexus **sí necesita conservar al usuario que ejecuta ciertas escrituras**, pero no es
conveniente agregar `userId` indiscriminadamente a todas las tablas. El modelo actual
ya distingue dos conceptos útiles:

- `User` representa la identidad que inicia sesión y debe usarse como **actor de
  auditoría y seguridad**.
- `Profile` representa a la persona dentro del proceso de negocio y debe usarse como
  **participante del documento** (solicitante, aprobador, receptor, asesor, etcétera).

La distinción debe mantenerse. Un solicitante o receptor puede ser información del
negocio, mientras que el usuario que capturó o modificó el registro es información de
auditoría. En ocasiones serán la misma persona, pero no significan lo mismo.

No se requiere crear un usuario de PostgreSQL por cada usuario de Nexus. La
aplicación puede continuar usando una cuenta técnica de base de datos, idealmente una
para migraciones y otra de privilegios reducidos para ejecución. La autorización de
los usuarios finales se debe aplicar en la aplicación. PostgreSQL Row-Level Security
solo sería necesario como una segunda barrera si otros clientes acceden directamente
a las tablas o existe un requisito normativo que lo exija.

## Estado actual

### Identidad y autenticación

1. El JWT contiene el `id` de `User`; en cada ruta protegida se vuelve a consultar
   `UserRoleDepartment`, por lo que los cambios de rol tienen efecto sin esperar a que
   venza el token de acceso.
2. `UserRoleDepartment` permite más de una combinación rol/departamento por usuario,
   y la autorización exige que **una misma combinación** coincida con el rol y el
   departamento requeridos. Esto evita combinar accidentalmente el rol de un acceso
   con el departamento de otro.
3. El inicio de sesión y la carga del usuario autenticado comprueban `User.isActive`.
   Un usuario inactivo no recibe tokens nuevos y deja de superar la autenticación de
   rutas aunque conserve un access token vigente. Todavía debe decidirse si
   `Profile.isActive` o la existencia de un perfil activo serán requisitos de acceso,
   porque no todos los usuarios técnicos necesariamente requieren un perfil.
4. El inicio de sesión exige al menos una fila en `UserRoleDepartment`. Un usuario sin
   asignaciones recibe el mismo error genérico de credenciales que un usuario
   inexistente, inactivo o con contraseña incorrecta, evitando revelar el estado de la
   cuenta. Si las asignaciones se retiran durante una sesión, la siguiente petición
   protegida se rechaza porque los accesos se consultan nuevamente.
5. No existe persistencia/revocación de refresh tokens; por tanto, no hay cierre de
   todas las sesiones, rotación verificable ni detección efectiva de reutilización. La
   renovación sí vuelve a exigir que el usuario permanezca activo y con accesos, de
   modo que una cuenta desactivada no puede obtener nuevos tokens.

### Autorización

Las rutas API y web protegidas aplican autenticación y después comparan listas de
nombres de roles y departamentos declaradas en cada archivo de rutas. Las rutas de
escritura revisadas cuentan con middleware de autorización; no dependen únicamente de
ocultar botones en el navegador.

El esquema actual es un RBAC contextual: `rol + departamento`. Es suficiente para el
tamaño actual si se corrigen y documentan las siguientes limitaciones:

- Los permisos ya se resuelven desde una matriz central, pero todavía comparan los
  nombres persistidos de rol/departamento y las combinaciones trasladadas desde las
  rutas aún requieren aprobación funcional. Un cambio de nombre en los catálogos debe
  actualizarse de forma coordinada con la política.
- Las respuestas API distinguen una sesión inválida (`401 INVALID_AUTH`) de un usuario
  autenticado sin el rol/departamento exigido (`403 FORBIDDEN`). El cliente redirige
  al login únicamente ante `401`; ante `403` conserva la sesión y muestra que faltan
  permisos. Así, una denegación de autorización ya no se presenta erróneamente como
  una sesión vencida.
- Todo `Director`, y cualquier acceso perteneciente a `DIRECCIÓN`, recibe lectura
  global para **cualquier** endpoint `GET` protegido, incluso si la lista local de la
  ruta no lo contempla. Es una regla muy amplia y debe aceptarse explícitamente o
  limitarse a recursos concretos.
- Un permiso de ruta contesta “puede ejecutar esta acción”, pero no necesariamente
  “puede ejecutarla sobre este registro”. Operaciones como aprobar, cancelar,
  entregar, devolver o editar requieren además reglas de negocio sobre el objeto:
  estado vigente, departamento propietario, separación creador/aprobador y alcance
  del usuario.
- `UserRoleDepartment` y `ProfileRoleDepartment` tienen propósitos diferentes y no
  deben sincronizarse: el primero autoriza a una cuenta a usar funciones del sistema;
  el segundo clasifica a una persona para participar en procesos y búsquedas del
  negocio. Por ejemplo, el middleware consulta accesos de `User`, mientras los
  selectores de solicitantes, asesores o responsables filtran perfiles. Compartir los
  catálogos `Role` y `Department` es válido; no implica que ambas asignaciones deban
  contener las mismas filas.
- La interfaz puede usar permisos para mejorar la experiencia, pero nunca debe ser la
  fuente de autorización. La decisión definitiva debe permanecer en backend.

### Trazabilidad de escrituras

El modelo conserva correctamente al actor `User` en ajustes de stock
(`createdById`/`approvedById`) y devoluciones (`returnedById`). Los documentos de
operación conservan participantes como `Profile` (`receivedById`, `requesterId`,
`approverId`, `deliveredById` y `warehouseStaffId`). Esto responde quién participó en
el proceso, pero no siempre quién capturó o cambió el dato.

Los campos `createdAt` y `updatedAt` indican cuándo ocurrió una escritura, no quién la
realizó ni qué valores cambiaron. En particular, catálogos, proveedores, clientes,
materiales, mermas y varios cambios de estado no tienen actor persistente. Los logs de
aplicación que incluyen `userId` ayudan a diagnosticar, pero no sustituyen una
auditoría persistente: pueden rotarse, estar deshabilitados o no permitir reconstruir
el antes y el después.

## Decisión recomendada para escrituras

### No agregar usuario a cada tabla

No se recomienda añadir `createdById` y `updatedById` a cada detalle o tabla derivada.
Los detalles creados en la misma transacción pueden heredar el actor de su documento
padre o de un evento de auditoría. Agregar llaves a todas las filas aumenta el costo
de migración, genera datos redundantes y no registra el cambio concreto.

### Registrar el actor en fronteras auditables

Se recomienda una estrategia híbrida:

1. **Campos explícitos de negocio** cuando el actor forma parte del flujo:
   `createdById`, `approvedById`, `cancelledById`, `returnedById` o equivalentes. Deben
   apuntar a `User`, salvo que el requisito pregunte por la persona del proceso, en
   cuyo caso se conserva además el `Profile` correspondiente.
2. **Tabla de auditoría inmutable** para altas, ediciones, bajas lógicas y transiciones
   relevantes que hoy no conservan actor. Una forma inicial sería:

   | Campo | Propósito |
   | --- | --- |
   | `id` | UUID del evento. |
   | `actorUserId` | `User` que ejecutó la acción; nullable para procesos del sistema. |
   | `action` | `CREATE`, `UPDATE`, `DELETE`, `STATUS_CHANGE`, `LOGIN`, etcétera. |
   | `entityType` / `entityId` | Recurso afectado sin forzar una FK polimórfica. |
   | `before` / `after` | JSON con los campos auditables, excluyendo secretos. |
   | `requestId` | Correlación con logs y petición HTTP. |
   | `createdAt` | Momento inmutable del evento. |

3. **Snapshots de nombres** solo donde la historia documental deba sobrevivir a
   cambios posteriores del catálogo. El esquema ya usa esta técnica en entradas y
   salidas. La FK permite navegar a la entidad actual; el snapshot conserva lo que
   decía el documento al emitirse.

Nunca se deben guardar contraseñas, tokens, cookies ni secretos en la auditoría. Para
usuarios eliminados se recomienda baja lógica (`isActive = false`) y relaciones con
`onDelete: Restrict` o `SetNull`, según la necesidad de conservación; no borrado en
cascada de la historia.

### Prioridad por dominio

| Prioridad | Escrituras | Manejo recomendado |
| --- | --- | --- |
| Crítica | ajustes, correcciones/cancelaciones de entradas, salidas, devoluciones, aprobaciones y cambios de stock | Actor `User` explícito en la operación y evento de auditoría con antes/después. |
| Alta | usuarios, asignaciones de acceso, perfiles y cambios de contraseña/estado | Auditar administrador, cambio y fecha; nunca persistir el valor de contraseña. |
| Alta | proveedores, materiales, mermas y clientes | Evento de auditoría para crear, modificar y desactivar. |
| Media | catálogos (presentación, unidad, motivo, estado) | Evento de auditoría; no hace falta repetir actor en cada fila. |
| Baja | detalles derivados creados atómicamente con un documento | Obtener actor desde el documento/evento padre. |

## Modelo de permisos propuesto

### Fuente única en código

El problema original de “permisos dispersos como nombres en rutas” no se refería a
`UserRoleDepartment`/`ProfileRoleDepartment`. Se refiere a que cada archivo de rutas
declara manualmente arreglos de texto como:

```js
const materialWritePermissions = {
    roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
    departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
};
```

Otros archivos vuelven a escribir esos nombres y combinaciones para entradas, salidas,
proveedores o reportes. No es una vulnerabilidad automática y el middleware sí exige
que rol y departamento coincidan en una misma asignación. El costo es de gobierno y
mantenimiento:

- No hay un lugar único para contestar qué acciones puede realizar cada combinación.
- Es posible corregir una lista y olvidar otra ruta equivalente.
- Renombrar un rol o departamento en la base rompe comparaciones basadas en texto.
- Revisar una nueva ruta exige detectar manualmente si copió una matriz demasiado
  amplia.

La solución implementada da nombre a cada **acción técnica** y centraliza su matriz,
sin mezclar los dos modelos de asignación. Por ejemplo:

```text
materials:read
materials:write
stock:adjust
goods-receipts:create
goods-receipts:correct
goods-receipts:cancel
goods-issues:create
goods-issues:approve
goods-issues:return
users:manage
reports:read
```

Una matriz central debe mapear cada permiso a combinaciones `role + department` de
`UserRoleDepartment`. Las rutas declaran el permiso, no vuelven a escribir nombres de
roles y departamentos. `ProfileRoleDepartment` permanece fuera de esta decisión de
seguridad y continúa utilizándose para elegibilidad y filtros del proceso.
Mientras roles y permisos sean administrados por despliegue, esa matriz puede vivir
en código, versionada y probada. Solo conviene crear tablas `Permission`,
`RolePermission` (y, si hace falta, excepciones por usuario) si el negocio necesita
configurarlos desde la interfaz sin desplegar.

La centralización se implementó en `src/constants/permissions.js` para todas las rutas
API y web que requieren autorización. Cada ruta consume una clave de `PERMISSIONS` y
el middleware resuelve exclusivamente su política central; ya no acepta objetos
locales `{ roles, departments }`. El registro y sus listas son inmutables y un permiso
sin política falla explícitamente. Esto centraliza la configuración actual sin cambiar qué
combinaciones estaban autorizadas; la revisión de negocio de cada combinación sigue
siendo una actividad separada.

No se recomienda iniciar con permisos directos por usuario: dificultan explicar por
qué alguien tiene acceso. La regla normal debe provenir del rol contextual; las
excepciones, si llegan a existir, deben expirar y quedar auditadas.

### Qué registra el administrador y qué queda en código

En el modelo actual, el administrador **no crea permisos** como `materials:write` en
la interfaz. Administra tres catálogos/asignaciones:

1. `Role` y `Department` son los catálogos compartidos.
2. Al crear o editar una cuenta, asigna combinaciones en `UserRoleDepartment`.
3. Al crear o editar una persona, asigna clasificaciones distintas en
   `ProfileRoleDepartment` para los procesos del negocio.

La pregunta de autorización se resuelve así:

```text
Ruta requiere materials:write
        ↓
Política central traduce materials:write a combinaciones permitidas
        ↓
UserRoleDepartment del usuario contiene alguna combinación permitida
        ↓
Sí: continúa / No: 403
```

Por lo tanto, existen dos niveles diferentes:

- **Asignación administrable:** qué rol/departamento tiene una cuenta; se guarda en la
  base de datos y el administrador lo modifica desde Usuarios.
- **Definición del permiso:** qué combinaciones habilitan cada acción técnica; hoy se
  versiona en `src/constants/permissions.js` y requiere despliegue para cambiarse.

Este diseño es apropiado cuando la matriz cambia poco y se desea que toda modificación
sea revisable en Git. Si el requisito real es que un administrador pueda crear
permisos o cambiar la matriz sin desplegar, entonces debe adoptarse otro modelo con
tablas como `Permission` y `RolePermission` (o una relación contextual equivalente),
pantalla administrativa, auditoría y protección contra retirar el último acceso
administrativo. No basta con mover el objeto JavaScript a una tabla: también hacen
falta validación, caché/invalidez, bootstrap de permisos y recuperación ante errores.

### Permisos en el frontend

El frontend puede recibir información de permisos para decidir si muestra un menú,
botón o acción. Eso es únicamente una **ayuda de interfaz**:

- Ocultar un botón evita ofrecer una acción que terminará en `403`.
- Mostrarlo no concede acceso.
- Un usuario puede modificar el JavaScript o llamar a la API directamente.
- El backend siempre vuelve a autenticar y autorizar con `UserRoleDepartment` y la
  política central.

El backend ya deriva las capacidades que coinciden con `UserRoleDepartment` mediante
`getGrantedPermissions`. Las vistas las reciben dentro de `user.permissions` y las
publican junto con el alcance mínimo en `window.meta`; además, `GET /api/auth/me`
permite obtener el mismo contexto de sesión. El helper cliente expone `can(permission)`
para que los componentes migren gradualmente desde condiciones de rol/departamento.
Cada petición conserva el middleware de autorización: modificar `window.meta` nunca
concede acceso en el servidor.

#### Regla práctica para el frontend

Sí: para decidir si se muestra una **acción**, es mejor preguntar por una capacidad
semántica que reconstruir autorización con rol y área:

```js
// Recomendado para acciones de UI.
if (session.permissions.includes('materials:write')) {
    showEditMaterialButton();
}

// Evitar como decisión de seguridad de la UI.
if (user.role === 'Coordinador' && user.department === 'ALMACÉN Y PROVEDURÍA') {
    showEditMaterialButton();
}
```

Rol y departamento siguen siendo necesarios para mostrar contexto (“Coordinador de
Almacén”), filtrar personas o documentos y aplicar alcance de datos. Lo que no conviene
es duplicar en el navegador la pregunta “¿esta combinación puede ejecutar esta
acción?”. Esa respuesta debe derivarla el backend desde la matriz central.

El frontend tampoco debe recibir la matriz completa de combinaciones permitidas. Debe
recibir únicamente las capacidades efectivas del usuario actual, por ejemplo:

```json
{
  "user": { "id": "...", "name": "usuario" },
  "permissions": ["materials:read", "materials:write"],
  "scope": {
    "departmentIds": ["..."],
    "canReadAll": false
  }
}
```

`permissions` contesta qué acciones puede ofrecer la interfaz; `scope` ayuda a construir
filtros, pero el backend vuelve a imponer ambos valores en cada consulta/escritura.

La lista ya puede utilizarse para permisos granulares como materiales, clientes o
mermas. Persisten dos restricciones para migrar correctamente toda la interfaz:

1. Dividir claves amplias como `GOODS_ISSUES_MANAGE` en `read`, `create`, `update` y
   `return`; una capacidad `manage` no permite decidir qué botón mostrar sin conceder
   visualmente demasiado.
2. Sustituir el bypass implícito de lectura de Director/Dirección por permisos de
   lectura explícitos. Como ese bypass depende del método HTTP, se expone por separado
   como `scope.canReadAll` y no se mezcla con permisos de escritura.

Hasta completar esos dos pasos, el cálculo antiguo por rol/departamento puede
mantenerse en componentes aún no migrados, pero no debe ampliarse con reglas nuevas.
Las nuevas acciones deben usar `can(permission)` y el backend debe seguir validándolas.

### Tres niveles de decisión

Cada petición debe pasar por:

1. **Autenticación:** token válido y usuario activo. Si falla, `401`.
2. **Permiso de acción:** el usuario posee el permiso requerido en una asignación
   activa. Si falla, `403`.
3. **Alcance/regla del objeto:** el registro pertenece a un departamento permitido,
   está en el estado correcto y satisface separación de funciones. Si no debe
   revelarse su existencia, responder `404`; en otro caso, `403` o un error de dominio
   específico.

Las consultas de listados y reportes deben recibir el alcance desde el usuario
autenticado y aplicarlo en el `where` de Prisma. Filtrar después de consultar no evita
la exposición y afecta paginación y totales.

### Matriz mínima a aprobar con negocio

Antes de implementar más tablas se debe validar, para cada acción:

| Recurso | Leer | Crear/editar | Aprobar/cancelar | Alcance |
| --- | --- | --- | --- | --- |
| Usuarios y accesos | Sistemas | Administrador de sistemas | Administrador distinto al afectado, si aplica | Global controlado. |
| Materiales/proveedores/mermas | Almacén y lectores autorizados | Almacén/Sistemas | Ajuste separado de edición ordinaria | Departamento o global explícito. |
| Requisiciones | Solicitante y áreas participantes | Solicitante autorizado | Almacén/aprobador autorizado | Propias, departamento o global. |
| Entradas | Almacén y reportes autorizados | Almacén | Corrector/cancelador autorizado | Almacén. |
| Salidas/devoluciones | Participantes y almacén | Roles autorizados | Aprobador/almacén; definir separación | Propias, departamento o global. |
| Reportes | Según sensibilidad | No aplica | No aplica | Mismo alcance que el dato fuente. |

“Director puede leer todo” y “Sistemas administra todo” deben documentarse como
decisiones explícitas, no quedar como efectos laterales de un middleware general.

## Seguridad de la cuenta PostgreSQL

Se recomienda separar credenciales:

- **Cuenta de migración:** propietaria del esquema o con privilegios DDL; usada solo
  por `prisma migrate deploy` mediante `DIRECT_URL`.
- **Cuenta de aplicación:** `CONNECT`, `USAGE` sobre el esquema y DML/uso de
  secuencias estrictamente necesarios; sin `CREATE`, `ALTER`, `DROP`, creación de
  roles ni superusuario; usada mediante `DATABASE_URL`.
- **Cuenta de solo lectura (opcional):** para BI/reportes externos, sobre vistas
  controladas y sin acceso a credenciales o tokens.

El repositorio ya selecciona `DIRECT_URL` para Prisma CLI y `DATABASE_URL` para la
aplicación, pero eso no crea cuentas ni concede privilegios automáticamente. El
procedimiento SQL, las consideraciones de propiedad y la verificación operativa se
describen en
[`postgresql-runtime-and-migration-roles.md`](postgresql-runtime-and-migration-roles.md).

Las contraseñas deben administrarse como secretos del entorno y rotarse. La cuenta de
aplicación no reemplaza la autorización de Nexus: todas las peticiones comparten esa
cuenta técnica y el actor final se obtiene del JWT validado.

## Plan de implementación recomendado

1. **Completar la identidad:** ya se exige `User.isActive` y al menos un acceso al
   iniciar sesión, y se vuelve a validar actividad/accesos en rutas protegidas. Falta
   decidir si un perfil activo es obligatorio e implementar almacenamiento y
   revocación de sesiones refresh.
2. **Formalizar la matriz:** inventariar rutas y acordar con negocio los permisos,
   alcances y separación de funciones. Cambiar denegaciones autenticadas a `403`.
3. **Revisar la autorización centralizada:** la matriz y las claves semánticas ya están
   centralizadas; falta que negocio apruebe cada combinación y dividir permisos
   `manage` donde crear, editar, cancelar o aprobar requieran actores distintos.
4. **Agregar autorización por objeto:** filtros Prisma por alcance y validaciones de
   estado/propietario en la misma transacción que la escritura.
5. **Agregar auditoría:** migración para eventos, helper transaccional obligatorio y
   adopción primero en inventario y administración de accesos.
6. **Mantener separados cuenta y perfil:** documentar `UserRoleDepartment` como fuente
   de autorización técnica y `ProfileRoleDepartment` como clasificación/elegibilidad
   del proceso. No copiar ni sincronizar automáticamente sus asignaciones.
7. **Endurecer PostgreSQL:** credenciales separadas de migración/ejecución y revisión
   periódica de `GRANT`.

### Brechas pendientes priorizadas

| Prioridad | Brecha | Riesgo actual | Criterio para cerrarla |
| --- | --- | --- | --- |
| P0 | Refresh tokens sin persistencia ni revocación | Un token robado funciona hasta siete días; logout solo borra la cookie del navegador actual. | Guardar sesiones con hash/jti, rotar en cada refresh, detectar reutilización y permitir revocar una o todas las sesiones. |
| P0 | Rate limiting deshabilitado | Login y refresh admiten intentos automatizados sin límite propio de la aplicación. | Activar limitadores, usar Redis en despliegues múltiples y probar límites/headers. |
| P1 | Matriz central aún no aprobada por negocio | La centralización preserva las combinaciones anteriores, incluidas posibles reglas demasiado amplias. | Validar cada acción con responsables, dividir permisos `manage` cuando corresponda y mantener pruebas deny-by-default. |
| P0 | Falta de autorización uniforme por objeto | Tener permiso de ruta puede permitir actuar sobre registros fuera del departamento o responsabilidad del usuario. | Aplicar alcance en el `where` de Prisma y validar estado, propiedad y separación de funciones dentro de la transacción. |
| P1 | Lectura global implícita para Director/Dirección | Un `GET` nuevo queda accesible globalmente aunque el autor de la ruta no lo haya decidido. | Sustituir el bypass global por permisos de lectura explícitos por recurso y probar datos sensibles. |
| P1 | UI calcula visibilidad desde roles/departamentos | Menús y botones pueden desalinearse de la matriz central y producir opciones ausentes o respuestas `403` evitables. | Derivar capacidades de UI en backend, enviarlas con la sesión y consumirlas en componentes, sin retirar autorización de las API. |
| P1 | Auditoría incompleta | Muchas escrituras registran cuándo, pero no actor ni antes/después. | Tabla de auditoría inmutable y eventos transaccionales, empezando por accesos e inventario. |
| P2 | Propósito de asignaciones no documentado en código | Un desarrollador podría usar accesos de perfil para autorizar una cuenta o intentar sincronizar modelos que representan cosas distintas. | Documentar y probar que `UserRoleDepartment` autoriza funciones y `ProfileRoleDepartment` determina participación/elegibilidad del negocio. |
| P1 | Estado de `Profile` no definido para autenticación | Un `User` activo puede estar ligado a un perfil inactivo; no está definido si debe operar. | Decisión explícita para usuarios humanos/técnicos y validación coherente en login, refresh y procesos. |
| P1 | Protección CSRF no explícita | La autenticación usa cookies; `SameSite=Lax` reduce el riesgo, pero no expresa una defensa verificable para toda escritura. | Definir política de origen y agregar token CSRF o validación estricta `Origin`/`Referer` para métodos mutables, con pruebas. |
| P2 | Roles PostgreSQL aún dependen de infraestructura | Si ambas URLs usan la misma cuenta con DDL, una credencial de runtime comprometida puede alterar el esquema. | Aprovisionar roles separados, guardar secretos distintos y verificar que `nexus_app` no puede ejecutar DDL. |

Los primeros cierres recomendados son sesiones refresh, rate limiting y matriz/alcance
de permisos. La auditoría debe diseñarse en paralelo antes de ampliar escrituras
críticas. La separación PostgreSQL puede ejecutarse en la siguiente ventana de
infraestructura y no requiere una migración Prisma.

## Criterio de suficiencia

La implementación será suficiente cuando pueda responderse, con una prueba o dato
persistente, a estas preguntas:

1. ¿Quién inició la petición y estaba activo en ese momento?
2. ¿Qué permiso concreto autorizó la acción y en qué departamento?
3. ¿Sobre qué registros tenía alcance?
4. ¿Qué cambió, de qué valor a cuál, y cuándo?
5. ¿Quién representó cada papel del proceso (solicitante, aprobador, receptor), aunque
   sea distinto del usuario que capturó la información?
6. ¿Puede revocarse inmediatamente el acceso y todas las sesiones de un usuario?

Con el estado actual se responden parcialmente las preguntas 2 y 5, y algunas
operaciones críticas responden la 1. Todavía no se responden de forma uniforme la 3,
4 y 6; por ello el manejo actual es una base válida, pero **no es suficiente como
modelo completo de permisos y auditoría**.
