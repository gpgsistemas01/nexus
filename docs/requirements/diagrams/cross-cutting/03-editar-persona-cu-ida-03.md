# 3. Editar persona — `CU-IDA-03`

```mermaid
sequenceDiagram
    actor Admin as Administración
    participant Route as personApiRoute
    participant Validation as personValidation
    participant Controller as personController
    participant Service as personService
    participant Db as Prisma

    Admin->>Route: PUT /:id con cambios
    Route->>Validation: validar campos editables
    Validation->>Controller: petición válida
    Controller->>Service: editar persona identificada
    Service->>Db: comprobar existencia e identidad
    Service->>Db: actualizar campos admitidos
    Db-->>Service: persona actualizada
    Service-->>Controller: resultado de dominio
    Controller-->>Admin: confirmación
```

La secuencia hace visible que la existencia y la identidad no se confían al formulario.
No muestra componentes EJS ni refresco de DataTable porque pertenecen a la presentación,
no a la actualización de dominio.
