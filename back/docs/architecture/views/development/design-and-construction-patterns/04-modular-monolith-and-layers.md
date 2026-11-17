# 4. Monolito modular por dominio y capas de la API

La API se ejecuta en una aplicación Node y organiza su código por dominios y
responsabilidades. Una solicitud sigue, en general, este recorrido:

```text
router/middleware → controller/DTO → servicio de dominio → repository/Prisma → PostgreSQL
```

Los routers definen el contrato HTTP y aplican middleware de sesión, permisos y
validación. Los controllers adaptan `req` y `res`, y delegan reglas de negocio a
servicios. Los servicios coordinan consultas y escrituras; repositories y Prisma
acceden a la base, propagando el cliente transaccional cuando la operación lo requiere.

Las carpetas bajo `routes/api`, `controllers/api` y `services` conservan el dominio de
la operación. Las variantes de materiales y consumibles fijan el contexto y delegan
en núcleos compartidos cuando las reglas coinciden. Los colaboradores transversales
se mantienen separados, sin convertir cada helper en una capa.

La aplicación comparte módulos puros desde `src/shared` con el consumidor Vue, pero
esa distribución no traslada validación ni autorización al cliente. Los workers Excel
son temporales del proceso API. Socket.IO publica avisos después de completar
operaciones y no reemplaza la respuesta HTTP.

El recorrido concreto se verifica en las [secuencias API](../../processes/index.md)
y las [colaboraciones por módulo](../code-structure/03-backend-domains-and-dependencies.md).
