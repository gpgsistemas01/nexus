-- Existing detail changes predate actor persistence, so the relation remains nullable.
ALTER TABLE "GoodsReceiptDetailChange"
ADD COLUMN "changedById" UUID;

CREATE INDEX "GoodsReceiptDetailChange_changedById_idx"
ON "GoodsReceiptDetailChange"("changedById");

ALTER TABLE "GoodsReceiptDetailChange"
ADD CONSTRAINT "GoodsReceiptDetailChange_changedById_fkey"
FOREIGN KEY ("changedById") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Do not permit new history rows without an actor. NOT VALID skips the scan of
-- legacy rows, which must be attributed manually before making the column NOT NULL.
ALTER TABLE "GoodsReceiptDetailChange"
ADD CONSTRAINT "GoodsReceiptDetailChange_changedById_required"
CHECK ("changedById" IS NOT NULL) NOT VALID;
