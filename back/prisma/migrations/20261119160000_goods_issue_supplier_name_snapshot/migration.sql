ALTER TABLE "GoodsIssueDetail"
ADD COLUMN "supplierName" VARCHAR(200) NOT NULL DEFAULT '';

UPDATE "GoodsIssueDetail" AS detail
SET "supplierName" = supplier."tradeName"
FROM "Supplier" AS supplier
WHERE detail."supplierId" = supplier."id";
