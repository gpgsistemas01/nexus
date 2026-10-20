-- Drop legacy purchase return tables only when they exist in the target database.
-- The current Prisma schema does not define these models, but this keeps the
-- database cleanup explicit for environments where the tables were created before.
DROP TABLE IF EXISTS "GoodsReceiptReturnDetail" CASCADE;
DROP TABLE IF EXISTS "GoodsReceiptReturn" CASCADE;

DELETE FROM "StockAdjustmentReason" reason
WHERE reason.name = 'Devolución de compra'
  AND NOT EXISTS (
      SELECT 1
      FROM "StockAdjustment" adjustment
      WHERE adjustment."reasonId" = reason.id
  )
  AND NOT EXISTS (
      SELECT 1
      FROM "GoodsReceiptCorrection" correction
      WHERE correction."reasonId" = reason.id
  );
