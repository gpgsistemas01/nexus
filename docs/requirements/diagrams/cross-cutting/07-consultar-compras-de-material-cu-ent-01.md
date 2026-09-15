# Consultar compras de material — `CU-ENT-01`

```mermaid
sequenceDiagram
    actor Warehouse as Almacén
    participant Route as goodsReceiptApiRoute
    participant Controller as goodsReceiptController
    participant Service as goodsReceiptService
    participant Db as Prisma

    Warehouse->>Route: GET con búsqueda, fechas y relaciones
    Route->>Route: verificar token y permiso
    Route->>Controller: consulta autorizada
    Controller->>Service: filtros y paginación
    Service->>Db: consultar entradas y total
    Db-->>Service: página con relaciones
    Service-->>Controller: resultado de consulta
    Controller-->>Warehouse: resultado serializado
```

La consulta no abre la transacción documental ni recalcula inventario. Los totales y
relaciones devueltos son proyecciones de lectura; el dibujo funcional los agrupa bajo
«mostrar página».
