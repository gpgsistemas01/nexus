# Crear persona — `CU-IDA-02`

```mermaid
sequenceDiagram
    actor Admin as Administración
    participant Route as personApiRoute
    participant Validation as personValidation
    participant Controller as personController
    participant Service as personService
    participant Db as Prisma

    Admin->>Route: POST con datos de persona
    Route->>Validation: validar campos e identidad
    Validation->>Controller: datos admitidos
    Controller->>Service: registrar persona
    Service->>Db: comprobar identidad y crear
    Db-->>Service: persona creada
    Service-->>Controller: resultado de dominio
    Controller-->>Admin: confirmación
```

La validación de transporte ocurre antes del controller y la regla de identidad se
conserva en el servicio. El refresco del listado del diagrama funcional sucede en el
navegador después de esta respuesta y no es otra escritura.
