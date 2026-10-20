CREATE TABLE "WasteStockEntry" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referenceNumber" VARCHAR(50) NOT NULL,
    "wasteId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "wasteMovementId" UUID NOT NULL,
    "materialName" VARCHAR(200) NOT NULL,
    "quantity" DECIMAL(18,6) NOT NULL,
    "previousStock" DECIMAL(18,6) NOT NULL,
    "newStock" DECIMAL(18,6) NOT NULL,
    "observations" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WasteStockEntry_pkey" PRIMARY KEY ("id")
);

INSERT INTO "WasteStockEntry" (
    "referenceNumber",
    "wasteId",
    "createdById",
    "wasteMovementId",
    "materialName",
    "quantity",
    "previousStock",
    "newStock",
    "observations",
    "createdAt",
    "updatedAt"
)
SELECT
    movement."referenceNumber",
    detail."wasteId",
    movement."createdById",
    movement."id",
    waste."name",
    detail."quantity",
    detail."previousStock",
    detail."newStock",
    movement."observations",
    movement."createdAt",
    movement."updatedAt"
FROM "WasteMovement" movement
JOIN "WasteMovementDetail" detail ON detail."movementId" = movement."id"
JOIN "Waste" waste ON waste."id" = detail."wasteId"
WHERE movement."type" = 'ENTRY'
  AND movement."referenceNumber" LIKE 'ENT-MER-%'
  AND movement."createdById" IS NOT NULL;

UPDATE "WasteMovement" movement
SET "referenceNumber" = NULL
FROM "WasteStockEntry" entry
WHERE entry."wasteMovementId" = movement."id";

CREATE UNIQUE INDEX "WasteStockEntry_referenceNumber_key" ON "WasteStockEntry"("referenceNumber");
CREATE UNIQUE INDEX "WasteStockEntry_wasteMovementId_key" ON "WasteStockEntry"("wasteMovementId");
CREATE INDEX "WasteStockEntry_wasteId_idx" ON "WasteStockEntry"("wasteId");
CREATE INDEX "WasteStockEntry_createdById_idx" ON "WasteStockEntry"("createdById");

ALTER TABLE "WasteStockEntry"
ADD CONSTRAINT "WasteStockEntry_wasteId_fkey"
FOREIGN KEY ("wasteId") REFERENCES "Waste"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WasteStockEntry"
ADD CONSTRAINT "WasteStockEntry_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WasteStockEntry"
ADD CONSTRAINT "WasteStockEntry_wasteMovementId_fkey"
FOREIGN KEY ("wasteMovementId") REFERENCES "WasteMovement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP INDEX "WasteMovement_createdById_idx";
ALTER TABLE "WasteMovement" DROP CONSTRAINT "WasteMovement_createdById_fkey";
ALTER TABLE "WasteMovement" DROP COLUMN "createdById", DROP COLUMN "observations";
