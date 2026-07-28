-- Preserve the legacy stock-adjustment link for existing records while allowing
-- new receipt corrections to point directly at their inventory movement.
ALTER TABLE "GoodsReceiptDetailChange"
ADD COLUMN "inventoryMovementId" UUID;

CREATE UNIQUE INDEX "GoodsReceiptDetailChange_inventoryMovementId_key"
ON "GoodsReceiptDetailChange"("inventoryMovementId");

ALTER TABLE "GoodsReceiptDetailChange"
ADD CONSTRAINT "GoodsReceiptDetailChange_inventoryMovementId_fkey"
FOREIGN KEY ("inventoryMovementId") REFERENCES "InventoryMovement"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
