ALTER TABLE "GoodsIssueDetail" ALTER COLUMN "fulfillmentStatusId" SET NOT NULL;

ALTER TABLE "GoodsIssueDetail" DROP CONSTRAINT "GoodsIssueDetail_fulfillmentStatusId_fkey";

ALTER TABLE "GoodsIssueDetail" ADD CONSTRAINT "GoodsIssueDetail_fulfillmentStatusId_fkey"
FOREIGN KEY ("fulfillmentStatusId") REFERENCES "FulfillmentStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
