# 16. Crear compra de material — `CU-ENT-02`

```mermaid
sequenceDiagram
    actor Warehouse as Almacén
    participant Service as goodsReceiptService
    participant Rules as Proveedor · factura · receptor · detalles
    participant Tx as Transacción Prisma
    participant Inventory as movementService
    participant Cost as supplierMaterialService

    Warehouse->>Service: confirmar entrada validada
    Service->>Rules: validar relaciones y factura única
    Service->>Rules: normalizar detalles y calcular totales
    Service->>Tx: iniciar transacción
    Tx->>Tx: generar referencia anual
    Tx->>Tx: crear encabezado y detalles
    Tx->>Inventory: incrementar existencias y crear movimientos
    Inventory-->>Tx: efectos conciliados
    Tx-->>Service: commit de entrada
    Service->>Cost: actualizar costo sólo si el nuevo es mayor
    Service-->>Warehouse: entrada confirmada
```

El ajuste posterior del costo no se presenta como parte del límite atómico de documento,
stock y movimiento. Esta diferencia debe permanecer visible en pruebas y documentación.
