-- CreateTable
CREATE TABLE "GoodsReceiptCorrection" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "goodsReceiptId" UUID NOT NULL,
    "goodsReceiptDetailId" UUID NOT NULL,
    "reasonId" UUID NOT NULL,
    "observations" VARCHAR(500),
    "previousProductId" UUID NOT NULL,
    "previousProductName" VARCHAR(200) NOT NULL,
    "previousQuantity" DECIMAL(10,2) NOT NULL,
    "previousCostPerUnitType" DECIMAL(10,2) NOT NULL,
    "previousNetPurchaseAmount" DECIMAL(10,2) NOT NULL,
    "previousGrossPurchaseAmount" DECIMAL(10,2) NOT NULL,
    "correctedProductId" UUID NOT NULL,
    "correctedProductName" VARCHAR(200) NOT NULL,
    "correctedQuantity" DECIMAL(10,2) NOT NULL,
    "correctedCostPerUnitType" DECIMAL(10,2) NOT NULL,
    "correctedNetPurchaseAmount" DECIMAL(10,2) NOT NULL,
    "correctedGrossPurchaseAmount" DECIMAL(10,2) NOT NULL,
    "correctionType" VARCHAR(50) NOT NULL,
    "productChanged" BOOLEAN NOT NULL DEFAULT false,
    "quantityDifference" DECIMAL(10,2) NOT NULL,
    "costDifference" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoodsReceiptCorrection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodsReceiptCorrectionAdjustment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "goodsReceiptCorrectionId" UUID NOT NULL,
    "stockAdjustmentId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoodsReceiptCorrectionAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoodsReceiptCorrection_goodsReceiptId_idx" ON "GoodsReceiptCorrection"("goodsReceiptId");
CREATE INDEX "GoodsReceiptCorrection_goodsReceiptDetailId_idx" ON "GoodsReceiptCorrection"("goodsReceiptDetailId");
CREATE INDEX "GoodsReceiptCorrection_reasonId_idx" ON "GoodsReceiptCorrection"("reasonId");
CREATE INDEX "GoodsReceiptCorrection_previousProductId_idx" ON "GoodsReceiptCorrection"("previousProductId");
CREATE INDEX "GoodsReceiptCorrection_correctedProductId_idx" ON "GoodsReceiptCorrection"("correctedProductId");
CREATE INDEX "GoodsReceiptCorrectionAdjustment_goodsReceiptCorrectionId_idx" ON "GoodsReceiptCorrectionAdjustment"("goodsReceiptCorrectionId");
CREATE INDEX "GoodsReceiptCorrectionAdjustment_stockAdjustmentId_idx" ON "GoodsReceiptCorrectionAdjustment"("stockAdjustmentId");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "GoodsReceiptCorrectionAdjustment_goodsReceiptCorrectionId_stockAdjustmentId_key" ON "GoodsReceiptCorrectionAdjustment"("goodsReceiptCorrectionId", "stockAdjustmentId");

-- AddForeignKey
ALTER TABLE "GoodsReceiptCorrection" ADD CONSTRAINT "GoodsReceiptCorrection_goodsReceiptId_fkey" FOREIGN KEY ("goodsReceiptId") REFERENCES "GoodsReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GoodsReceiptCorrection" ADD CONSTRAINT "GoodsReceiptCorrection_goodsReceiptDetailId_fkey" FOREIGN KEY ("goodsReceiptDetailId") REFERENCES "GoodsReceiptDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GoodsReceiptCorrection" ADD CONSTRAINT "GoodsReceiptCorrection_reasonId_fkey" FOREIGN KEY ("reasonId") REFERENCES "StockAdjustmentReason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GoodsReceiptCorrection" ADD CONSTRAINT "GoodsReceiptCorrection_previousProductId_fkey" FOREIGN KEY ("previousProductId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GoodsReceiptCorrection" ADD CONSTRAINT "GoodsReceiptCorrection_correctedProductId_fkey" FOREIGN KEY ("correctedProductId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GoodsReceiptCorrectionAdjustment" ADD CONSTRAINT "GoodsReceiptCorrectionAdjustment_goodsReceiptCorrectionId_fkey" FOREIGN KEY ("goodsReceiptCorrectionId") REFERENCES "GoodsReceiptCorrection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GoodsReceiptCorrectionAdjustment" ADD CONSTRAINT "GoodsReceiptCorrectionAdjustment_stockAdjustmentId_fkey" FOREIGN KEY ("stockAdjustmentId") REFERENCES "StockAdjustment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed correction reason used by goods receipt corrections.
INSERT INTO "StockAdjustmentReason" (
    id,
    name,
    "isActive",
    "createdAt",
    "updatedAt"
)
VALUES (
    gen_random_uuid(),
    'Corrección de compra',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (name) DO UPDATE
SET
    "isActive" = true,
    "updatedAt" = NOW();
