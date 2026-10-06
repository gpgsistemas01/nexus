ALTER TABLE "GoodsReceipt"
ADD COLUMN "type" "MaterialType" NOT NULL DEFAULT 'MATERIAL';

UPDATE "GoodsReceipt" AS receipt
SET "type" = 'CONSUMABLE'
WHERE EXISTS (
  SELECT 1
  FROM "GoodsReceiptDetail" AS detail
  INNER JOIN "Material" AS material ON material."id" = detail."materialId"
  WHERE detail."goodsReceiptId" = receipt."id"
  GROUP BY detail."goodsReceiptId"
  HAVING BOOL_AND(material."type" = 'CONSUMABLE')
);

CREATE INDEX "GoodsReceipt_type_idx" ON "GoodsReceipt"("type");
