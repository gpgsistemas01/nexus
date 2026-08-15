<!-- Archivo generado por scripts/generateArchitectureDocs.js. No editar manualmente. -->
# Diccionario técnico de datos

Este inventario se genera desde `prisma/schema.prisma` y enumera campos escalares,
obligatoriedad, claves, valores predeterminados, tipos de base de datos y relaciones
propietarias. Se aplican las [convenciones de diagramas](../diagram-conventions.md).

El tipo Prisma y el atributo `@db` describen la representación técnica. Prisma y las
migraciones son la fuente de verdad para restricciones completas, índices, acciones
referenciales y SQL. El propósito de negocio de los agregados se explica en el
[modelo de dominio y casos de uso](../domain-and-use-cases.md); este generador no inventa
definiciones de negocio a partir de nombres de tablas. La terminología compartida con
usuarios y responsables se mantiene en el
[glosario del negocio](../business-glossary.md).

## Cómo leerlo

- **Obligatorio** indica que el campo escalar no lleva `?` en Prisma; no sustituye las
  validaciones del caso de uso.
- **PK**, **FK** y **UK** significan clave primaria, foránea y única.
- Una relación listada es el lado que declara `fields: [...]`; las colecciones inversas
  se consultan en el esquema y en los diagramas ER.
- Los valores y tipos se presentan literalmente para que cualquier cambio produzca una
  diferencia revisable y verificable con `npm run docs:check`.

## Identidad, acceso y auditoría

### `Department`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `name` | `String` | Sí | UK | — | `@db.VarChar(50)` |

### `Role`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `name` | `String` | Sí | UK | — | `@db.VarChar(50)` |

### `User`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `personId` | `String?` | No | FK | — | `@db.Uuid` |
| `name` | `String` | Sí | UK | — | `@db.VarChar(50)` |
| `password` | `String` | Sí | — | — | `@db.VarChar(100)` |
| `isActive` | `Boolean` | Sí | — | `true` | — |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `person` | `Person` | `personId` | Cero o uno |

### `Person`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `fullName` | `String` | Sí | — | — | `@db.VarChar(255)` |
| `isActive` | `Boolean` | Sí | — | `true` | — |

### `UserRoleDepartment`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `userId` | `String` | Sí | PK,FK | — | `@db.Uuid` |
| `roleId` | `String` | Sí | PK,FK | — | `@db.Uuid` |
| `departmentId` | `String` | Sí | PK,FK | — | `@db.Uuid` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `user` | `User` | `userId` | Exactamente uno |
| `role` | `Role` | `roleId` | Exactamente uno |
| `department` | `Department` | `departmentId` | Exactamente uno |

### `PersonRoleDepartment`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `departmentId` | `String` | Sí | PK,FK | — | `@db.Uuid` |
| `personId` | `String` | Sí | PK,FK | — | `@db.Uuid` |
| `roleId` | `String` | Sí | PK,FK | — | `@db.Uuid` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `department` | `Department` | `departmentId` | Exactamente uno |
| `person` | `Person` | `personId` | Exactamente uno |
| `role` | `Role` | `roleId` | Exactamente uno |

### `CriticalWriteAudit`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `actorId` | `String?` | No | FK | — | `@db.Uuid` |
| `action` | `CriticalWriteAuditAction` | Sí | — | — | — |
| `resource` | `String` | Sí | — | — | `@db.VarChar(100)` |
| `entityId` | `String?` | No | — | — | `@db.VarChar(100)` |
| `method` | `String` | Sí | — | — | `@db.VarChar(10)` |
| `path` | `String` | Sí | — | — | `@db.VarChar(500)` |
| `statusCode` | `Int` | Sí | — | — | — |
| `changes` | `Json?` | No | — | — | — |
| `requestId` | `String?` | No | — | — | `@db.VarChar(100)` |
| `ipAddress` | `String?` | No | — | — | `@db.VarChar(45)` |
| `userAgent` | `String?` | No | — | — | `@db.VarChar(500)` |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `actor` | `User` | `actorId` | Cero o uno |

## Catálogos y relaciones comerciales

### `Status`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `name` | `String` | Sí | UK | — | — |

### `FulfillmentStatus`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `name` | `String` | Sí | UK | — | `@db.VarChar(50)` |

### `Project`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `referenceNumber` | `String` | Sí | UK | — | `@db.VarChar(50)` |
| `client` | `String` | Sí | — | — | `@db.VarChar(50)` |
| `name` | `String` | Sí | — | — | `@db.VarChar(50)` |
| `date` | `DateTime` | Sí | — | — | — |

### `Client`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `name` | `String` | Sí | — | — | `@db.VarChar(255)` |
| `advisorId` | `String?` | No | FK | — | `@db.Uuid` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `advisor` | `Person` | `advisorId` | Cero o uno |

### `Supplier`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `codeNumber` | `Int` | Sí | — | — | — |
| `code` | `String` | Sí | UK | — | `@db.VarChar(10)` |
| `legalName` | `String` | Sí | — | — | `@db.VarChar(200)` |
| `tradeName` | `String` | Sí | — | — | `@db.VarChar(100)` |
| `isActive` | `Boolean` | Sí | — | `true` | — |

### `Material`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `name` | `String` | Sí | — | — | `@db.VarChar(200)` |
| `sku` | `String?` | No | UK | — | `@db.VarChar(200)` |
| `presentationId` | `String` | Sí | FK | — | `@db.Uuid` |
| `unitMeasureId` | `String` | Sí | FK | — | `@db.Uuid` |
| `isActive` | `Boolean` | Sí | — | `true` | — |
| `minStock` | `Decimal` | Sí | — | `0` | `@db.Decimal(10, 2)` |
| `base` | `Decimal?` | No | — | — | `@db.Decimal(10, 2)` |
| `height` | `Decimal?` | No | — | — | `@db.Decimal(10, 2)` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `presentation` | `Presentation` | `presentationId` | Exactamente uno |
| `unitMeasure` | `UnitMeasure` | `unitMeasureId` | Exactamente uno |

### `UnitMeasure`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `name` | `String` | Sí | — | — | `@db.VarChar(20)` |
| `symbol` | `String` | Sí | — | — | `@db.VarChar(10)` |

### `Presentation`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `name` | `String` | Sí | UK | — | `@db.VarChar(50)` |

### `SupplierMaterial`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `maxUnitCost` | `Decimal?` | No | — | — | `@db.Decimal(10, 2)` |
| `sku` | `String?` | No | — | — | `@db.VarChar(50)` |
| `currentStock` | `Decimal` | Sí | — | `0` | `@db.Decimal(10, 2)` |
| `convertedQuantity` | `Decimal` | Sí | — | `0` | `@db.Decimal(10, 2)` |
| `supplierId` | `String` | Sí | FK | — | `@db.Uuid` |
| `materialId` | `String` | Sí | FK | — | `@db.Uuid` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `supplier` | `Supplier` | `supplierId` | Exactamente uno |
| `material` | `Material` | `materialId` | Exactamente uno |

### `ReferenceNumberCounter`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `prefix` | `String` | Sí | — | — | `@db.VarChar(10)` |
| `counter` | `Int` | Sí | — | `0` | — |
| `year` | `Int` | Sí | — | `0` | — |

## Compras, requisiciones e inventario de materiales

### `PurchaseRequisition`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `referenceNumber` | `String` | Sí | UK | — | `@db.VarChar(50)` |
| `approveDate` | `DateTime?` | No | — | — | — |
| `requestDate` | `DateTime` | Sí | — | — | — |
| `deliveryDate` | `DateTime?` | No | — | — | — |
| `observations` | `String?` | No | — | — | `@db.VarChar(500)` |
| `statusId` | `String` | Sí | FK | — | `@db.Uuid` |
| `departmentId` | `String` | Sí | FK | — | `@db.Uuid` |
| `approverId` | `String?` | No | FK | — | `@db.Uuid` |
| `deliveredById` | `String?` | No | FK | — | `@db.Uuid` |
| `requesterId` | `String` | Sí | FK | — | `@db.Uuid` |
| `projectId` | `String` | Sí | FK | — | `@db.Uuid` |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `department` | `Department` | `departmentId` | Exactamente uno |
| `approver` | `Person` | `approverId` | Cero o uno |
| `deliveredBy` | `Person` | `deliveredById` | Cero o uno |
| `requester` | `Person` | `requesterId` | Exactamente uno |
| `status` | `Status` | `statusId` | Exactamente uno |
| `project` | `Project` | `projectId` | Exactamente uno |

### `PurchaseRequisitionDetail`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `materialId` | `String` | Sí | FK | — | `@db.Uuid` |
| `purchaseRequisitionId` | `String` | Sí | FK | — | `@db.Uuid` |
| `quantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `purchaseRequisition` | `PurchaseRequisition` | `purchaseRequisitionId` | Exactamente uno |
| `material` | `Material` | `materialId` | Exactamente uno |

### `GoodsReceipt`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `invoice` | `String?` | No | — | — | `@db.VarChar(50)` |
| `isInvoiced` | `Boolean` | Sí | — | `false` | — |
| `supplierId` | `String` | Sí | FK | — | `@db.Uuid` |
| `supplierName` | `String` | Sí | — | — | `@db.VarChar(200)` |
| `statusId` | `String` | Sí | FK | — | `@db.Uuid` |
| `receivedById` | `String` | Sí | FK | — | `@db.Uuid` |
| `receivedByName` | `String` | Sí | — | — | `@db.VarChar(255)` |
| `referenceNumber` | `String` | Sí | UK | — | `@db.VarChar(50)` |
| `receptionDate` | `DateTime` | Sí | — | — | — |
| `observations` | `String?` | No | — | — | `@db.VarChar(500)` |
| `totalQuantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `totalNetPurchaseAmount` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `totalGrossPurchaseAmount` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `receivedBy` | `Person` | `receivedById` | Exactamente uno |
| `supplier` | `Supplier` | `supplierId` | Exactamente uno |
| `status` | `Status` | `statusId` | Exactamente uno |

### `GoodsReceiptDetail`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `materialId` | `String` | Sí | FK | — | `@db.Uuid` |
| `goodsReceiptId` | `String` | Sí | FK | — | `@db.Uuid` |
| `quantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `conversionUnitCost` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `costPerUnitType` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `convertedQuantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `netPurchaseAmount` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `grossPurchaseAmount` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `materialName` | `String` | Sí | — | — | `@db.VarChar(200)` |
| `status` | `GoodsReceiptDetailStatus` | Sí | — | `ACTIVE` | — |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `goodsReceipt` | `GoodsReceipt` | `goodsReceiptId` | Exactamente uno |
| `material` | `Material` | `materialId` | Exactamente uno |

### `GoodsReceiptDetailChange`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `goodsReceiptId` | `String` | Sí | FK | — | `@db.Uuid` |
| `goodsReceiptDetailId` | `String` | Sí | FK | — | `@db.Uuid` |
| `reasonId` | `String` | Sí | FK | — | `@db.Uuid` |
| `changedById` | `String` | Sí | FK | — | `@db.Uuid` |
| `inventoryMovementId` | `String?` | No | UK,FK | — | `@db.Uuid` |
| `previousMaterialId` | `String` | Sí | FK | — | `@db.Uuid` |
| `previousMaterialName` | `String` | Sí | — | — | `@db.VarChar(200)` |
| `previousQuantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `previousCostPerUnitType` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `previousNetPurchaseAmount` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `previousGrossPurchaseAmount` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `correctedMaterialId` | `String` | Sí | FK | — | `@db.Uuid` |
| `correctedMaterialName` | `String` | Sí | — | — | `@db.VarChar(200)` |
| `correctedQuantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `correctedCostPerUnitType` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `correctedNetPurchaseAmount` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `correctedGrossPurchaseAmount` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `changeType` | `GoodsReceiptDetailChangeType` | Sí | — | — | — |
| `materialChanged` | `Boolean` | Sí | — | `false` | — |
| `quantityDifference` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `costDifference` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `goodsReceipt` | `GoodsReceipt` | `goodsReceiptId` | Exactamente uno |
| `goodsReceiptDetail` | `GoodsReceiptDetail` | `goodsReceiptDetailId` | Exactamente uno |
| `reason` | `StockAdjustmentReason` | `reasonId` | Exactamente uno |
| `changedBy` | `User` | `changedById` | Exactamente uno |
| `previousMaterial` | `Material` | `previousMaterialId` | Exactamente uno |
| `correctedMaterial` | `Material` | `correctedMaterialId` | Exactamente uno |
| `inventoryMovement` | `InventoryMovement` | `inventoryMovementId` | Cero o uno |

### `GoodsIssue`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `referenceNumber` | `String` | Sí | UK | — | `@db.VarChar(50)` |
| `approvedDate` | `DateTime?` | No | — | — | — |
| `requestDate` | `DateTime` | Sí | — | — | — |
| `deliveryDate` | `DateTime?` | No | — | — | — |
| `observations` | `String?` | No | — | — | `@db.VarChar(500)` |
| `projectNumber` | `String` | Sí | — | — | `@db.VarChar(10)` |
| `departmentName` | `String` | Sí | — | — | `@db.VarChar(50)` |
| `requesterName` | `String` | Sí | — | — | `@db.VarChar(255)` |
| `clientName` | `String` | Sí | — | — | `@db.VarChar(255)` |
| `advisorName` | `String` | Sí | — | — | `@db.VarChar(255)` |
| `statusId` | `String` | Sí | FK | — | `@db.Uuid` |
| `departmentId` | `String` | Sí | FK | — | `@db.Uuid` |
| `approverId` | `String?` | No | FK | — | `@db.Uuid` |
| `requesterId` | `String` | Sí | FK | — | `@db.Uuid` |
| `warehouseStaffId` | `String?` | No | FK | — | `@db.Uuid` |
| `projectId` | `String?` | No | FK | — | `@db.Uuid` |
| `clientId` | `String` | Sí | FK | — | `@db.Uuid` |
| `advisorId` | `String` | Sí | FK | — | `@db.Uuid` |
| `fulfillmentStatusId` | `String?` | No | FK | — | `@db.Uuid` |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `department` | `Department` | `departmentId` | Exactamente uno |
| `approver` | `Person` | `approverId` | Cero o uno |
| `requester` | `Person` | `requesterId` | Exactamente uno |
| `warehouseStaff` | `Person` | `warehouseStaffId` | Cero o uno |
| `status` | `Status` | `statusId` | Exactamente uno |
| `project` | `Project` | `projectId` | Cero o uno |
| `client` | `Client` | `clientId` | Exactamente uno |
| `advisor` | `Person` | `advisorId` | Exactamente uno |
| `fulfillmentStatus` | `FulfillmentStatus` | `fulfillmentStatusId` | Cero o uno |

### `GoodsIssueDetail`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `materialId` | `String` | Sí | FK | — | `@db.Uuid` |
| `goodsIssueId` | `String` | Sí | FK | — | `@db.Uuid` |
| `supplierId` | `String` | Sí | FK | — | `@db.Uuid` |
| `materialName` | `String` | Sí | — | — | `@db.VarChar(200)` |
| `quantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `applyWaste` | `Boolean` | Sí | — | `false` | — |
| `convertedQuantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `maxUnitCost` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `projectConvertedQuantity` | `Decimal?` | No | — | — | `@db.Decimal(10, 2)` |
| `convertedQuantityDifference` | `Decimal?` | No | — | — | `@db.Decimal(10, 2)` |
| `suppliedQuantity` | `Decimal?` | No | — | — | `@db.Decimal(10, 2)` |
| `returnedQuantity` | `Decimal` | Sí | — | `0` | `@db.Decimal(10, 2)` |
| `isSupplied` | `Boolean` | Sí | — | `false` | — |
| `fulfillmentStatusId` | `String` | Sí | FK | — | `@db.Uuid` |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `material` | `Material` | `materialId` | Exactamente uno |
| `supplier` | `Supplier` | `supplierId` | Exactamente uno |
| `goodsIssue` | `GoodsIssue` | `goodsIssueId` | Exactamente uno |
| `fulfillmentStatus` | `FulfillmentStatus` | `fulfillmentStatusId` | Exactamente uno |

### `GoodsIssueReturn`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `goodsIssueId` | `String` | Sí | FK | — | `@db.Uuid` |
| `goodsIssueDetailId` | `String` | Sí | FK | — | `@db.Uuid` |
| `movementDetailId` | `String?` | No | UK,FK | — | `@db.Uuid` |
| `returnedById` | `String?` | No | FK | — | `@db.Uuid` |
| `materialId` | `String` | Sí | — | — | `@db.Uuid` |
| `materialName` | `String` | Sí | — | — | `@db.VarChar(200)` |
| `supplierId` | `String` | Sí | — | — | `@db.Uuid` |
| `currentTotalReturnedQuantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `newTotalReturnedQuantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `observations` | `String?` | No | — | — | `@db.VarChar(500)` |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `goodsIssue` | `GoodsIssue` | `goodsIssueId` | Exactamente uno |
| `goodsIssueDetail` | `GoodsIssueDetail` | `goodsIssueDetailId` | Exactamente uno |
| `movementDetail` | `MovementDetail` | `movementDetailId` | Cero o uno |
| `returnedBy` | `User` | `returnedById` | Cero o uno |

### `InventoryMovement`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `referenceNumber` | `String?` | No | UK | — | `@db.VarChar(50)` |
| `type` | `InventoryMovementType` | Sí | — | — | — |
| `goodsReceiptId` | `String?` | No | FK | — | `@db.Uuid` |
| `goodsIssueId` | `String?` | No | FK | — | `@db.Uuid` |
| `stockAdjustmentId` | `String?` | No | UK,FK | — | `@db.Uuid` |
| `date` | `DateTime` | Sí | — | `now()` | — |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `goodsReceipt` | `GoodsReceipt` | `goodsReceiptId` | Cero o uno |
| `goodsIssue` | `GoodsIssue` | `goodsIssueId` | Cero o uno |
| `stockAdjustment` | `StockAdjustment` | `stockAdjustmentId` | Cero o uno |

### `MovementDetail`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `quantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `newStock` | `Decimal?` | No | — | — | `@db.Decimal(10, 2)` |
| `previousStock` | `Decimal?` | No | — | — | `@db.Decimal(10, 2)` |
| `materialId` | `String` | Sí | FK | — | `@db.Uuid` |
| `supplierId` | `String` | Sí | FK | — | `@db.Uuid` |
| `goodsReceiptDetailId` | `String?` | No | FK | — | `@db.Uuid` |
| `goodsIssueDetailId` | `String?` | No | FK | — | `@db.Uuid` |
| `stockAdjustmentDetailId` | `String?` | No | FK | — | `@db.Uuid` |
| `movementId` | `String` | Sí | FK | — | `@db.Uuid` |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `material` | `Material` | `materialId` | Exactamente uno |
| `supplier` | `Supplier` | `supplierId` | Exactamente uno |
| `goodsReceiptDetail` | `GoodsReceiptDetail` | `goodsReceiptDetailId` | Cero o uno |
| `goodsIssueDetail` | `GoodsIssueDetail` | `goodsIssueDetailId` | Cero o uno |
| `stockAdjustmentDetail` | `StockAdjustmentDetail` | `stockAdjustmentDetailId` | Cero o uno |
| `movement` | `InventoryMovement` | `movementId` | Exactamente uno |

### `StockAdjustment`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `referenceNumber` | `String` | Sí | UK | — | `@db.VarChar(50)` |
| `type` | `StockAdjustmentType` | Sí | — | — | — |
| `reasonId` | `String` | Sí | FK | — | `@db.Uuid` |
| `observations` | `String?` | No | — | — | `@db.VarChar(500)` |
| `status` | `AdjustmentStatus` | Sí | — | `PENDING` | — |
| `createdById` | `String` | Sí | FK | — | `@db.Uuid` |
| `approvedById` | `String?` | No | FK | — | `@db.Uuid` |
| `appliedAt` | `DateTime?` | No | — | — | — |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `reason` | `StockAdjustmentReason` | `reasonId` | Exactamente uno |
| `createdBy` | `User` | `createdById` | Exactamente uno |
| `approvedBy` | `User` | `approvedById` | Cero o uno |

### `StockAdjustmentDetail`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `stockAdjustmentId` | `String` | Sí | FK | — | `@db.Uuid` |
| `materialId` | `String` | Sí | FK | — | `@db.Uuid` |
| `supplierId` | `String` | Sí | FK | — | `@db.Uuid` |
| `materialName` | `String` | Sí | — | — | `@db.VarChar(200)` |
| `previousStock` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `newStock` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `difference` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `previousConvertedQuantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `newConvertedQuantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `convertedDifference` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `stockAdjustment` | `StockAdjustment` | `stockAdjustmentId` | Exactamente uno |
| `material` | `Material` | `materialId` | Exactamente uno |
| `supplier` | `Supplier` | `supplierId` | Exactamente uno |

### `StockAdjustmentReason`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `name` | `String` | Sí | UK | — | `@db.VarChar(100)` |
| `isActive` | `Boolean` | Sí | — | `true` | — |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

## Mermas e inventario de merma

### `Waste`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `supplierMaterialId` | `String` | Sí | FK | — | `@db.Uuid` |
| `isActive` | `Boolean` | Sí | — | `true` | — |
| `minStock` | `Decimal` | Sí | — | `0` | `@db.Decimal(10, 2)` |
| `base` | `Decimal?` | No | — | — | `@db.Decimal(10, 2)` |
| `height` | `Decimal?` | No | — | — | `@db.Decimal(10, 2)` |
| `currentStock` | `Decimal` | Sí | — | `0` | `@db.Decimal(10, 2)` |
| `convertedQuantity` | `Decimal` | Sí | — | `0` | `@db.Decimal(10, 2)` |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `supplierMaterial` | `SupplierMaterial` | `supplierMaterialId` | Exactamente uno |

### `WasteIssue`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `referenceNumber` | `String` | Sí | UK | — | `@db.VarChar(50)` |
| `requestDate` | `DateTime` | Sí | — | — | — |
| `observations` | `String?` | No | — | — | `@db.VarChar(500)` |
| `projectNumber` | `String` | Sí | — | — | `@db.VarChar(10)` |
| `departmentName` | `String` | Sí | — | — | `@db.VarChar(50)` |
| `requesterName` | `String` | Sí | — | — | `@db.VarChar(255)` |
| `clientName` | `String` | Sí | — | — | `@db.VarChar(255)` |
| `advisorName` | `String` | Sí | — | — | `@db.VarChar(255)` |
| `createdById` | `String` | Sí | FK | — | `@db.Uuid` |
| `departmentId` | `String` | Sí | FK | — | `@db.Uuid` |
| `requesterId` | `String` | Sí | FK | — | `@db.Uuid` |
| `clientId` | `String` | Sí | FK | — | `@db.Uuid` |
| `advisorId` | `String` | Sí | FK | — | `@db.Uuid` |
| `fulfillmentStatusId` | `String` | Sí | FK | — | `@db.Uuid` |
| `statusId` | `String` | Sí | FK | — | `@db.Uuid` |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `createdBy` | `User` | `createdById` | Exactamente uno |
| `department` | `Department` | `departmentId` | Exactamente uno |
| `requester` | `Person` | `requesterId` | Exactamente uno |
| `client` | `Client` | `clientId` | Exactamente uno |
| `advisor` | `Person` | `advisorId` | Exactamente uno |
| `fulfillmentStatus` | `FulfillmentStatus` | `fulfillmentStatusId` | Exactamente uno |
| `status` | `Status` | `statusId` | Exactamente uno |

### `WasteIssueDetail`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `wasteIssueId` | `String` | Sí | FK | — | `@db.Uuid` |
| `wasteId` | `String` | Sí | FK | — | `@db.Uuid` |
| `materialName` | `String` | Sí | — | — | `@db.VarChar(200)` |
| `quantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `convertedQuantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `projectConvertedQuantity` | `Decimal?` | No | — | — | `@db.Decimal(10, 2)` |
| `convertedQuantityDifference` | `Decimal?` | No | — | — | `@db.Decimal(10, 2)` |
| `suppliedQuantity` | `Decimal` | Sí | — | `0` | `@db.Decimal(10, 2)` |
| `returnedQuantity` | `Decimal` | Sí | — | `0` | `@db.Decimal(10, 2)` |
| `isSupplied` | `Boolean` | Sí | — | `false` | — |
| `fulfillmentStatusId` | `String` | Sí | FK | — | `@db.Uuid` |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `wasteIssue` | `WasteIssue` | `wasteIssueId` | Exactamente uno |
| `waste` | `Waste` | `wasteId` | Exactamente uno |
| `fulfillmentStatus` | `FulfillmentStatus` | `fulfillmentStatusId` | Exactamente uno |

### `WasteIssueReturn`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `wasteIssueId` | `String` | Sí | FK | — | `@db.Uuid` |
| `wasteIssueDetailId` | `String` | Sí | FK | — | `@db.Uuid` |
| `movementDetailId` | `String?` | No | UK,FK | — | `@db.Uuid` |
| `returnedById` | `String?` | No | FK | — | `@db.Uuid` |
| `wasteId` | `String` | Sí | FK | — | `@db.Uuid` |
| `materialName` | `String` | Sí | — | — | `@db.VarChar(200)` |
| `currentTotalReturnedQuantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `newTotalReturnedQuantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `observations` | `String?` | No | — | — | `@db.VarChar(500)` |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `wasteIssue` | `WasteIssue` | `wasteIssueId` | Exactamente uno |
| `wasteIssueDetail` | `WasteIssueDetail` | `wasteIssueDetailId` | Exactamente uno |
| `movementDetail` | `WasteMovementDetail` | `movementDetailId` | Cero o uno |
| `returnedBy` | `User` | `returnedById` | Cero o uno |
| `waste` | `Waste` | `wasteId` | Exactamente uno |

### `WasteMovement`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `referenceNumber` | `String?` | No | UK | — | `@db.VarChar(50)` |
| `type` | `InventoryMovementType` | Sí | — | — | — |
| `date` | `DateTime` | Sí | — | `now()` | — |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |
| `wasteIssueId` | `String?` | No | FK | — | `@db.Uuid` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `wasteIssue` | `WasteIssue` | `wasteIssueId` | Cero o uno |

### `WasteMovementDetail`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `quantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `newStock` | `Decimal?` | No | — | — | `@db.Decimal(10, 2)` |
| `previousStock` | `Decimal?` | No | — | — | `@db.Decimal(10, 2)` |
| `wasteId` | `String` | Sí | FK | — | `@db.Uuid` |
| `wasteStockAdjustmentDetailId` | `String?` | No | FK | — | `@db.Uuid` |
| `movementId` | `String` | Sí | FK | — | `@db.Uuid` |
| `wasteIssueDetailId` | `String?` | No | FK | — | `@db.Uuid` |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `waste` | `Waste` | `wasteId` | Exactamente uno |
| `wasteStockAdjustmentDetail` | `WasteStockAdjustmentDetail` | `wasteStockAdjustmentDetailId` | Cero o uno |
| `movement` | `WasteMovement` | `movementId` | Exactamente uno |
| `wasteIssueDetail` | `WasteIssueDetail` | `wasteIssueDetailId` | Cero o uno |

### `WasteStockAdjustment`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `referenceNumber` | `String` | Sí | UK | — | `@db.VarChar(50)` |
| `type` | `StockAdjustmentType` | Sí | — | — | — |
| `reasonId` | `String` | Sí | FK | — | `@db.Uuid` |
| `observations` | `String?` | No | — | — | `@db.VarChar(500)` |
| `status` | `AdjustmentStatus` | Sí | — | `PENDING` | — |
| `createdById` | `String` | Sí | FK | — | `@db.Uuid` |
| `approvedById` | `String?` | No | FK | — | `@db.Uuid` |
| `wasteMovementId` | `String?` | No | UK,FK | — | `@db.Uuid` |
| `appliedAt` | `DateTime?` | No | — | — | — |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `reason` | `StockAdjustmentReason` | `reasonId` | Exactamente uno |
| `createdBy` | `User` | `createdById` | Exactamente uno |
| `approvedBy` | `User` | `approvedById` | Cero o uno |
| `movement` | `WasteMovement` | `wasteMovementId` | Cero o uno |

### `WasteStockAdjustmentDetail`

| Campo | Tipo Prisma | Obligatorio | Claves | Predeterminado | Reglas Prisma/BD |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | Sí | PK | `dbgenerated("gen_random_uuid()")` | `@db.Uuid` |
| `wasteStockAdjustmentId` | `String` | Sí | FK | — | `@db.Uuid` |
| `wasteId` | `String` | Sí | FK | — | `@db.Uuid` |
| `materialName` | `String` | Sí | — | — | `@db.VarChar(200)` |
| `previousStock` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `newStock` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `difference` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `previousConvertedQuantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `newConvertedQuantity` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `convertedDifference` | `Decimal` | Sí | — | — | `@db.Decimal(10, 2)` |
| `createdAt` | `DateTime` | Sí | — | `now()` | — |
| `updatedAt` | `DateTime` | Sí | — | — | `@updatedAt` |

| Relación Prisma | Destino | Campos FK | Cardinalidad desde este modelo |
| --- | --- | --- | --- |
| `wasteStockAdjustment` | `WasteStockAdjustment` | `wasteStockAdjustmentId` | Exactamente uno |
| `waste` | `Waste` | `wasteId` | Exactamente uno |

## Enumeraciones

| Tipo | Valores permitidos por Prisma |
| --- | --- |
| `CriticalWriteAuditAction` | `CREATE`, `UPDATE`, `DELETE` |
| `GoodsReceiptDetailStatus` | `ACTIVE`, `CANCELED` |
| `AdjustmentStatus` | `PENDING`, `APPLIED`, `CANCELLED` |
| `StockAdjustmentType` | `INCREASE`, `DECREASE` |
| `InventoryMovementType` | `ENTRY`, `ISSUE`, `ADJUSTMENT` |
| `GoodsReceiptDetailChangeType` | `QUANTITY`, `COST`, `QUANTITY_AND_COST`, `CANCELLATION` |
