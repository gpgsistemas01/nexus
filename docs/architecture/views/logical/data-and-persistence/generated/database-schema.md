<!-- Archivo generado por scripts/generateArchitectureDocs.js. No editar manualmente. -->
# Diagramas de la base de datos

Estos diagramas representan el modelo relacional persistente con notación ER de pata
de cuervo. Se generan desde los modelos y relaciones de
`prisma/schema.prisma`. Se separan por área para que puedan leerse y revisarse en
GitHub. Los atributos se distribuyen en figuras de hasta tres modelos. Cada figura
incluye sus relaciones entrantes y salientes; los modelos externos muestran sólo las
claves que intervienen en esas conexiones y conservan sus atributos completos en su
figura propietaria. Cada conexión expresa FK = clave referenciada entre los modelos de sus extremos; la
tabla final detalla los nombres completos. Los nombres de
relación del ORM no son columnas adicionales. Todas las correspondencias de claves se
reúnen en una tabla final para evitar otra colección de diagramas sin atributos.

La marca `PK` identifica claves primarias, `FK` claves foráneas y `UK` campos
únicos. Los campos compuestos y demás restricciones siguen teniendo como fuente de
verdad el esquema Prisma y sus migraciones. Para consultar obligatoriedad, valores
predeterminados y tipos de cada campo, usa el
[diccionario técnico](data-dictionary.md).

Las cardinalidades distinguen relaciones uno a muchos de relaciones uno a uno cuando
la FK es única. El extremo del destino indica si la referencia es obligatoria
(`||`) u opcional (`o|`); el extremo del modelo que contiene la FK indica cero o
muchos (`o{`) o cero o uno (`o|`).

Modelos sin relaciones FK entrantes ni salientes en Prisma: `ReferenceNumberCounter`.

## Identidad, acceso y auditoría

### Department · Role · User

```mermaid
erDiagram
    direction LR
    Department {
        String id PK
        String name UK
        Boolean isActive
    }
    Role {
        String id PK
        String name UK
        Boolean isActive
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
    }
    CriticalWriteAudit {
        String actorId FK
    }
    UserRoleDepartment {
        String userId PK,FK
        String roleId PK,FK
        String departmentId PK,FK
    }
    PersonRoleDepartment {
        String departmentId PK,FK
        String roleId PK,FK
    }
    WasteStockAdjustment {
        String createdById FK
        String approvedById FK
    }
    WasteStockEntry {
        String createdById FK
    }
    WasteIssue {
        String createdById FK
        String departmentId FK
    }
    WasteIssueReturn {
        String returnedById FK
    }
    GoodsIssue {
        String departmentId FK
    }
    GoodsIssueReturn {
        String returnedById FK
    }
    StockAdjustment {
        String createdById FK
        String approvedById FK
    }
    GoodsReceiptDetailChange {
        String changedById FK
    }
    Person o|..o{ User : "personId = id"
    User o|..o{ CriticalWriteAudit : "actorId = id"
    User ||--o{ UserRoleDepartment : "userId = id"
    Role ||--o{ UserRoleDepartment : "roleId = id"
    Department ||--o{ UserRoleDepartment : "departmentId = id"
    Department ||--o{ PersonRoleDepartment : "departmentId = id"
    Role ||--o{ PersonRoleDepartment : "roleId = id"
    User ||..o{ WasteStockAdjustment : "createdById = id"
    User o|..o{ WasteStockAdjustment : "approvedById = id"
    User ||..o{ WasteStockEntry : "createdById = id"
    User ||..o{ WasteIssue : "createdById = id"
    Department ||..o{ WasteIssue : "departmentId = id"
    User o|..o{ WasteIssueReturn : "returnedById = id"
    Department ||..o{ GoodsIssue : "departmentId = id"
    User o|..o{ GoodsIssueReturn : "returnedById = id"
    User ||..o{ StockAdjustment : "createdById = id"
    User o|..o{ StockAdjustment : "approvedById = id"
    User ||..o{ GoodsReceiptDetailChange : "changedById = id"
```

### Person · UserRoleDepartment · PersonRoleDepartment

```mermaid
erDiagram
    direction LR
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
    User {
        String id PK
        String personId FK
    }
    Role {
        String id PK
    }
    Department {
        String id PK
    }
    WasteIssue {
        String requesterId FK
        String advisorId FK
    }
    Client {
        String advisorId FK
    }
    GoodsReceipt {
        String receivedById FK
    }
    GoodsIssue {
        String approverId FK
        String requesterId FK
        String warehouseStaffId FK
        String advisorId FK
    }
    Person o|..o{ User : "personId = id"
    User ||--o{ UserRoleDepartment : "userId = id"
    Role ||--o{ UserRoleDepartment : "roleId = id"
    Department ||--o{ UserRoleDepartment : "departmentId = id"
    Department ||--o{ PersonRoleDepartment : "departmentId = id"
    Person ||--o{ PersonRoleDepartment : "personId = id"
    Role ||--o{ PersonRoleDepartment : "roleId = id"
    Person ||..o{ WasteIssue : "requesterId = id"
    Person ||..o{ WasteIssue : "advisorId = id"
    Person o|..o{ Client : "advisorId = id"
    Person ||..o{ GoodsReceipt : "receivedById = id"
    Person o|..o{ GoodsIssue : "approverId = id"
    Person ||..o{ GoodsIssue : "requesterId = id"
    Person o|..o{ GoodsIssue : "warehouseStaffId = id"
    Person ||..o{ GoodsIssue : "advisorId = id"
```

### CriticalWriteAudit

```mermaid
erDiagram
    direction LR
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
    User {
        String id PK
    }
    User o|..o{ CriticalWriteAudit : "actorId = id"
```

## Catálogos y relaciones comerciales

### Status · FulfillmentStatus · Project

```mermaid
erDiagram
    direction LR
    Status {
        String id PK
        String name UK
    }
    FulfillmentStatus {
        String id PK
        String name UK
        Boolean isActive
    }
    Project {
        String id PK
        String referenceNumber UK
        String client
        String name
        DateTime date
    }
    WasteIssue {
        String fulfillmentStatusId FK
        String statusId FK
    }
    WasteIssueDetail {
        String fulfillmentStatusId FK
    }
    GoodsReceipt {
        String statusId FK
    }
    GoodsIssue {
        String statusId FK
        String projectId FK
        String fulfillmentStatusId FK
    }
    GoodsIssueDetail {
        String fulfillmentStatusId FK
    }
    FulfillmentStatus ||..o{ WasteIssue : "fulfillmentStatusId = id"
    Status ||..o{ WasteIssue : "statusId = id"
    FulfillmentStatus ||..o{ WasteIssueDetail : "fulfillmentStatusId = id"
    Status ||..o{ GoodsReceipt : "statusId = id"
    Status ||..o{ GoodsIssue : "statusId = id"
    Project o|..o{ GoodsIssue : "projectId = id"
    FulfillmentStatus o|..o{ GoodsIssue : "fulfillmentStatusId = id"
    FulfillmentStatus ||..o{ GoodsIssueDetail : "fulfillmentStatusId = id"
```

### Client · Supplier · Material

```mermaid
erDiagram
    direction LR
    Client {
        String id PK
        String name
        Boolean isActive
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
        Decimal minStock
        Decimal base
        Decimal height
        MaterialType type
    }
    Presentation {
        String id PK
    }
    UnitMeasure {
        String id PK
    }
    SupplierMaterial {
        String supplierId FK
        String materialId FK
    }
    Waste {
        String supplierId FK
    }
    WasteIssue {
        String clientId FK
    }
    Person {
        String id PK
    }
    GoodsReceipt {
        String supplierId FK
    }
    GoodsReceiptDetail {
        String materialId FK
    }
    GoodsIssue {
        String clientId FK
    }
    GoodsIssueDetail {
        String materialId FK
        String supplierId FK
    }
    MovementDetail {
        String materialId FK
        String supplierId FK
    }
    StockAdjustmentDetail {
        String materialId FK
        String supplierId FK
    }
    GoodsReceiptDetailChange {
        String previousMaterialId FK
        String correctedMaterialId FK
    }
    Presentation ||..o{ Material : "presentationId = id"
    UnitMeasure ||..o{ Material : "unitMeasureId = id"
    Supplier ||..o{ SupplierMaterial : "supplierId = id"
    Material ||..o{ SupplierMaterial : "materialId = id"
    Supplier ||..o{ Waste : "supplierId = id"
    Client ||..o{ WasteIssue : "clientId = id"
    Person o|..o{ Client : "advisorId = id"
    Supplier ||..o{ GoodsReceipt : "supplierId = id"
    Material ||..o{ GoodsReceiptDetail : "materialId = id"
    Client ||..o{ GoodsIssue : "clientId = id"
    Material ||..o{ GoodsIssueDetail : "materialId = id"
    Supplier ||..o{ GoodsIssueDetail : "supplierId = id"
    Material ||..o{ MovementDetail : "materialId = id"
    Supplier ||..o{ MovementDetail : "supplierId = id"
    Material ||..o{ StockAdjustmentDetail : "materialId = id"
    Supplier ||..o{ StockAdjustmentDetail : "supplierId = id"
    Material ||..o{ GoodsReceiptDetailChange : "previousMaterialId = id"
    Material ||..o{ GoodsReceiptDetailChange : "correctedMaterialId = id"
```

### UnitMeasure · Presentation · SupplierMaterial

```mermaid
erDiagram
    direction LR
    UnitMeasure {
        String id PK
        String name
        String symbol
        Boolean isActive
    }
    Presentation {
        String id PK
        String name UK
        Boolean isActive
    }
    SupplierMaterial {
        String id PK
        Decimal maxUnitCost
        String sku
        Decimal currentStock
        Decimal convertedQuantity
        Boolean isActive
        String supplierId FK
        String materialId FK
    }
    Material {
        String id PK
        String presentationId FK
        String unitMeasureId FK
    }
    Supplier {
        String id PK
    }
    Waste {
        String presentationId FK
        String unitMeasureId FK
    }
    Presentation ||..o{ Material : "presentationId = id"
    UnitMeasure ||..o{ Material : "unitMeasureId = id"
    Supplier ||..o{ SupplierMaterial : "supplierId = id"
    Material ||..o{ SupplierMaterial : "materialId = id"
    Presentation ||..o{ Waste : "presentationId = id"
    UnitMeasure ||..o{ Waste : "unitMeasureId = id"
```

### ReferenceNumberCounter

```mermaid
erDiagram
    direction LR
    ReferenceNumberCounter {
        String id PK
        String prefix
        Int counter
        Int year
    }


```

## Compras e inventario de materiales

### GoodsReceipt · GoodsReceiptDetail · GoodsReceiptDetailChange

```mermaid
erDiagram
    direction LR
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
        MaterialType type
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
    Person {
        String id PK
    }
    Supplier {
        String id PK
    }
    Status {
        String id PK
    }
    Material {
        String id PK
    }
    InventoryMovement {
        String id PK
        String goodsReceiptId FK
    }
    MovementDetail {
        String goodsReceiptDetailId FK
    }
    StockAdjustmentReason {
        String id PK
    }
    User {
        String id PK
    }
    Person ||..o{ GoodsReceipt : "receivedById = id"
    Supplier ||..o{ GoodsReceipt : "supplierId = id"
    Status ||..o{ GoodsReceipt : "statusId = id"
    GoodsReceipt ||..o{ GoodsReceiptDetail : "goodsReceiptId = id"
    Material ||..o{ GoodsReceiptDetail : "materialId = id"
    GoodsReceipt o|..o{ InventoryMovement : "goodsReceiptId = id"
    GoodsReceiptDetail o|..o{ MovementDetail : "goodsReceiptDetailId = id"
    GoodsReceipt ||..o{ GoodsReceiptDetailChange : "goodsReceiptId = id"
    GoodsReceiptDetail ||..o{ GoodsReceiptDetailChange : "goodsReceiptDetailId = id"
    StockAdjustmentReason ||..o{ GoodsReceiptDetailChange : "reasonId = id"
    User ||..o{ GoodsReceiptDetailChange : "changedById = id"
    Material ||..o{ GoodsReceiptDetailChange : "previousMaterialId = id"
    Material ||..o{ GoodsReceiptDetailChange : "correctedMaterialId = id"
    InventoryMovement o|..o| GoodsReceiptDetailChange : "inventoryMovementId = id"
```

### GoodsIssue · GoodsIssueDetail · GoodsIssueReturn

```mermaid
erDiagram
    direction LR
    GoodsIssue {
        String id PK
        MaterialType type
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
    Department {
        String id PK
    }
    Person {
        String id PK
    }
    Status {
        String id PK
    }
    Project {
        String id PK
    }
    Client {
        String id PK
    }
    FulfillmentStatus {
        String id PK
    }
    Material {
        String id PK
    }
    Supplier {
        String id PK
    }
    MovementDetail {
        String id PK
        String goodsIssueDetailId FK
    }
    User {
        String id PK
    }
    InventoryMovement {
        String goodsIssueId FK
    }
    Department ||..o{ GoodsIssue : "departmentId = id"
    Person o|..o{ GoodsIssue : "approverId = id"
    Person ||..o{ GoodsIssue : "requesterId = id"
    Person o|..o{ GoodsIssue : "warehouseStaffId = id"
    Status ||..o{ GoodsIssue : "statusId = id"
    Project o|..o{ GoodsIssue : "projectId = id"
    Client ||..o{ GoodsIssue : "clientId = id"
    Person ||..o{ GoodsIssue : "advisorId = id"
    FulfillmentStatus o|..o{ GoodsIssue : "fulfillmentStatusId = id"
    Material ||..o{ GoodsIssueDetail : "materialId = id"
    Supplier ||..o{ GoodsIssueDetail : "supplierId = id"
    GoodsIssue ||..o{ GoodsIssueDetail : "goodsIssueId = id"
    FulfillmentStatus ||..o{ GoodsIssueDetail : "fulfillmentStatusId = id"
    GoodsIssue ||..o{ GoodsIssueReturn : "goodsIssueId = id"
    GoodsIssueDetail ||..o{ GoodsIssueReturn : "goodsIssueDetailId = id"
    MovementDetail o|..o| GoodsIssueReturn : "movementDetailId = id"
    User o|..o{ GoodsIssueReturn : "returnedById = id"
    GoodsIssue o|..o{ InventoryMovement : "goodsIssueId = id"
    GoodsIssueDetail o|..o{ MovementDetail : "goodsIssueDetailId = id"
```

### InventoryMovement · MovementDetail · StockAdjustment

```mermaid
erDiagram
    direction LR
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
    GoodsIssueReturn {
        String movementDetailId UK,FK
    }
    GoodsReceipt {
        String id PK
    }
    GoodsIssue {
        String id PK
    }
    Material {
        String id PK
    }
    Supplier {
        String id PK
    }
    GoodsReceiptDetail {
        String id PK
    }
    GoodsIssueDetail {
        String id PK
    }
    StockAdjustmentDetail {
        String id PK
        String stockAdjustmentId FK
    }
    StockAdjustmentReason {
        String id PK
    }
    User {
        String id PK
    }
    GoodsReceiptDetailChange {
        String inventoryMovementId UK,FK
    }
    MovementDetail o|..o| GoodsIssueReturn : "movementDetailId = id"
    GoodsReceipt o|..o{ InventoryMovement : "goodsReceiptId = id"
    GoodsIssue o|..o{ InventoryMovement : "goodsIssueId = id"
    StockAdjustment o|..o| InventoryMovement : "stockAdjustmentId = id"
    Material ||..o{ MovementDetail : "materialId = id"
    Supplier ||..o{ MovementDetail : "supplierId = id"
    GoodsReceiptDetail o|..o{ MovementDetail : "goodsReceiptDetailId = id"
    GoodsIssueDetail o|..o{ MovementDetail : "goodsIssueDetailId = id"
    StockAdjustmentDetail o|..o{ MovementDetail : "stockAdjustmentDetailId = id"
    InventoryMovement ||..o{ MovementDetail : "movementId = id"
    StockAdjustmentReason ||..o{ StockAdjustment : "reasonId = id"
    User ||..o{ StockAdjustment : "createdById = id"
    User o|..o{ StockAdjustment : "approvedById = id"
    StockAdjustment ||..o{ StockAdjustmentDetail : "stockAdjustmentId = id"
    InventoryMovement o|..o| GoodsReceiptDetailChange : "inventoryMovementId = id"
```

### StockAdjustmentDetail · StockAdjustmentReason

```mermaid
erDiagram
    direction LR
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
    WasteStockAdjustment {
        String reasonId FK
    }
    MovementDetail {
        String stockAdjustmentDetailId FK
    }
    StockAdjustment {
        String id PK
        String reasonId FK
    }
    Material {
        String id PK
    }
    Supplier {
        String id PK
    }
    GoodsReceiptDetailChange {
        String reasonId FK
    }
    StockAdjustmentReason ||..o{ WasteStockAdjustment : "reasonId = id"
    StockAdjustmentDetail o|..o{ MovementDetail : "stockAdjustmentDetailId = id"
    StockAdjustmentReason ||..o{ StockAdjustment : "reasonId = id"
    StockAdjustment ||..o{ StockAdjustmentDetail : "stockAdjustmentId = id"
    Material ||..o{ StockAdjustmentDetail : "materialId = id"
    Supplier ||..o{ StockAdjustmentDetail : "supplierId = id"
    StockAdjustmentReason ||..o{ GoodsReceiptDetailChange : "reasonId = id"
```

## Mermas e inventario de merma

### Waste · WasteIssue · WasteIssueDetail

```mermaid
erDiagram
    direction LR
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
    Supplier {
        String id PK
    }
    Presentation {
        String id PK
    }
    UnitMeasure {
        String id PK
    }
    WasteStockAdjustmentDetail {
        String wasteId FK
    }
    WasteMovement {
        String wasteIssueId FK
    }
    WasteStockEntry {
        String wasteId FK
    }
    WasteMovementDetail {
        String wasteId FK
        String wasteIssueDetailId FK
    }
    User {
        String id PK
    }
    Department {
        String id PK
    }
    Person {
        String id PK
    }
    Client {
        String id PK
    }
    FulfillmentStatus {
        String id PK
    }
    Status {
        String id PK
    }
    WasteIssueReturn {
        String wasteIssueId FK
        String wasteIssueDetailId FK
        String wasteId FK
    }
    Supplier ||..o{ Waste : "supplierId = id"
    Presentation ||..o{ Waste : "presentationId = id"
    UnitMeasure ||..o{ Waste : "unitMeasureId = id"
    Waste ||..o{ WasteStockAdjustmentDetail : "wasteId = id"
    WasteIssue o|..o{ WasteMovement : "wasteIssueId = id"
    Waste ||..o{ WasteStockEntry : "wasteId = id"
    Waste ||..o{ WasteMovementDetail : "wasteId = id"
    WasteIssueDetail o|..o{ WasteMovementDetail : "wasteIssueDetailId = id"
    User ||..o{ WasteIssue : "createdById = id"
    Department ||..o{ WasteIssue : "departmentId = id"
    Person ||..o{ WasteIssue : "requesterId = id"
    Client ||..o{ WasteIssue : "clientId = id"
    Person ||..o{ WasteIssue : "advisorId = id"
    FulfillmentStatus ||..o{ WasteIssue : "fulfillmentStatusId = id"
    Status ||..o{ WasteIssue : "statusId = id"
    WasteIssue ||..o{ WasteIssueDetail : "wasteIssueId = id"
    Waste ||..o{ WasteIssueDetail : "wasteId = id"
    FulfillmentStatus ||..o{ WasteIssueDetail : "fulfillmentStatusId = id"
    WasteIssue ||..o{ WasteIssueReturn : "wasteIssueId = id"
    WasteIssueDetail ||..o{ WasteIssueReturn : "wasteIssueDetailId = id"
    Waste ||..o{ WasteIssueReturn : "wasteId = id"
```

### WasteIssueReturn · WasteMovement · WasteMovementDetail

```mermaid
erDiagram
    direction LR
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
        String wasteMovementId UK,FK
    }
    WasteIssue {
        String id PK
    }
    WasteStockEntry {
        String wasteMovementId UK,FK
    }
    Waste {
        String id PK
    }
    WasteStockAdjustmentDetail {
        String id PK
    }
    WasteIssueDetail {
        String id PK
    }
    User {
        String id PK
    }
    WasteMovement o|..o| WasteStockAdjustment : "wasteMovementId = id"
    WasteIssue o|..o{ WasteMovement : "wasteIssueId = id"
    WasteMovement ||..o| WasteStockEntry : "wasteMovementId = id"
    Waste ||..o{ WasteMovementDetail : "wasteId = id"
    WasteStockAdjustmentDetail o|..o{ WasteMovementDetail : "wasteStockAdjustmentDetailId = id"
    WasteMovement ||..o{ WasteMovementDetail : "movementId = id"
    WasteIssueDetail o|..o{ WasteMovementDetail : "wasteIssueDetailId = id"
    WasteIssue ||..o{ WasteIssueReturn : "wasteIssueId = id"
    WasteIssueDetail ||..o{ WasteIssueReturn : "wasteIssueDetailId = id"
    WasteMovementDetail o|..o| WasteIssueReturn : "movementDetailId = id"
    User o|..o{ WasteIssueReturn : "returnedById = id"
    Waste ||..o{ WasteIssueReturn : "wasteId = id"
```

### WasteStockEntry · WasteStockAdjustment · WasteStockAdjustmentDetail

```mermaid
erDiagram
    direction LR
    WasteStockEntry {
        String id PK
        String referenceNumber UK
        String wasteId FK
        String createdById FK
        String wasteMovementId UK,FK
        String materialName
        Decimal quantity
        Decimal previousStock
        Decimal newStock
        String observations
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
    StockAdjustmentReason {
        String id PK
    }
    User {
        String id PK
    }
    WasteMovement {
        String id PK
    }
    Waste {
        String id PK
    }
    WasteMovementDetail {
        String wasteStockAdjustmentDetailId FK
    }
    StockAdjustmentReason ||..o{ WasteStockAdjustment : "reasonId = id"
    User ||..o{ WasteStockAdjustment : "createdById = id"
    User o|..o{ WasteStockAdjustment : "approvedById = id"
    WasteMovement o|..o| WasteStockAdjustment : "wasteMovementId = id"
    WasteStockAdjustment ||..o{ WasteStockAdjustmentDetail : "wasteStockAdjustmentId = id"
    Waste ||..o{ WasteStockAdjustmentDetail : "wasteId = id"
    Waste ||..o{ WasteStockEntry : "wasteId = id"
    User ||..o{ WasteStockEntry : "createdById = id"
    WasteMovement ||..o| WasteStockEntry : "wasteMovementId = id"
    WasteStockAdjustmentDetail o|..o{ WasteMovementDetail : "wasteStockAdjustmentDetailId = id"
```

## Correspondencias de claves entre modelos

Las claves compuestas se corresponden por posición. «Referenciados por dependiente»
indica cuántos destinos admite cada registro con FK; «Dependientes por referenciado»
indica la cardinalidad inversa. La línea continua del diagrama identifica una FK que
forma parte de la PK del dependiente; la discontinua, una relación no identificadora.

| Campos FK del dependiente | Clave referenciada | Referenciados por dependiente | Dependientes por referenciado |
| --- | --- | --- | --- |
| `User.personId` | `Person.id` | 0..1 | 0..N |
| `CriticalWriteAudit.actorId` | `User.id` | 0..1 | 0..N |
| `UserRoleDepartment.userId` | `User.id` | 1 | 0..N |
| `UserRoleDepartment.roleId` | `Role.id` | 1 | 0..N |
| `UserRoleDepartment.departmentId` | `Department.id` | 1 | 0..N |
| `PersonRoleDepartment.departmentId` | `Department.id` | 1 | 0..N |
| `PersonRoleDepartment.personId` | `Person.id` | 1 | 0..N |
| `PersonRoleDepartment.roleId` | `Role.id` | 1 | 0..N |
| `Material.presentationId` | `Presentation.id` | 1 | 0..N |
| `Material.unitMeasureId` | `UnitMeasure.id` | 1 | 0..N |
| `SupplierMaterial.supplierId` | `Supplier.id` | 1 | 0..N |
| `SupplierMaterial.materialId` | `Material.id` | 1 | 0..N |
| `Waste.supplierId` | `Supplier.id` | 1 | 0..N |
| `Waste.presentationId` | `Presentation.id` | 1 | 0..N |
| `Waste.unitMeasureId` | `UnitMeasure.id` | 1 | 0..N |
| `WasteStockAdjustment.reasonId` | `StockAdjustmentReason.id` | 1 | 0..N |
| `WasteStockAdjustment.createdById` | `User.id` | 1 | 0..N |
| `WasteStockAdjustment.approvedById` | `User.id` | 0..1 | 0..N |
| `WasteStockAdjustment.wasteMovementId` | `WasteMovement.id` | 0..1 | 0..1 |
| `WasteStockAdjustmentDetail.wasteStockAdjustmentId` | `WasteStockAdjustment.id` | 1 | 0..N |
| `WasteStockAdjustmentDetail.wasteId` | `Waste.id` | 1 | 0..N |
| `WasteMovement.wasteIssueId` | `WasteIssue.id` | 0..1 | 0..N |
| `WasteStockEntry.wasteId` | `Waste.id` | 1 | 0..N |
| `WasteStockEntry.createdById` | `User.id` | 1 | 0..N |
| `WasteStockEntry.wasteMovementId` | `WasteMovement.id` | 1 | 0..1 |
| `WasteMovementDetail.wasteId` | `Waste.id` | 1 | 0..N |
| `WasteMovementDetail.wasteStockAdjustmentDetailId` | `WasteStockAdjustmentDetail.id` | 0..1 | 0..N |
| `WasteMovementDetail.movementId` | `WasteMovement.id` | 1 | 0..N |
| `WasteMovementDetail.wasteIssueDetailId` | `WasteIssueDetail.id` | 0..1 | 0..N |
| `WasteIssue.createdById` | `User.id` | 1 | 0..N |
| `WasteIssue.departmentId` | `Department.id` | 1 | 0..N |
| `WasteIssue.requesterId` | `Person.id` | 1 | 0..N |
| `WasteIssue.clientId` | `Client.id` | 1 | 0..N |
| `WasteIssue.advisorId` | `Person.id` | 1 | 0..N |
| `WasteIssue.fulfillmentStatusId` | `FulfillmentStatus.id` | 1 | 0..N |
| `WasteIssue.statusId` | `Status.id` | 1 | 0..N |
| `WasteIssueDetail.wasteIssueId` | `WasteIssue.id` | 1 | 0..N |
| `WasteIssueDetail.wasteId` | `Waste.id` | 1 | 0..N |
| `WasteIssueDetail.fulfillmentStatusId` | `FulfillmentStatus.id` | 1 | 0..N |
| `WasteIssueReturn.wasteIssueId` | `WasteIssue.id` | 1 | 0..N |
| `WasteIssueReturn.wasteIssueDetailId` | `WasteIssueDetail.id` | 1 | 0..N |
| `WasteIssueReturn.movementDetailId` | `WasteMovementDetail.id` | 0..1 | 0..1 |
| `WasteIssueReturn.returnedById` | `User.id` | 0..1 | 0..N |
| `WasteIssueReturn.wasteId` | `Waste.id` | 1 | 0..N |
| `Client.advisorId` | `Person.id` | 0..1 | 0..N |
| `GoodsReceipt.receivedById` | `Person.id` | 1 | 0..N |
| `GoodsReceipt.supplierId` | `Supplier.id` | 1 | 0..N |
| `GoodsReceipt.statusId` | `Status.id` | 1 | 0..N |
| `GoodsReceiptDetail.goodsReceiptId` | `GoodsReceipt.id` | 1 | 0..N |
| `GoodsReceiptDetail.materialId` | `Material.id` | 1 | 0..N |
| `GoodsIssue.departmentId` | `Department.id` | 1 | 0..N |
| `GoodsIssue.approverId` | `Person.id` | 0..1 | 0..N |
| `GoodsIssue.requesterId` | `Person.id` | 1 | 0..N |
| `GoodsIssue.warehouseStaffId` | `Person.id` | 0..1 | 0..N |
| `GoodsIssue.statusId` | `Status.id` | 1 | 0..N |
| `GoodsIssue.projectId` | `Project.id` | 0..1 | 0..N |
| `GoodsIssue.clientId` | `Client.id` | 1 | 0..N |
| `GoodsIssue.advisorId` | `Person.id` | 1 | 0..N |
| `GoodsIssue.fulfillmentStatusId` | `FulfillmentStatus.id` | 0..1 | 0..N |
| `GoodsIssueDetail.materialId` | `Material.id` | 1 | 0..N |
| `GoodsIssueDetail.supplierId` | `Supplier.id` | 1 | 0..N |
| `GoodsIssueDetail.goodsIssueId` | `GoodsIssue.id` | 1 | 0..N |
| `GoodsIssueDetail.fulfillmentStatusId` | `FulfillmentStatus.id` | 1 | 0..N |
| `GoodsIssueReturn.goodsIssueId` | `GoodsIssue.id` | 1 | 0..N |
| `GoodsIssueReturn.goodsIssueDetailId` | `GoodsIssueDetail.id` | 1 | 0..N |
| `GoodsIssueReturn.movementDetailId` | `MovementDetail.id` | 0..1 | 0..1 |
| `GoodsIssueReturn.returnedById` | `User.id` | 0..1 | 0..N |
| `InventoryMovement.goodsReceiptId` | `GoodsReceipt.id` | 0..1 | 0..N |
| `InventoryMovement.goodsIssueId` | `GoodsIssue.id` | 0..1 | 0..N |
| `InventoryMovement.stockAdjustmentId` | `StockAdjustment.id` | 0..1 | 0..1 |
| `MovementDetail.materialId` | `Material.id` | 1 | 0..N |
| `MovementDetail.supplierId` | `Supplier.id` | 1 | 0..N |
| `MovementDetail.goodsReceiptDetailId` | `GoodsReceiptDetail.id` | 0..1 | 0..N |
| `MovementDetail.goodsIssueDetailId` | `GoodsIssueDetail.id` | 0..1 | 0..N |
| `MovementDetail.stockAdjustmentDetailId` | `StockAdjustmentDetail.id` | 0..1 | 0..N |
| `MovementDetail.movementId` | `InventoryMovement.id` | 1 | 0..N |
| `StockAdjustment.reasonId` | `StockAdjustmentReason.id` | 1 | 0..N |
| `StockAdjustment.createdById` | `User.id` | 1 | 0..N |
| `StockAdjustment.approvedById` | `User.id` | 0..1 | 0..N |
| `StockAdjustmentDetail.stockAdjustmentId` | `StockAdjustment.id` | 1 | 0..N |
| `StockAdjustmentDetail.materialId` | `Material.id` | 1 | 0..N |
| `StockAdjustmentDetail.supplierId` | `Supplier.id` | 1 | 0..N |
| `GoodsReceiptDetailChange.goodsReceiptId` | `GoodsReceipt.id` | 1 | 0..N |
| `GoodsReceiptDetailChange.goodsReceiptDetailId` | `GoodsReceiptDetail.id` | 1 | 0..N |
| `GoodsReceiptDetailChange.reasonId` | `StockAdjustmentReason.id` | 1 | 0..N |
| `GoodsReceiptDetailChange.changedById` | `User.id` | 1 | 0..N |
| `GoodsReceiptDetailChange.previousMaterialId` | `Material.id` | 1 | 0..N |
| `GoodsReceiptDetailChange.correctedMaterialId` | `Material.id` | 1 | 0..N |
| `GoodsReceiptDetailChange.inventoryMovementId` | `InventoryMovement.id` | 0..1 | 0..1 |

Consulta el esquema Prisma para las reglas `onDelete`/`onUpdate`. Cada asociación
usa el nombre del campo que declara la FK en Prisma; las colecciones inversas no
generan una segunda asociación. La dirección de lectura no implica propiedad del
proceso de negocio.
