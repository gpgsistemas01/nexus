-- This migration may be retried after a partially provisioned deployment or may
-- run after the legacy requisition module has already been removed by another
-- branch. Keep the indexes idempotent and treat only that retired table as
-- optional.
CREATE INDEX IF NOT EXISTS "GoodsReceiptDetail_materialId_idx" ON "GoodsReceiptDetail"("materialId");

DO $migration$
BEGIN
  IF to_regclass('public."PurchaseRequisitionDetail"') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS "PurchaseRequisitionDetail_materialId_idx"
      ON "PurchaseRequisitionDetail"("materialId");
  END IF;
END
$migration$;

CREATE INDEX IF NOT EXISTS "GoodsIssueDetail_materialId_idx" ON "GoodsIssueDetail"("materialId");

CREATE INDEX IF NOT EXISTS "MovementDetail_materialId_idx" ON "MovementDetail"("materialId");

CREATE INDEX IF NOT EXISTS "StockAdjustmentDetail_materialId_idx" ON "StockAdjustmentDetail"("materialId");
