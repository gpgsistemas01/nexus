CREATE TABLE "HistoricalDeliveryBatch" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "operationId" UUID NOT NULL,
    "resource" VARCHAR(16) NOT NULL,
    "commandHash" VARCHAR(64) NOT NULL,
    "cutoffDate" TIMESTAMP(3) NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "reason" VARCHAR(500) NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoricalDeliveryBatch_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "HistoricalDeliveryBatch_resource_check" CHECK ("resource" IN ('materials', 'consumables', 'wastes')),
    CONSTRAINT "HistoricalDeliveryBatch_reason_check" CHECK (length(trim("reason")) > 0),
    CONSTRAINT "HistoricalDeliveryBatch_dates_check" CHECK ("deliveredAt" IS NULL OR "deliveredAt" <= "cutoffDate"),
    CONSTRAINT "HistoricalDeliveryBatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "HistoricalDeliveryBatch_userId_operationId_key" ON "HistoricalDeliveryBatch"("userId", "operationId");
CREATE INDEX "HistoricalDeliveryBatch_userId_createdAt_idx" ON "HistoricalDeliveryBatch"("userId", "createdAt");
ALTER TABLE "GoodsIssue" ADD COLUMN "historicalDeliveryBatchId" UUID;
ALTER TABLE "WasteIssue" ADD COLUMN "historicalDeliveryBatchId" UUID;
ALTER TABLE "GoodsIssue" ADD CONSTRAINT "GoodsIssue_historicalDeliveryBatchId_fkey" FOREIGN KEY ("historicalDeliveryBatchId") REFERENCES "HistoricalDeliveryBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WasteIssue" ADD CONSTRAINT "WasteIssue_historicalDeliveryBatchId_fkey" FOREIGN KEY ("historicalDeliveryBatchId") REFERENCES "HistoricalDeliveryBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "GoodsIssue_historicalDeliveryBatchId_idx" ON "GoodsIssue"("historicalDeliveryBatchId");
CREATE INDEX "WasteIssue_historicalDeliveryBatchId_idx" ON "WasteIssue"("historicalDeliveryBatchId");
