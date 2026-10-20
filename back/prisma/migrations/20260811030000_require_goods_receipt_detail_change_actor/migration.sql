ALTER TABLE "GoodsReceiptDetailChange"
DROP CONSTRAINT "GoodsReceiptDetailChange_changedById_required";

ALTER TABLE "GoodsReceiptDetailChange"
ALTER COLUMN "changedById" SET NOT NULL;
