ALTER TABLE "GoodsReceiptCorrection" ADD COLUMN "stockAdjustmentId" UUID;

UPDATE "GoodsReceiptCorrection" AS correction
SET "stockAdjustmentId" = link."stockAdjustmentId"
FROM (
    SELECT DISTINCT ON ("goodsReceiptCorrectionId")
        "goodsReceiptCorrectionId",
        "stockAdjustmentId"
    FROM "GoodsReceiptCorrectionAdjustment"
    ORDER BY "goodsReceiptCorrectionId", "createdAt" ASC
) AS link
WHERE correction."id" = link."goodsReceiptCorrectionId";

CREATE UNIQUE INDEX "GoodsReceiptCorrection_stockAdjustmentId_key" ON "GoodsReceiptCorrection"("stockAdjustmentId");

ALTER TABLE "GoodsReceiptCorrection"
ADD CONSTRAINT "GoodsReceiptCorrection_stockAdjustmentId_fkey"
FOREIGN KEY ("stockAdjustmentId") REFERENCES "StockAdjustment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DROP TABLE "GoodsReceiptCorrectionAdjustment";
