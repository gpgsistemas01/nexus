ALTER TABLE "WasteStockAdjustment"
ADD COLUMN "referenceNumber" VARCHAR(50),
ADD COLUMN "type" "StockAdjustmentType",
ADD COLUMN "status" "AdjustmentStatus" NOT NULL DEFAULT 'APPLIED',
ADD COLUMN "approvedById" UUID,
ADD COLUMN "appliedAt" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

WITH numbered AS (
    SELECT
        "id",
        ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS sequence
    FROM "WasteStockAdjustment"
)
UPDATE "WasteStockAdjustment" wsa
SET
    "referenceNumber" = CONCAT('AJU-MER-', EXTRACT(YEAR FROM wsa."createdAt")::INT, '-', LPAD(numbered.sequence::TEXT, 6, '0')),
    "type" = CASE WHEN wsa."difference" >= 0 THEN 'INCREASE'::"StockAdjustmentType" ELSE 'DECREASE'::"StockAdjustmentType" END,
    "approvedById" = wsa."createdById",
    "appliedAt" = wsa."createdAt"
FROM numbered
WHERE numbered."id" = wsa."id";

CREATE TABLE "WasteStockAdjustmentDetail" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wasteStockAdjustmentId" UUID NOT NULL,
    "wasteId" UUID NOT NULL,
    "previousStock" DECIMAL(10,2) NOT NULL,
    "newStock" DECIMAL(10,2) NOT NULL,
    "difference" DECIMAL(10,2) NOT NULL,
    "previousConvertedQuantity" DECIMAL(10,2) NOT NULL,
    "newConvertedQuantity" DECIMAL(10,2) NOT NULL,
    "convertedDifference" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WasteStockAdjustmentDetail_pkey" PRIMARY KEY ("id")
);

INSERT INTO "WasteStockAdjustmentDetail" (
    "wasteStockAdjustmentId", "wasteId",
    "previousStock", "newStock", "difference",
    "previousConvertedQuantity", "newConvertedQuantity", "convertedDifference",
    "createdAt", "updatedAt"
)
SELECT
    "id", "wasteId",
    "previousStock", "newStock", "difference",
    "previousConvertedQuantity", "newConvertedQuantity", "convertedDifference",
    "createdAt", "updatedAt"
FROM "WasteStockAdjustment";

ALTER TABLE "WasteMovementDetail"
ADD COLUMN "wasteStockAdjustmentDetailId" UUID;

UPDATE "WasteMovementDetail" wmd
SET "wasteStockAdjustmentDetailId" = wsad."id"
FROM "WasteStockAdjustmentDetail" wsad
WHERE wmd."wasteStockAdjustmentId" = wsad."wasteStockAdjustmentId"
  AND wmd."wasteId" = wsad."wasteId";

ALTER TABLE "WasteStockAdjustment"
ALTER COLUMN "referenceNumber" SET NOT NULL,
ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

CREATE UNIQUE INDEX "WasteStockAdjustment_referenceNumber_key" ON "WasteStockAdjustment"("referenceNumber");
CREATE INDEX "WasteStockAdjustment_approvedById_idx" ON "WasteStockAdjustment"("approvedById");
CREATE INDEX "WasteStockAdjustmentDetail_wasteStockAdjustmentId_idx" ON "WasteStockAdjustmentDetail"("wasteStockAdjustmentId");
CREATE INDEX "WasteStockAdjustmentDetail_wasteId_idx" ON "WasteStockAdjustmentDetail"("wasteId");
CREATE INDEX "WasteMovementDetail_wasteStockAdjustmentDetailId_idx" ON "WasteMovementDetail"("wasteStockAdjustmentDetailId");

ALTER TABLE "WasteStockAdjustment" ADD CONSTRAINT "WasteStockAdjustment_approvedById_fkey"
FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WasteStockAdjustmentDetail" ADD CONSTRAINT "WasteStockAdjustmentDetail_wasteStockAdjustmentId_fkey"
FOREIGN KEY ("wasteStockAdjustmentId") REFERENCES "WasteStockAdjustment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WasteStockAdjustmentDetail" ADD CONSTRAINT "WasteStockAdjustmentDetail_wasteId_fkey"
FOREIGN KEY ("wasteId") REFERENCES "Waste"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WasteMovementDetail" ADD CONSTRAINT "WasteMovementDetail_wasteStockAdjustmentDetailId_fkey"
FOREIGN KEY ("wasteStockAdjustmentDetailId") REFERENCES "WasteStockAdjustmentDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WasteStockAdjustment" DROP CONSTRAINT "WasteStockAdjustment_wasteId_fkey";
DROP INDEX "WasteStockAdjustment_wasteId_idx";
ALTER TABLE "WasteStockAdjustment"
DROP COLUMN "wasteId",
DROP COLUMN "previousStock",
DROP COLUMN "newStock",
DROP COLUMN "difference",
DROP COLUMN "previousConvertedQuantity",
DROP COLUMN "newConvertedQuantity",
DROP COLUMN "convertedDifference";


ALTER TABLE "WasteMovementDetail" DROP CONSTRAINT "WasteMovementDetail_wasteStockAdjustmentId_fkey";
DROP INDEX "WasteMovementDetail_wasteStockAdjustmentId_idx";
ALTER TABLE "WasteMovementDetail" DROP COLUMN "wasteStockAdjustmentId";

ALTER TABLE "WasteStockAdjustment" ADD COLUMN "wasteMovementId" UUID;
UPDATE "WasteStockAdjustment" wsa
SET "wasteMovementId" = wm."id"
FROM "WasteMovement" wm
WHERE wm."wasteStockAdjustmentId" = wsa."id";
CREATE UNIQUE INDEX "WasteStockAdjustment_wasteMovementId_key" ON "WasteStockAdjustment"("wasteMovementId");
ALTER TABLE "WasteStockAdjustment" ADD CONSTRAINT "WasteStockAdjustment_wasteMovementId_fkey"
FOREIGN KEY ("wasteMovementId") REFERENCES "WasteMovement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WasteMovement" DROP CONSTRAINT "WasteMovement_wasteStockAdjustmentId_fkey";
DROP INDEX "WasteMovement_wasteStockAdjustmentId_key";
ALTER TABLE "WasteMovement" DROP COLUMN "wasteStockAdjustmentId";
