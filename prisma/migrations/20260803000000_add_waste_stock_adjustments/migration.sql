-- Waste stock is an independent inventory. Its adjustments are audited separately
-- and never create movements against SupplierMaterial.
CREATE TABLE "WasteStockAdjustment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wasteId" UUID NOT NULL,
    "reasonId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "observations" VARCHAR(500),
    "previousStock" DECIMAL(10,2) NOT NULL,
    "newStock" DECIMAL(10,2) NOT NULL,
    "difference" DECIMAL(10,2) NOT NULL,
    "previousConvertedQuantity" DECIMAL(10,2) NOT NULL,
    "newConvertedQuantity" DECIMAL(10,2) NOT NULL,
    "convertedDifference" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WasteStockAdjustment_pkey" PRIMARY KEY ("id")
);

-- Preserve the audit information from legacy waste links before removing the
-- relation with the general inventory adjustment table.
INSERT INTO "WasteStockAdjustment" (
    "wasteId", "reasonId", "createdById", "observations",
    "previousStock", "newStock", "difference",
    "previousConvertedQuantity", "newConvertedQuantity", "convertedDifference",
    "createdAt"
)
SELECT
    w."id", sa."reasonId", sa."createdById", sa."observations",
    0, w."currentStock", w."currentStock",
    0, w."convertedQuantity", w."convertedQuantity",
    sa."createdAt"
FROM "Waste" w
JOIN "StockAdjustment" sa ON sa."id" = w."stockAdjustmentId"
WHERE w."stockAdjustmentId" IS NOT NULL;

DROP INDEX IF EXISTS "Waste_stockAdjustmentId_idx";
DROP INDEX IF EXISTS "Waste_stockAdjustmentId_key";
ALTER TABLE "Waste" DROP CONSTRAINT IF EXISTS "Waste_stockAdjustmentId_fkey";
ALTER TABLE "Waste" DROP COLUMN "stockAdjustmentId";

CREATE INDEX "WasteStockAdjustment_wasteId_idx" ON "WasteStockAdjustment"("wasteId");
CREATE INDEX "WasteStockAdjustment_reasonId_idx" ON "WasteStockAdjustment"("reasonId");
CREATE INDEX "WasteStockAdjustment_createdById_idx" ON "WasteStockAdjustment"("createdById");

ALTER TABLE "WasteStockAdjustment" ADD CONSTRAINT "WasteStockAdjustment_wasteId_fkey"
FOREIGN KEY ("wasteId") REFERENCES "Waste"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WasteStockAdjustment" ADD CONSTRAINT "WasteStockAdjustment_reasonId_fkey"
FOREIGN KEY ("reasonId") REFERENCES "StockAdjustmentReason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WasteStockAdjustment" ADD CONSTRAINT "WasteStockAdjustment_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "WasteMovement" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referenceNumber" VARCHAR(50),
    "type" "InventoryMovementType" NOT NULL,
    "wasteStockAdjustmentId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WasteMovement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WasteMovementDetail" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quantity" DECIMAL(10,2) NOT NULL,
    "newStock" DECIMAL(10,2),
    "previousStock" DECIMAL(10,2),
    "wasteId" UUID NOT NULL,
    "wasteStockAdjustmentId" UUID,
    "movementId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WasteMovementDetail_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WasteMovement_referenceNumber_key" ON "WasteMovement"("referenceNumber");
CREATE UNIQUE INDEX "WasteMovement_wasteStockAdjustmentId_key" ON "WasteMovement"("wasteStockAdjustmentId");
CREATE INDEX "WasteMovementDetail_wasteId_idx" ON "WasteMovementDetail"("wasteId");
CREATE INDEX "WasteMovementDetail_wasteStockAdjustmentId_idx" ON "WasteMovementDetail"("wasteStockAdjustmentId");
CREATE INDEX "WasteMovementDetail_movementId_idx" ON "WasteMovementDetail"("movementId");

ALTER TABLE "WasteMovement" ADD CONSTRAINT "WasteMovement_wasteStockAdjustmentId_fkey"
FOREIGN KEY ("wasteStockAdjustmentId") REFERENCES "WasteStockAdjustment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WasteMovementDetail" ADD CONSTRAINT "WasteMovementDetail_wasteId_fkey"
FOREIGN KEY ("wasteId") REFERENCES "Waste"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WasteMovementDetail" ADD CONSTRAINT "WasteMovementDetail_wasteStockAdjustmentId_fkey"
FOREIGN KEY ("wasteStockAdjustmentId") REFERENCES "WasteStockAdjustment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WasteMovementDetail" ADD CONSTRAINT "WasteMovementDetail_movementId_fkey"
FOREIGN KEY ("movementId") REFERENCES "WasteMovement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "WasteMovement" ("id", "type", "wasteStockAdjustmentId", "date", "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'ADJUSTMENT'::"InventoryMovementType", wsa."id", wsa."createdAt", wsa."createdAt", wsa."createdAt"
FROM "WasteStockAdjustment" wsa
WHERE wsa."difference" <> 0;

INSERT INTO "WasteMovementDetail" (
    "quantity", "previousStock", "newStock", "wasteId", "wasteStockAdjustmentId", "movementId", "createdAt", "updatedAt"
)
SELECT wsa."difference", wsa."previousStock", wsa."newStock", wsa."wasteId", wsa."id", wm."id", wsa."createdAt", wsa."createdAt"
FROM "WasteStockAdjustment" wsa
JOIN "WasteMovement" wm ON wm."wasteStockAdjustmentId" = wsa."id";
