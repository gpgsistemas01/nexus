-- Drop the duplicated free-text observations from corrections.
-- Operational observation details are stored on linked StockAdjustment records.
ALTER TABLE "GoodsReceiptCorrection" DROP COLUMN "observations";
