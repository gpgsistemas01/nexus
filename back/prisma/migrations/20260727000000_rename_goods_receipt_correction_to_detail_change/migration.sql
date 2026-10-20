ALTER TABLE "GoodsReceiptCorrection" RENAME TO "GoodsReceiptDetailChange";
ALTER TABLE "GoodsReceiptDetailChange" RENAME COLUMN "correctionType" TO "changeType";

CREATE TYPE "GoodsReceiptDetailChangeType" AS ENUM (
    'QUANTITY',
    'COST',
    'QUANTITY_AND_COST',
    'CANCELLATION'
);

UPDATE "GoodsReceiptDetailChange"
SET "changeType" = 'CANCELLATION'
WHERE "changeType" = 'CANCEL_DETAIL';

UPDATE "StockAdjustmentReason"
SET "name" = 'Corrección de detalle de compra',
    "updatedAt" = NOW()
WHERE "name" IN ('Corrección de compra', 'Modificación de detalle de compra');

INSERT INTO "StockAdjustmentReason" (
    id,
    name,
    "isActive",
    "createdAt",
    "updatedAt"
)
VALUES (
    gen_random_uuid(),
    'Cancelación de detalle de compra',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (name) DO UPDATE
SET
    "isActive" = true,
    "updatedAt" = NOW();

ALTER TABLE "GoodsReceiptDetailChange"
ALTER COLUMN "changeType" TYPE "GoodsReceiptDetailChangeType"
USING "changeType"::"GoodsReceiptDetailChangeType";

ALTER TABLE "GoodsReceiptDetailChange"
RENAME CONSTRAINT "GoodsReceiptCorrection_pkey" TO "GoodsReceiptDetailChange_pkey";
ALTER TABLE "GoodsReceiptDetailChange"
RENAME CONSTRAINT "GoodsReceiptCorrection_goodsReceiptId_fkey" TO "GoodsReceiptDetailChange_goodsReceiptId_fkey";
ALTER TABLE "GoodsReceiptDetailChange"
RENAME CONSTRAINT "GoodsReceiptCorrection_goodsReceiptDetailId_fkey" TO "GoodsReceiptDetailChange_goodsReceiptDetailId_fkey";
ALTER TABLE "GoodsReceiptDetailChange"
RENAME CONSTRAINT "GoodsReceiptCorrection_reasonId_fkey" TO "GoodsReceiptDetailChange_reasonId_fkey";
ALTER TABLE "GoodsReceiptDetailChange"
RENAME CONSTRAINT "GoodsReceiptCorrection_previousProductId_fkey" TO "GoodsReceiptDetailChange_previousProductId_fkey";
ALTER TABLE "GoodsReceiptDetailChange"
RENAME CONSTRAINT "GoodsReceiptCorrection_correctedProductId_fkey" TO "GoodsReceiptDetailChange_correctedProductId_fkey";
ALTER TABLE "GoodsReceiptDetailChange"
RENAME CONSTRAINT "GoodsReceiptCorrection_stockAdjustmentId_fkey" TO "GoodsReceiptDetailChange_stockAdjustmentId_fkey";

ALTER INDEX "GoodsReceiptCorrection_stockAdjustmentId_key" RENAME TO "GoodsReceiptDetailChange_stockAdjustmentId_key";
ALTER INDEX "GoodsReceiptCorrection_goodsReceiptId_idx" RENAME TO "GoodsReceiptDetailChange_goodsReceiptId_idx";
ALTER INDEX "GoodsReceiptCorrection_goodsReceiptDetailId_idx" RENAME TO "GoodsReceiptDetailChange_goodsReceiptDetailId_idx";
ALTER INDEX "GoodsReceiptCorrection_reasonId_idx" RENAME TO "GoodsReceiptDetailChange_reasonId_idx";
ALTER INDEX "GoodsReceiptCorrection_previousProductId_idx" RENAME TO "GoodsReceiptDetailChange_previousProductId_idx";
ALTER INDEX "GoodsReceiptCorrection_correctedProductId_idx" RENAME TO "GoodsReceiptDetailChange_correctedProductId_idx";
