-- CreateTable
CREATE TABLE "Department" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profileId" UUID,
    "name" VARCHAR(50) NOT NULL,
    "password" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoleDepartment" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,

    CONSTRAINT "UserRoleDepartment_pkey" PRIMARY KEY ("userId","roleId","departmentId")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fullName" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentProfile" (
    "departmentId" UUID NOT NULL,
    "profileId" UUID NOT NULL,

    CONSTRAINT "DepartmentProfile_pkey" PRIMARY KEY ("departmentId","profileId")
);

-- CreateTable
CREATE TABLE "Status" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "sku" VARCHAR(200),
    "currentStock" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "presentationId" UUID NOT NULL,
    "unitMeasureId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "minStock" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "base" DECIMAL(10,3),
    "height" DECIMAL(10,3),
    "maxUnitCost" DECIMAL(10,3),
    "convertedQuantity" DECIMAL(10,3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitMeasure" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(20) NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,

    CONSTRAINT "UnitMeasure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presentation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "Presentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "codeNumber" INTEGER NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "legalName" VARCHAR(200) NOT NULL,
    "tradeName" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierProduct" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "price" DECIMAL(10,2),
    "sku" VARCHAR(50),
    "supplierId" UUID NOT NULL,
    "productId" UUID NOT NULL,

    CONSTRAINT "SupplierProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(100) NOT NULL,
    "message" VARCHAR(255) NOT NULL,
    "type" VARCHAR(20) NOT NULL DEFAULT 'info',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entityId" UUID NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "referenceNumber" VARCHAR(50),
    "userId" UUID,
    "departmentId" UUID,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referenceNumber" VARCHAR(50) NOT NULL,
    "client" VARCHAR(50) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "advisorId" UUID,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceNumberCounter" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "prefix" VARCHAR(10) NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReferenceNumberCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodsReceipt" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice" VARCHAR(50),
    "isInvoiced" BOOLEAN NOT NULL DEFAULT false,
    "supplierId" UUID NOT NULL,
    "supplierName" VARCHAR(200) NOT NULL,
    "statusId" UUID NOT NULL,
    "receivedById" UUID NOT NULL,
    "receivedByName" VARCHAR(255) NOT NULL,
    "referenceNumber" VARCHAR(50) NOT NULL,
    "receptionDate" TIMESTAMP(3) NOT NULL,
    "observations" VARCHAR(50),
    "totalQuantity" DECIMAL(10,3) NOT NULL,
    "totalNetPurchaseAmount" DECIMAL(10,3) NOT NULL,
    "totalGrossPurchaseAmount" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "GoodsReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodsReceiptDetail" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "goodsReceiptId" UUID NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "conversionUnitCost" DECIMAL(10,3) NOT NULL,
    "costPerUnitType" DECIMAL(10,3) NOT NULL,
    "convertedQuantity" DECIMAL(10,3) NOT NULL,
    "netPurchaseAmount" DECIMAL(10,3) NOT NULL,
    "grossPurchaseAmount" DECIMAL(10,3) NOT NULL,
    "presentationId" UUID NOT NULL,
    "presentationName" VARCHAR(50) NOT NULL,
    "unitMeasureId" UUID NOT NULL,
    "unitMeasureName" VARCHAR(20) NOT NULL,
    "unitMeasureSymbol" VARCHAR(10) NOT NULL,
    "productName" VARCHAR(200) NOT NULL,
    "productBase" DECIMAL(10,3),
    "productHeight" DECIMAL(10,3),

    CONSTRAINT "GoodsReceiptDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequisition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referenceNumber" VARCHAR(50) NOT NULL,
    "approveDate" TIMESTAMP(3),
    "requestDate" TIMESTAMP(3) NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "observations" VARCHAR(50),
    "statusId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "approverId" UUID,
    "deliveredById" UUID,
    "requesterId" UUID NOT NULL,
    "projectId" UUID NOT NULL,

    CONSTRAINT "PurchaseRequisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequisitionDetail" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "purchaseRequisitionId" UUID NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "PurchaseRequisitionDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodsIssue" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referenceNumber" VARCHAR(50) NOT NULL,
    "approvedDate" TIMESTAMP(3),
    "requestDate" TIMESTAMP(3) NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "observations" VARCHAR(50),
    "projectNumber" VARCHAR(10) NOT NULL,
    "departmentName" VARCHAR(50) NOT NULL,
    "requesterName" VARCHAR(255) NOT NULL,
    "clientName" VARCHAR(255) NOT NULL,
    "advisorName" VARCHAR(255) NOT NULL,
    "statusId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "approverId" UUID,
    "requesterId" UUID NOT NULL,
    "warehouseStaffId" UUID,
    "projectId" UUID,
    "clientId" UUID NOT NULL,
    "advisorId" UUID NOT NULL,
    "fulfillmentStatusId" UUID,

    CONSTRAINT "GoodsIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodsIssueDetail" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "goodsIssueId" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "presentationId" UUID NOT NULL,
    "unitMeasureId" UUID NOT NULL,
    "productName" VARCHAR(200) NOT NULL,
    "supplierName" VARCHAR(200) NOT NULL,
    "productBase" DECIMAL(10,3),
    "productHeight" DECIMAL(10,3),
    "quantity" DECIMAL(10,2) NOT NULL,
    "applyWaste" BOOLEAN NOT NULL DEFAULT false,
    "presentationName" VARCHAR(50) NOT NULL,
    "convertedQuantity" DECIMAL(10,3) NOT NULL,
    "unitMeasureName" VARCHAR(20) NOT NULL,
    "unitMeasureSymbol" VARCHAR(10) NOT NULL,
    "maxUnitCost" DECIMAL(10,3) NOT NULL,
    "projectConvertedQuantity" DECIMAL(10,3),
    "convertedQuantityDifference" DECIMAL(10,3),
    "suppliedQuantity" DECIMAL(10,2) NOT NULL,
    "isSupplied" BOOLEAN NOT NULL DEFAULT false,
    "fulfillmentStatusId" UUID,

    CONSTRAINT "GoodsIssueDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FulfillmentStatus" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "FulfillmentStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "goodsReceiptId" UUID,
    "goodsIssueId" UUID,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovementDetail" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quantity" DECIMAL(10,2) NOT NULL,
    "productId" UUID NOT NULL,
    "goodsReceiptDetailId" UUID,
    "goodsIssueDetailId" UUID,
    "movementId" UUID NOT NULL,

    CONSTRAINT "MovementDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Status_name_key" ON "Status"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "UnitMeasure_name_symbol_key" ON "UnitMeasure"("name", "symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Presentation_name_key" ON "Presentation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_code_key" ON "Supplier"("code");

-- CreateIndex
CREATE INDEX "SupplierProduct_supplierId_idx" ON "SupplierProduct"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierProduct_productId_idx" ON "SupplierProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierProduct_supplierId_productId_key" ON "SupplierProduct"("supplierId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_referenceNumber_key" ON "Project"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceNumberCounter_prefix_key" ON "ReferenceNumberCounter"("prefix");

-- CreateIndex
CREATE UNIQUE INDEX "GoodsReceipt_referenceNumber_key" ON "GoodsReceipt"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseRequisition_referenceNumber_key" ON "PurchaseRequisition"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "GoodsIssue_referenceNumber_key" ON "GoodsIssue"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FulfillmentStatus_name_key" ON "FulfillmentStatus"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleDepartment" ADD CONSTRAINT "UserRoleDepartment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleDepartment" ADD CONSTRAINT "UserRoleDepartment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleDepartment" ADD CONSTRAINT "UserRoleDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentProfile" ADD CONSTRAINT "DepartmentProfile_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentProfile" ADD CONSTRAINT "DepartmentProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "Presentation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_unitMeasureId_fkey" FOREIGN KEY ("unitMeasureId") REFERENCES "UnitMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierProduct" ADD CONSTRAINT "SupplierProduct_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierProduct" ADD CONSTRAINT "SupplierProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceipt" ADD CONSTRAINT "GoodsReceipt_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceipt" ADD CONSTRAINT "GoodsReceipt_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceipt" ADD CONSTRAINT "GoodsReceipt_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceiptDetail" ADD CONSTRAINT "GoodsReceiptDetail_goodsReceiptId_fkey" FOREIGN KEY ("goodsReceiptId") REFERENCES "GoodsReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceiptDetail" ADD CONSTRAINT "GoodsReceiptDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequisition" ADD CONSTRAINT "PurchaseRequisition_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequisition" ADD CONSTRAINT "PurchaseRequisition_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequisition" ADD CONSTRAINT "PurchaseRequisition_deliveredById_fkey" FOREIGN KEY ("deliveredById") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequisition" ADD CONSTRAINT "PurchaseRequisition_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequisition" ADD CONSTRAINT "PurchaseRequisition_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequisition" ADD CONSTRAINT "PurchaseRequisition_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequisitionDetail" ADD CONSTRAINT "PurchaseRequisitionDetail_purchaseRequisitionId_fkey" FOREIGN KEY ("purchaseRequisitionId") REFERENCES "PurchaseRequisition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequisitionDetail" ADD CONSTRAINT "PurchaseRequisitionDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssue" ADD CONSTRAINT "GoodsIssue_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssue" ADD CONSTRAINT "GoodsIssue_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssue" ADD CONSTRAINT "GoodsIssue_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssue" ADD CONSTRAINT "GoodsIssue_warehouseStaffId_fkey" FOREIGN KEY ("warehouseStaffId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssue" ADD CONSTRAINT "GoodsIssue_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssue" ADD CONSTRAINT "GoodsIssue_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssue" ADD CONSTRAINT "GoodsIssue_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssue" ADD CONSTRAINT "GoodsIssue_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssue" ADD CONSTRAINT "GoodsIssue_fulfillmentStatusId_fkey" FOREIGN KEY ("fulfillmentStatusId") REFERENCES "FulfillmentStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssueDetail" ADD CONSTRAINT "GoodsIssueDetail_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "Presentation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssueDetail" ADD CONSTRAINT "GoodsIssueDetail_unitMeasureId_fkey" FOREIGN KEY ("unitMeasureId") REFERENCES "UnitMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssueDetail" ADD CONSTRAINT "GoodsIssueDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssueDetail" ADD CONSTRAINT "GoodsIssueDetail_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssueDetail" ADD CONSTRAINT "GoodsIssueDetail_goodsIssueId_fkey" FOREIGN KEY ("goodsIssueId") REFERENCES "GoodsIssue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsIssueDetail" ADD CONSTRAINT "GoodsIssueDetail_fulfillmentStatusId_fkey" FOREIGN KEY ("fulfillmentStatusId") REFERENCES "FulfillmentStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_goodsReceiptId_fkey" FOREIGN KEY ("goodsReceiptId") REFERENCES "GoodsReceipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_goodsIssueId_fkey" FOREIGN KEY ("goodsIssueId") REFERENCES "GoodsIssue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementDetail" ADD CONSTRAINT "MovementDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementDetail" ADD CONSTRAINT "MovementDetail_goodsReceiptDetailId_fkey" FOREIGN KEY ("goodsReceiptDetailId") REFERENCES "GoodsReceiptDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementDetail" ADD CONSTRAINT "MovementDetail_goodsIssueDetailId_fkey" FOREIGN KEY ("goodsIssueDetailId") REFERENCES "GoodsIssueDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementDetail" ADD CONSTRAINT "MovementDetail_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "InventoryMovement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
