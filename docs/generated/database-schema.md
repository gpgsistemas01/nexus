<!-- Archivo generado por scripts/generateArchitectureDocs.js. No editar manualmente. -->
# Diagramas de la base de datos

Estos diagramas ER se generan desde los modelos y relaciones de
`prisma/schema.prisma`. Se separan por área para que puedan leerse y revisarse en
GitHub; las relaciones que cruzan áreas se describen en la sección final. La semántica
y el patrón de esta vista se describen en las
[convenciones de diagramas](../architecture/diagram-conventions.md).

La marca `PK` identifica claves primarias, `FK` claves foráneas y `UK` campos
únicos. Los campos compuestos y demás restricciones siguen teniendo como fuente de
verdad el esquema Prisma y sus migraciones. Para consultar obligatoriedad, valores
predeterminados y tipos de cada campo, usa el
[diccionario técnico](data-dictionary.md).

## Identidad, acceso y auditoría

```mermaid
erDiagram
    Department {
        String id PK
        String name UK
    }
    Role {
        String id PK
        String name UK
    }
    User {
        String id PK
        String personId FK
        String name UK
        String password
        Boolean isActive
    }
    Person {
        String id PK
        String fullName
        Boolean isActive
    }
    UserRoleDepartment {
        String userId PK,FK
        String roleId PK,FK
        String departmentId PK,FK
    }
    PersonRoleDepartment {
        String departmentId PK,FK
        String personId PK,FK
        String roleId PK,FK
    }
    CriticalWriteAudit {
        String id PK
        String actorId FK
        CriticalWriteAuditAction action
        String resource
        String entityId
        String method
        String path
        Int statusCode
        Json changes
        String requestId
        String ipAddress
        String userAgent
        DateTime createdAt
    }
    Person o|--o{ User : "person"
    User ||--o{ UserRoleDepartment : "user"
    Role ||--o{ UserRoleDepartment : "role"
    Department ||--o{ UserRoleDepartment : "department"
    Department ||--o{ PersonRoleDepartment : "department"
    Person ||--o{ PersonRoleDepartment : "person"
    Role ||--o{ PersonRoleDepartment : "role"
    User o|--o{ CriticalWriteAudit : "actor"
```

## Catálogos y relaciones comerciales

```mermaid
erDiagram
    Status {
        String id PK
        String name UK
    }
    FulfillmentStatus {
        String id PK
        String name UK
    }
    Project {
        String id PK
        String referenceNumber UK
        String client
        String name
        DateTime date
    }
    Client {
        String id PK
        String name
        String advisorId FK
    }
    Supplier {
        String id PK
        Int codeNumber
        String code UK
        String legalName
        String tradeName
        Boolean isActive
    }
    Material {
        String id PK
        String name
        String sku UK
        String presentationId FK
        String unitMeasureId FK
        Boolean isActive
        Decimal minStock
        Decimal base
        Decimal height
    }
    UnitMeasure {
        String id PK
        String name
        String symbol
    }
    Presentation {
        String id PK
        String name UK
    }
    SupplierMaterial {
        String id PK
        Decimal maxUnitCost
        String sku
        Decimal currentStock
        Decimal convertedQuantity
        String supplierId FK
        String materialId FK
    }
    ReferenceNumberCounter {
        String id PK
        String prefix
        Int counter
        Int year
    }
    Presentation ||--o{ Material : "presentation"
    UnitMeasure ||--o{ Material : "unitMeasure"
    Supplier ||--o{ SupplierMaterial : "supplier"
    Material ||--o{ SupplierMaterial : "material"
```

## Compras e inventario de materiales

```mermaid
erDiagram
    GoodsReceipt {
        String id PK
        String invoice
        Boolean isInvoiced
        String supplierId FK
        String supplierName
        String statusId FK
        String receivedById FK
        String receivedByName
        String referenceNumber UK
        DateTime receptionDate
        String observations
        Decimal totalQuantity
        Decimal totalNetPurchaseAmount
        Decimal totalGrossPurchaseAmount
        DateTime createdAt
        DateTime updatedAt
    }
    GoodsReceiptDetail {
        String id PK
        String materialId FK
        String goodsReceiptId FK
        Decimal quantity
        Decimal conversionUnitCost
        Decimal costPerUnitType
        Decimal convertedQuantity
        Decimal netPurchaseAmount
        Decimal grossPurchaseAmount
        String materialName
        GoodsReceiptDetailStatus status
        DateTime createdAt
        DateTime updatedAt
    }
    GoodsReceiptDetailChange {
        String id PK
        String goodsReceiptId FK
        String goodsReceiptDetailId FK
        String reasonId FK
        String changedById FK
        String inventoryMovementId UK,FK
        String previousMaterialId FK
        String previousMaterialName
        Decimal previousQuantity
        Decimal previousCostPerUnitType
        Decimal previousNetPurchaseAmount
        Decimal previousGrossPurchaseAmount
        String correctedMaterialId FK
        String correctedMaterialName
        Decimal correctedQuantity
        Decimal correctedCostPerUnitType
        Decimal correctedNetPurchaseAmount
        Decimal correctedGrossPurchaseAmount
        GoodsReceiptDetailChangeType changeType
        Boolean materialChanged
        Decimal quantityDifference
        Decimal costDifference
        DateTime createdAt
        DateTime updatedAt
    }
    GoodsIssue {
        String id PK
        String referenceNumber UK
        DateTime approvedDate
        DateTime requestDate
        DateTime deliveryDate
        String observations
        String projectNumber
        String departmentName
        String requesterName
        String clientName
        String advisorName
        String statusId FK
        String departmentId FK
        String approverId FK
        String requesterId FK
        String warehouseStaffId FK
        String projectId FK
        String clientId FK
        String advisorId FK
        String fulfillmentStatusId FK
        DateTime createdAt
        DateTime updatedAt
    }
    GoodsIssueDetail {
        String id PK
        String materialId FK
        String goodsIssueId FK
        String supplierId FK
        String materialName
        Decimal quantity
        Boolean applyWaste
        Decimal convertedQuantity
        Decimal maxUnitCost
        Decimal projectConvertedQuantity
        Decimal convertedQuantityDifference
        Decimal suppliedQuantity
        Decimal returnedQuantity
        Boolean isSupplied
        String fulfillmentStatusId FK
        DateTime createdAt
        DateTime updatedAt
    }
    GoodsIssueReturn {
        String id PK
        String goodsIssueId FK
        String goodsIssueDetailId FK
        String movementDetailId UK,FK
        String returnedById FK
        String materialId
        String materialName
        String supplierId
        Decimal currentTotalReturnedQuantity
        Decimal newTotalReturnedQuantity
        String observations
        DateTime createdAt
        DateTime updatedAt
    }
    InventoryMovement {
        String id PK
        String referenceNumber UK
        InventoryMovementType type
        String goodsReceiptId FK
        String goodsIssueId FK
        String stockAdjustmentId UK,FK
        DateTime date
        DateTime createdAt
        DateTime updatedAt
    }
    MovementDetail {
        String id PK
        Decimal quantity
        Decimal newStock
        Decimal previousStock
        String materialId FK
        String supplierId FK
        String goodsReceiptDetailId FK
        String goodsIssueDetailId FK
        String stockAdjustmentDetailId FK
        String movementId FK
        DateTime createdAt
        DateTime updatedAt
    }
    StockAdjustment {
        String id PK
        String referenceNumber UK
        StockAdjustmentType type
        String reasonId FK
        String observations
        AdjustmentStatus status
        String createdById FK
        String approvedById FK
        DateTime appliedAt
        DateTime createdAt
        DateTime updatedAt
    }
    StockAdjustmentDetail {
        String id PK
        String stockAdjustmentId FK
        String materialId FK
        String supplierId FK
        String materialName
        Decimal previousStock
        Decimal newStock
        Decimal difference
        Decimal previousConvertedQuantity
        Decimal newConvertedQuantity
        Decimal convertedDifference
        DateTime createdAt
        DateTime updatedAt
    }
    StockAdjustmentReason {
        String id PK
        String name UK
        Boolean isActive
        DateTime createdAt
        DateTime updatedAt
    }
    GoodsReceipt ||--o{ GoodsReceiptDetail : "goodsReceipt"
    GoodsReceipt ||--o{ GoodsReceiptDetailChange : "goodsReceipt"
    GoodsReceiptDetail ||--o{ GoodsReceiptDetailChange : "goodsReceiptDetail"
    StockAdjustmentReason ||--o{ GoodsReceiptDetailChange : "reason"
    InventoryMovement o|--o{ GoodsReceiptDetailChange : "inventoryMovement"
    GoodsIssue ||--o{ GoodsIssueDetail : "goodsIssue"
    GoodsIssue ||--o{ GoodsIssueReturn : "goodsIssue"
    GoodsIssueDetail ||--o{ GoodsIssueReturn : "goodsIssueDetail"
    MovementDetail o|--o{ GoodsIssueReturn : "movementDetail"
    GoodsReceipt o|--o{ InventoryMovement : "goodsReceipt"
    GoodsIssue o|--o{ InventoryMovement : "goodsIssue"
    StockAdjustment o|--o{ InventoryMovement : "stockAdjustment"
    GoodsReceiptDetail o|--o{ MovementDetail : "goodsReceiptDetail"
    GoodsIssueDetail o|--o{ MovementDetail : "goodsIssueDetail"
    StockAdjustmentDetail o|--o{ MovementDetail : "stockAdjustmentDetail"
    InventoryMovement ||--o{ MovementDetail : "movement"
    StockAdjustmentReason ||--o{ StockAdjustment : "reason"
    StockAdjustment ||--o{ StockAdjustmentDetail : "stockAdjustment"
```

## Mermas e inventario de merma

```mermaid
erDiagram
    Waste {
        String id PK
        String supplierId FK
        String presentationId FK
        String unitMeasureId FK
        String name
        Boolean isActive
        Decimal minStock
        Decimal base
        Decimal height
        Decimal maxUnitCost
        Decimal currentStock
        Decimal convertedQuantity
        DateTime createdAt
        DateTime updatedAt
    }
    WasteIssue {
        String id PK
        String referenceNumber UK
        DateTime requestDate
        String observations
        String projectNumber
        String departmentName
        String requesterName
        String clientName
        String advisorName
        String createdById FK
        String departmentId FK
        String requesterId FK
        String clientId FK
        String advisorId FK
        String fulfillmentStatusId FK
        String statusId FK
        DateTime createdAt
        DateTime updatedAt
    }
    WasteIssueDetail {
        String id PK
        String wasteIssueId FK
        String wasteId FK
        String materialName
        Decimal quantity
        Decimal convertedQuantity
        Decimal projectConvertedQuantity
        Decimal convertedQuantityDifference
        Decimal suppliedQuantity
        Decimal returnedQuantity
        Boolean isSupplied
        String fulfillmentStatusId FK
        DateTime createdAt
        DateTime updatedAt
    }
    WasteIssueReturn {
        String id PK
        String wasteIssueId FK
        String wasteIssueDetailId FK
        String movementDetailId UK,FK
        String returnedById FK
        String wasteId FK
        String materialName
        Decimal currentTotalReturnedQuantity
        Decimal newTotalReturnedQuantity
        String observations
        DateTime createdAt
        DateTime updatedAt
    }
    WasteMovement {
        String id PK
        String referenceNumber UK
        InventoryMovementType type
        DateTime date
        DateTime createdAt
        DateTime updatedAt
        String wasteIssueId FK
    }
    WasteMovementDetail {
        String id PK
        Decimal quantity
        Decimal newStock
        Decimal previousStock
        String wasteId FK
        String wasteStockAdjustmentDetailId FK
        String movementId FK
        String wasteIssueDetailId FK
        DateTime createdAt
        DateTime updatedAt
    }
    WasteStockAdjustment {
        String id PK
        String referenceNumber UK
        StockAdjustmentType type
        String reasonId FK
        String observations
        AdjustmentStatus status
        String createdById FK
        String approvedById FK
        String wasteMovementId UK,FK
        DateTime appliedAt
        DateTime createdAt
        DateTime updatedAt
    }
    WasteStockAdjustmentDetail {
        String id PK
        String wasteStockAdjustmentId FK
        String wasteId FK
        String materialName
        Decimal previousStock
        Decimal newStock
        Decimal difference
        Decimal previousConvertedQuantity
        Decimal newConvertedQuantity
        Decimal convertedDifference
        DateTime createdAt
        DateTime updatedAt
    }
    WasteIssue ||--o{ WasteIssueDetail : "wasteIssue"
    Waste ||--o{ WasteIssueDetail : "waste"
    WasteIssue ||--o{ WasteIssueReturn : "wasteIssue"
    WasteIssueDetail ||--o{ WasteIssueReturn : "wasteIssueDetail"
    WasteMovementDetail o|--o{ WasteIssueReturn : "movementDetail"
    Waste ||--o{ WasteIssueReturn : "waste"
    WasteIssue o|--o{ WasteMovement : "wasteIssue"
    Waste ||--o{ WasteMovementDetail : "waste"
    WasteStockAdjustmentDetail o|--o{ WasteMovementDetail : "wasteStockAdjustmentDetail"
    WasteMovement ||--o{ WasteMovementDetail : "movement"
    WasteIssueDetail o|--o{ WasteMovementDetail : "wasteIssueDetail"
    WasteMovement o|--o{ WasteStockAdjustment : "movement"
    WasteStockAdjustment ||--o{ WasteStockAdjustmentDetail : "wasteStockAdjustment"
    Waste ||--o{ WasteStockAdjustmentDetail : "waste"
```

## Relaciones entre áreas

Los modelos de identidad y catálogo son referenciados desde los documentos de compra,
salida, ajuste y merma. Para evitar repetir entidades y producir diagramas ilegibles,
cada diagrama anterior detalla las relaciones internas de su área y la vista siguiente
muestra sólo las asociaciones que cruzan esos límites. Los atributos permanecen en las
vistas por área y en el diccionario técnico.

```mermaid
erDiagram
    Supplier ||--o{ Waste : "supplier"
    Presentation ||--o{ Waste : "presentation"
    UnitMeasure ||--o{ Waste : "unitMeasure"
    StockAdjustmentReason ||--o{ WasteStockAdjustment : "reason"
    User ||--o{ WasteStockAdjustment : "createdBy"
    User o|--o{ WasteStockAdjustment : "approvedBy"
    User ||--o{ WasteIssue : "createdBy"
    Department ||--o{ WasteIssue : "department"
    Person ||--o{ WasteIssue : "requester"
    Client ||--o{ WasteIssue : "client"
    Person ||--o{ WasteIssue : "advisor"
    FulfillmentStatus ||--o{ WasteIssue : "fulfillmentStatus"
    Status ||--o{ WasteIssue : "status"
    FulfillmentStatus ||--o{ WasteIssueDetail : "fulfillmentStatus"
    User o|--o{ WasteIssueReturn : "returnedBy"
    Person o|--o{ Client : "advisor"
    Person ||--o{ GoodsReceipt : "receivedBy"
    Supplier ||--o{ GoodsReceipt : "supplier"
    Status ||--o{ GoodsReceipt : "status"
    Material ||--o{ GoodsReceiptDetail : "material"
    Department ||--o{ GoodsIssue : "department"
    Person o|--o{ GoodsIssue : "approver"
    Person ||--o{ GoodsIssue : "requester"
    Person o|--o{ GoodsIssue : "warehouseStaff"
    Status ||--o{ GoodsIssue : "status"
    Project o|--o{ GoodsIssue : "project"
    Client ||--o{ GoodsIssue : "client"
    Person ||--o{ GoodsIssue : "advisor"
    FulfillmentStatus o|--o{ GoodsIssue : "fulfillmentStatus"
    Material ||--o{ GoodsIssueDetail : "material"
    Supplier ||--o{ GoodsIssueDetail : "supplier"
    FulfillmentStatus ||--o{ GoodsIssueDetail : "fulfillmentStatus"
    User o|--o{ GoodsIssueReturn : "returnedBy"
    Material ||--o{ MovementDetail : "material"
    Supplier ||--o{ MovementDetail : "supplier"
    User ||--o{ StockAdjustment : "createdBy"
    User o|--o{ StockAdjustment : "approvedBy"
    Material ||--o{ StockAdjustmentDetail : "material"
    Supplier ||--o{ StockAdjustmentDetail : "supplier"
    User ||--o{ GoodsReceiptDetailChange : "changedBy"
    Material ||--o{ GoodsReceiptDetailChange : "previousMaterial"
    Material ||--o{ GoodsReceiptDetailChange : "correctedMaterial"
```

Consulta el esquema Prisma para las reglas `onDelete`/`onUpdate`. Una relación puede
aparecer con el nombre del campo inverso porque la vista se deriva de la relación Prisma;
la dirección de lectura no implica propiedad del proceso de negocio.
