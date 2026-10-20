ALTER TABLE "GoodsIssueDetail" ADD COLUMN "returnedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Create an audit trail for goods issue detail returns.
CREATE TABLE "GoodsIssueReturn" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "goodsIssueId" UUID NOT NULL,
    "goodsIssueDetailId" UUID NOT NULL,
    "movementDetailId" UUID,
    "returnedById" UUID,
    "productId" UUID NOT NULL,
    "productName" VARCHAR(200) NOT NULL,
    "supplierId" UUID NOT NULL,
    "supplierName" VARCHAR(200) NOT NULL,
    "productBase" DECIMAL(10,2),
    "productHeight" DECIMAL(10,2),
    "currentTotalReturnedQuantity" DECIMAL(10,2) NOT NULL,
    "newTotalReturnedQuantity" DECIMAL(10,2) NOT NULL,
    "observations" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoodsIssueReturn_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GoodsIssueReturn_movementDetailId_key" ON "GoodsIssueReturn"("movementDetailId");
CREATE INDEX "GoodsIssueReturn_goodsIssueId_idx" ON "GoodsIssueReturn"("goodsIssueId");
CREATE INDEX "GoodsIssueReturn_goodsIssueDetailId_idx" ON "GoodsIssueReturn"("goodsIssueDetailId");
CREATE INDEX "GoodsIssueReturn_returnedById_idx" ON "GoodsIssueReturn"("returnedById");

ALTER TABLE "GoodsIssueReturn" ADD CONSTRAINT "GoodsIssueReturn_goodsIssueId_fkey" FOREIGN KEY ("goodsIssueId") REFERENCES "GoodsIssue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GoodsIssueReturn" ADD CONSTRAINT "GoodsIssueReturn_goodsIssueDetailId_fkey" FOREIGN KEY ("goodsIssueDetailId") REFERENCES "GoodsIssueDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GoodsIssueReturn" ADD CONSTRAINT "GoodsIssueReturn_movementDetailId_fkey" FOREIGN KEY ("movementDetailId") REFERENCES "MovementDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GoodsIssueReturn" ADD CONSTRAINT "GoodsIssueReturn_returnedById_fkey" FOREIGN KEY ("returnedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
