# 8. Editar compra de material — `CU-ENT-03`

```mermaid
sequenceDiagram
    actor Warehouse as Almacén
    participant Route as goodsReceiptApiRoute
    participant Validation as goodsReceiptHeaderValidation
    participant Controller as goodsReceiptController
    participant Service as goodsReceiptService
    participant Db as Prisma

    Warehouse->>Route: PATCH /:id con encabezado
    Route->>Validation: validar campos admitidos
    Validation->>Controller: petición válida y autorizada
    Controller->>Service: actualizar encabezado
    Service->>Db: comprobar entrada y persistir cambios
    Db-->>Service: entrada actualizada
    Service-->>Controller: resultado de dominio
    Controller-->>Warehouse: confirmación
```

La ruta vigente edita el encabezado y no vuelve a aplicar el stock de detalles ya
registrados. Agregar o corregir detalles usa operaciones distintas, por lo que no se
representan como efectos implícitos de esta secuencia.
