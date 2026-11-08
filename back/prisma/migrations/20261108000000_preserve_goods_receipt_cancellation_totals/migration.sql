BEGIN;

WITH "ActiveTotals" AS (
  SELECT
    "goodsReceiptId",
    SUM("quantity") AS "totalQuantity",
    SUM("netPurchaseAmount") AS "totalNetPurchaseAmount",
    SUM("grossPurchaseAmount") AS "totalGrossPurchaseAmount"
  FROM "GoodsReceiptDetail"
  WHERE "status" = 'ACTIVE'
  GROUP BY "goodsReceiptId"
)
UPDATE "GoodsReceipt" AS receipt
SET
  "totalQuantity" = totals."totalQuantity",
  "totalNetPurchaseAmount" = totals."totalNetPurchaseAmount",
  "totalGrossPurchaseAmount" = totals."totalGrossPurchaseAmount"
FROM "ActiveTotals" AS totals
WHERE receipt."id" = totals."goodsReceiptId";

WITH "LastCancellation" AS (
  SELECT DISTINCT ON (change."goodsReceiptId")
    change."goodsReceiptId",
    change."correctedQuantity" AS "totalQuantity",
    change."correctedNetPurchaseAmount" AS "totalNetPurchaseAmount",
    change."correctedGrossPurchaseAmount" AS "totalGrossPurchaseAmount"
  FROM "GoodsReceiptDetailChange" AS change
  WHERE change."changeType" = 'CANCELLATION'
  ORDER BY change."goodsReceiptId", change."createdAt" DESC, change."id" DESC
)
UPDATE "GoodsReceipt" AS receipt
SET
  "totalQuantity" = totals."totalQuantity",
  "totalNetPurchaseAmount" = totals."totalNetPurchaseAmount",
  "totalGrossPurchaseAmount" = totals."totalGrossPurchaseAmount"
FROM "LastCancellation" AS totals
WHERE receipt."id" = totals."goodsReceiptId"
  AND NOT EXISTS (
    SELECT 1
    FROM "GoodsReceiptDetail" AS detail
    WHERE detail."goodsReceiptId" = receipt."id"
      AND detail."status" = 'ACTIVE'
  );

COMMIT;
