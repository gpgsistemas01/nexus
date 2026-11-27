BEGIN;

ALTER TYPE "StockAdjustmentType" ADD VALUE 'MIXED';

ALTER TABLE "StockAdjustment"
    ALTER COLUMN "reasonId" DROP NOT NULL,
    ADD COLUMN "inventoryImportId" UUID;
ALTER TABLE "WasteStockAdjustment"
    ALTER COLUMN "reasonId" DROP NOT NULL,
    ADD COLUMN "inventoryImportId" UUID;

ALTER TABLE "StockAdjustmentDetail"
    ADD COLUMN "reasonId" UUID,
    ADD COLUMN "observations" VARCHAR(500);
ALTER TABLE "WasteStockAdjustmentDetail"
    ADD COLUMN "reasonId" UUID,
    ADD COLUMN "observations" VARCHAR(500);

UPDATE "StockAdjustmentDetail" AS detail
SET "reasonId" = document."reasonId", "observations" = document."observations"
FROM "StockAdjustment" AS document
WHERE document."id" = detail."stockAdjustmentId";

UPDATE "WasteStockAdjustmentDetail" AS detail
SET "reasonId" = document."reasonId", "observations" = document."observations"
FROM "WasteStockAdjustment" AS document
WHERE document."id" = detail."wasteStockAdjustmentId";

CREATE UNIQUE INDEX "StockAdjustment_inventoryImportId_key" ON "StockAdjustment"("inventoryImportId");
CREATE UNIQUE INDEX "WasteStockAdjustment_inventoryImportId_key" ON "WasteStockAdjustment"("inventoryImportId");
CREATE INDEX "StockAdjustmentDetail_reasonId_idx" ON "StockAdjustmentDetail"("reasonId");
CREATE INDEX "WasteStockAdjustmentDetail_reasonId_idx" ON "WasteStockAdjustmentDetail"("reasonId");

ALTER TABLE "StockAdjustment"
    ADD CONSTRAINT "StockAdjustment_inventoryImportId_fkey"
    FOREIGN KEY ("inventoryImportId") REFERENCES "InventoryImport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WasteStockAdjustment"
    ADD CONSTRAINT "WasteStockAdjustment_inventoryImportId_fkey"
    FOREIGN KEY ("inventoryImportId") REFERENCES "InventoryImport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockAdjustmentDetail"
    ADD CONSTRAINT "StockAdjustmentDetail_reasonId_fkey"
    FOREIGN KEY ("reasonId") REFERENCES "StockAdjustmentReason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WasteStockAdjustmentDetail"
    ADD CONSTRAINT "WasteStockAdjustmentDetail_reasonId_fkey"
    FOREIGN KEY ("reasonId") REFERENCES "StockAdjustmentReason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
