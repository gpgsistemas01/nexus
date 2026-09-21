# 14. Crear o editar usuario y acceso — `CU-IDA-06`, `CU-IDA-07`, `CU-IDA-08`

```mermaid
sequenceDiagram
    actor Admin as Administrador del sistema
    participant Controller as userController
    participant Service as userService
    participant Person as personService
    participant Db as Prisma

    Admin->>Controller: enviar cuenta, persona, rol y departamento
    Controller->>Service: crear o editar DTO validado
    Service->>Person: comprobar persona cuando fue indicada
    alt crear usuario
        Service->>Service: cifrar contraseña
        Service->>Db: crear cuenta y asignación anidada
    else editar cuenta y acceso
        Service->>Db: iniciar transacción
        Service->>Db: actualizar cuenta y persona
        Service->>Db: eliminar asignación anterior
        Service->>Db: crear asignación rol/departamento
        Db-->>Service: commit
    else cambiar contraseña
        Service->>Service: cifrar contraseña nueva
        Service->>Db: actualizar credencial
    end
    Service-->>Controller: usuario actualizado sin exponer contraseña
```

La edición de cuenta no representa activación o desactivación: el router vigente ofrece
actualización general y cambio separado de contraseña. Si se incorpora un endpoint de
estado, deberá agregarse como caso o alternativa verificable antes de dibujar esa
transición.
