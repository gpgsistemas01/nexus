ALTER TABLE "Waste" ADD COLUMN "stockAdjustmentId" UUID;

CREATE UNIQUE INDEX "Waste_stockAdjustmentId_key" ON "Waste"("stockAdjustmentId");
CREATE INDEX "Waste_stockAdjustmentId_idx" ON "Waste"("stockAdjustmentId");

ALTER TABLE "Waste"
ADD CONSTRAINT "Waste_stockAdjustmentId_fkey"
FOREIGN KEY ("stockAdjustmentId") REFERENCES "StockAdjustment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
