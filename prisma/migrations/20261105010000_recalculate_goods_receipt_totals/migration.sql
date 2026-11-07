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

UPDATE "GoodsReceipt" AS receipt
SET
  "totalQuantity" = 0,
  "totalNetPurchaseAmount" = 0,
  "totalGrossPurchaseAmount" = 0
WHERE NOT EXISTS (
  SELECT 1
  FROM "GoodsReceiptDetail" AS detail
  WHERE detail."goodsReceiptId" = receipt."id"
    AND detail."status" = 'ACTIVE'
);
