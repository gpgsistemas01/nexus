ALTER TABLE "GoodsReceiptDetail"
ADD COLUMN "materialType" "MaterialType",
ADD COLUMN "materialSpecification" JSONB;

ALTER TABLE "GoodsIssueDetail"
ADD COLUMN "materialType" "MaterialType",
ADD COLUMN "materialSpecification" JSONB;

ALTER TABLE "MovementDetail"
ADD COLUMN "materialType" "MaterialType",
ADD COLUMN "materialSpecification" JSONB;
