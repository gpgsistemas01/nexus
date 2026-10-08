ALTER TABLE "GoodsIssue"
ADD COLUMN "type" "MaterialType" NOT NULL DEFAULT 'MATERIAL';

UPDATE "GoodsIssue" AS issue
SET "type" = 'CONSUMABLE'
WHERE EXISTS (
  SELECT 1
  FROM "GoodsIssueDetail" AS detail
  INNER JOIN "Material" AS material ON material."id" = detail."materialId"
  WHERE detail."goodsIssueId" = issue."id"
  GROUP BY detail."goodsIssueId"
  HAVING BOOL_AND(material."type" = 'CONSUMABLE')
);

CREATE INDEX "GoodsIssue_type_idx" ON "GoodsIssue"("type");
