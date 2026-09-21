# 10. Crear salida de material o de merma — `CU-SAL-02` y `CU-SAL-09`

```mermaid
sequenceDiagram
    actor Warehouse as Almacén
    participant Route as Router de salida del contexto
    participant Validation as Validador de material o merma
    participant Controller as Controller del contexto
    participant Service as Servicio de salida
    participant Db as Prisma

    Warehouse->>Route: POST con encabezado y detalles
    Route->>Validation: validar relaciones y cantidades
    Validation->>Controller: DTO admitido y autorizado
    Controller->>Service: registrar salida
    Service->>Db: crear documento y detalles pendientes
    Db-->>Service: salida creada
    Service-->>Controller: resultado de dominio
    Controller-->>Warehouse: confirmación sin movimiento
```

Crear la salida no descuenta inventario ni registra el movimiento de surtimiento. Esos
efectos comienzan al confirmar detalles en `CU-SAL-05`, aunque la interfaz presente ambos
pasos dentro del mismo módulo.
