-- Preserve existing audit links before removing the correction-to-adjustment relation.
UPDATE "GoodsReceiptDetailChange" AS detail_change
SET "inventoryMovementId" = movement."id"
FROM "InventoryMovement" AS movement
WHERE detail_change."stockAdjustmentId" = movement."stockAdjustmentId"
  AND detail_change."inventoryMovementId" IS NULL;

ALTER TABLE "GoodsReceiptDetailChange"
DROP CONSTRAINT "GoodsReceiptDetailChange_stockAdjustmentId_fkey";

DROP INDEX "GoodsReceiptDetailChange_stockAdjustmentId_key";

ALTER TABLE "GoodsReceiptDetailChange"
DROP COLUMN "stockAdjustmentId";
