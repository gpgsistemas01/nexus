# 1. Consultar personas y usuarios — `CU-IDA-01` y `CU-IDA-05`

```mermaid
sequenceDiagram
    actor Admin as Administrador del sistema
    participant Route as personApiRoute / userApiRoute
    participant Auth as Autenticación y permiso
    participant Controller as personController / userController
    participant Service as personService / userService
    participant Db as Prisma

    Admin->>Route: solicitar listado con filtros
    Route->>Auth: verificar token y permiso del recurso
    Auth->>Controller: petición autorizada
    Controller->>Service: consulta normalizada
    Service->>Db: buscar y contar registros
    Db-->>Service: página y total
    Service-->>Controller: resultado autorizado
    Controller-->>Admin: respuesta paginada
```

Personas y usuarios son consultas separadas y conservan permisos, filtros y forma de
respuesta propios. La vista omite el montaje completo de la URL, que permanece en el
mapa generado, y no implica que una consulta entregue credenciales.
