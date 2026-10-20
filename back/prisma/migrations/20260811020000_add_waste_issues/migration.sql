CREATE TABLE "WasteIssue" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referenceNumber" VARCHAR(50) NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL,
    "observations" VARCHAR(500),
    "projectNumber" VARCHAR(10) NOT NULL,
    "departmentName" VARCHAR(50) NOT NULL,
    "requesterName" VARCHAR(255) NOT NULL,
    "clientName" VARCHAR(255) NOT NULL,
    "advisorName" VARCHAR(255) NOT NULL,
    "createdById" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "requesterId" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "advisorId" UUID NOT NULL,
    "fulfillmentStatusId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WasteIssue_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WasteIssueDetail" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wasteIssueId" UUID NOT NULL,
    "wasteId" UUID NOT NULL,
    "materialName" VARCHAR(200) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "convertedQuantity" DECIMAL(10,2) NOT NULL,
    "suppliedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "returnedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isSupplied" BOOLEAN NOT NULL DEFAULT false,
    "fulfillmentStatusId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WasteIssueDetail_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WasteIssueReturn" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wasteIssueId" UUID NOT NULL,
    "wasteIssueDetailId" UUID NOT NULL,
    "movementDetailId" UUID,
    "returnedById" UUID,
    "wasteId" UUID NOT NULL,
    "materialName" VARCHAR(200) NOT NULL,
    "currentTotalReturnedQuantity" DECIMAL(10,2) NOT NULL,
    "newTotalReturnedQuantity" DECIMAL(10,2) NOT NULL,
    "observations" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WasteIssueReturn_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "WasteMovement" ADD COLUMN "wasteIssueId" UUID;
ALTER TABLE "WasteMovementDetail" ADD COLUMN "wasteIssueDetailId" UUID;

CREATE UNIQUE INDEX "WasteIssue_referenceNumber_key" ON "WasteIssue"("referenceNumber");
CREATE INDEX "WasteIssue_createdById_idx" ON "WasteIssue"("createdById");
CREATE INDEX "WasteIssue_departmentId_idx" ON "WasteIssue"("departmentId");
CREATE INDEX "WasteIssue_requesterId_idx" ON "WasteIssue"("requesterId");
CREATE INDEX "WasteIssue_clientId_idx" ON "WasteIssue"("clientId");
CREATE INDEX "WasteIssue_advisorId_idx" ON "WasteIssue"("advisorId");
CREATE INDEX "WasteIssue_fulfillmentStatusId_idx" ON "WasteIssue"("fulfillmentStatusId");
CREATE INDEX "WasteIssue_requestDate_idx" ON "WasteIssue"("requestDate");
CREATE UNIQUE INDEX "WasteIssueDetail_wasteIssueId_wasteId_key" ON "WasteIssueDetail"("wasteIssueId", "wasteId");
CREATE INDEX "WasteIssueDetail_wasteId_idx" ON "WasteIssueDetail"("wasteId");
CREATE INDEX "WasteIssueDetail_fulfillmentStatusId_idx" ON "WasteIssueDetail"("fulfillmentStatusId");
CREATE INDEX "WasteMovement_wasteIssueId_idx" ON "WasteMovement"("wasteIssueId");
CREATE INDEX "WasteMovementDetail_wasteIssueDetailId_idx" ON "WasteMovementDetail"("wasteIssueDetailId");
CREATE UNIQUE INDEX "WasteIssueReturn_movementDetailId_key" ON "WasteIssueReturn"("movementDetailId");
CREATE INDEX "WasteIssueReturn_wasteIssueId_idx" ON "WasteIssueReturn"("wasteIssueId");
CREATE INDEX "WasteIssueReturn_wasteIssueDetailId_idx" ON "WasteIssueReturn"("wasteIssueDetailId");
CREATE INDEX "WasteIssueReturn_returnedById_idx" ON "WasteIssueReturn"("returnedById");
CREATE INDEX "WasteIssueReturn_wasteId_idx" ON "WasteIssueReturn"("wasteId");

ALTER TABLE "WasteIssue" ADD CONSTRAINT "WasteIssue_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WasteIssue" ADD CONSTRAINT "WasteIssue_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WasteIssue" ADD CONSTRAINT "WasteIssue_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WasteIssue" ADD CONSTRAINT "WasteIssue_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WasteIssue" ADD CONSTRAINT "WasteIssue_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WasteIssue" ADD CONSTRAINT "WasteIssue_fulfillmentStatusId_fkey" FOREIGN KEY ("fulfillmentStatusId") REFERENCES "FulfillmentStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WasteIssueDetail" ADD CONSTRAINT "WasteIssueDetail_wasteIssueId_fkey" FOREIGN KEY ("wasteIssueId") REFERENCES "WasteIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WasteIssueDetail" ADD CONSTRAINT "WasteIssueDetail_wasteId_fkey" FOREIGN KEY ("wasteId") REFERENCES "Waste"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WasteIssueDetail" ADD CONSTRAINT "WasteIssueDetail_fulfillmentStatusId_fkey" FOREIGN KEY ("fulfillmentStatusId") REFERENCES "FulfillmentStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WasteMovement" ADD CONSTRAINT "WasteMovement_wasteIssueId_fkey" FOREIGN KEY ("wasteIssueId") REFERENCES "WasteIssue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WasteMovementDetail" ADD CONSTRAINT "WasteMovementDetail_wasteIssueDetailId_fkey" FOREIGN KEY ("wasteIssueDetailId") REFERENCES "WasteIssueDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WasteIssueReturn" ADD CONSTRAINT "WasteIssueReturn_wasteIssueId_fkey" FOREIGN KEY ("wasteIssueId") REFERENCES "WasteIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WasteIssueReturn" ADD CONSTRAINT "WasteIssueReturn_wasteIssueDetailId_fkey" FOREIGN KEY ("wasteIssueDetailId") REFERENCES "WasteIssueDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WasteIssueReturn" ADD CONSTRAINT "WasteIssueReturn_movementDetailId_fkey" FOREIGN KEY ("movementDetailId") REFERENCES "WasteMovementDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WasteIssueReturn" ADD CONSTRAINT "WasteIssueReturn_returnedById_fkey" FOREIGN KEY ("returnedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WasteIssueReturn" ADD CONSTRAINT "WasteIssueReturn_wasteId_fkey" FOREIGN KEY ("wasteId") REFERENCES "Waste"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
