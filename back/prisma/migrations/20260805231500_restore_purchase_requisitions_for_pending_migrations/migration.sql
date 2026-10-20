-- Recreate the legacy requisition structure when an already-applied migration from
-- another branch removed it too early. This migration intentionally restores only
-- the schema: deleted business data must be recovered from a backup.
CREATE TABLE IF NOT EXISTS "PurchaseRequisition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referenceNumber" VARCHAR(50) NOT NULL,
    "approveDate" TIMESTAMP(3),
    "requestDate" TIMESTAMP(3) NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "observations" VARCHAR(500),
    "statusId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "approverId" UUID,
    "deliveredById" UUID,
    "requesterId" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PurchaseRequisition_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PurchaseRequisition_departmentId_fkey"
      FOREIGN KEY ("departmentId") REFERENCES "Department"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PurchaseRequisition_approverId_fkey"
      FOREIGN KEY ("approverId") REFERENCES "Person"("id")
      ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PurchaseRequisition_deliveredById_fkey"
      FOREIGN KEY ("deliveredById") REFERENCES "Person"("id")
      ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PurchaseRequisition_requesterId_fkey"
      FOREIGN KEY ("requesterId") REFERENCES "Person"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PurchaseRequisition_statusId_fkey"
      FOREIGN KEY ("statusId") REFERENCES "Status"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PurchaseRequisition_projectId_fkey"
      FOREIGN KEY ("projectId") REFERENCES "Project"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "PurchaseRequisitionDetail" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "materialId" UUID NOT NULL,
    "purchaseRequisitionId" UUID NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PurchaseRequisitionDetail_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PurchaseRequisitionDetail_purchaseRequisitionId_fkey"
      FOREIGN KEY ("purchaseRequisitionId") REFERENCES "PurchaseRequisition"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PurchaseRequisitionDetail_productId_fkey"
      FOREIGN KEY ("materialId") REFERENCES "Material"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "PurchaseRequisition_referenceNumber_key"
ON "PurchaseRequisition"("referenceNumber");
